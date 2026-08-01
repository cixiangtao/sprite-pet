import { SPRITE_PET_LAYOUT } from "./constants.js";
import { SpritePetRenderer } from "./renderer.js";
import type {
  SpritePetFloatingOptions,
  SpritePetPosition,
  SpritePetState,
  SpritePetWidgetOptions,
  SpritePetWidgetSnapshot,
} from "./types.js";

const DEFAULT_FLOATING_OPTIONS = {
  draggable: true,
  resizable: true,
  minWidth: 96,
  maxWidth: 576,
  viewportMargin: 16,
  zIndex: 2_147_483_000,
} as const satisfies Required<Omit<SpritePetFloatingOptions, "position">>;

interface ResolvedFloatingOptions {
  draggable: boolean;
  resizable: boolean;
  minWidth: number;
  maxWidth: number;
  viewportMargin: number;
  zIndex: number;
}

interface PointerGesture {
  kind: "drag" | "resize";
  pointerId: number;
  clientX: number;
  clientY: number;
  x: number;
  y: number;
  width: number;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const assertPositiveFinite = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
};

const resolveFloatingOptions = (
  current: ResolvedFloatingOptions,
  options: SpritePetFloatingOptions,
): ResolvedFloatingOptions => {
  const resolved = { ...current, ...options };
  assertPositiveFinite(resolved.minWidth, "Floating minimum width");
  assertPositiveFinite(resolved.maxWidth, "Floating maximum width");
  if (resolved.minWidth > resolved.maxWidth) {
    throw new RangeError("Floating minimum width cannot be greater than its maximum width.");
  }
  if (!Number.isFinite(resolved.viewportMargin) || resolved.viewportMargin < 0) {
    throw new RangeError("Floating viewport margin must be a non-negative finite number.");
  }
  if (!Number.isInteger(resolved.zIndex)) {
    throw new RangeError("Floating z-index must be an integer.");
  }

  return {
    draggable: resolved.draggable,
    resizable: resolved.resizable,
    minWidth: resolved.minWidth,
    maxWidth: resolved.maxWidth,
    viewportMargin: resolved.viewportMargin,
    zIndex: resolved.zIndex,
  };
};

/**
 * Mounts a sprite renderer into a DOM host that can optionally float above the viewport.
 *
 * Floating mode is opt-in and can be changed at runtime. Pointer dragging uses the initial widget
 * geometry plus the pointer delta, while resizing preserves the configured canvas aspect ratio.
 * Destroying the widget removes every listener and restores a caller-provided canvas to its
 * original DOM position and inline style.
 */
export class SpritePetWidget {
  readonly canvas: HTMLCanvasElement;

  readonly element: HTMLDivElement;

  readonly resizeHandle: HTMLButtonElement;

  readonly renderer: SpritePetRenderer;

  /** Decoded source rendered by this widget. */
  get source() {
    return this.renderer.source;
  }

  readonly #ownsCanvas: boolean;

  readonly #originalParent: ParentNode | null;

  readonly #originalNextSibling: ChildNode | null;

  readonly #originalCanvasStyle: string | null;

  readonly #aspectRatio: number;

  #floatingOptions: ResolvedFloatingOptions = { ...DEFAULT_FLOATING_OPTIONS };

  #floating = false;

  #position: SpritePetPosition = { x: 0, y: 0 };

  #hasPosition = false;

  #width: number;

  #height: number;

  #gesture: PointerGesture | null = null;

  #handleHovered = false;

  #handleFocused = false;

  #destroyed = false;

  constructor(options: SpritePetWidgetOptions) {
    const {
      canvas = document.createElement("canvas"),
      container,
      floating = false,
      ...renderer
    } = options;
    const width = renderer.width ?? SPRITE_PET_LAYOUT.cellWidth;
    const height =
      renderer.height ?? (width * SPRITE_PET_LAYOUT.cellHeight) / SPRITE_PET_LAYOUT.cellWidth;
    assertPositiveFinite(width, "Widget width");
    assertPositiveFinite(height, "Widget height");

    this.canvas = canvas;
    this.#ownsCanvas = options.canvas === undefined;
    this.#originalParent = canvas.parentNode;
    this.#originalNextSibling = canvas.nextSibling;
    this.#originalCanvasStyle = canvas.getAttribute("style");
    this.#width = width;
    this.#height = height;
    this.#aspectRatio = width / height;

    this.element = document.createElement("div");
    this.element.className = "sprite-pet-widget";
    this.element.dataset.floating = "false";
    this.element.style.boxSizing = "border-box";
    this.element.style.display = "inline-block";
    this.element.style.lineHeight = "0";
    this.element.style.position = "relative";

    const target = container ?? canvas.parentElement ?? document.body;
    if (canvas.parentNode === target) target.insertBefore(this.element, canvas);
    else target.append(this.element);
    this.element.append(canvas);

    canvas.style.display = "block";
    canvas.style.maxWidth = "none";
    canvas.style.userSelect = "none";
    canvas.style.webkitUserSelect = "none";

    this.resizeHandle = document.createElement("button");
    this.resizeHandle.className = "sprite-pet-widget__resize-handle";
    this.resizeHandle.type = "button";
    this.resizeHandle.setAttribute("aria-label", "Resize pet");
    this.resizeHandle.setAttribute("role", "slider");
    this.resizeHandle.setAttribute("aria-orientation", "horizontal");
    this.resizeHandle.style.background =
      "linear-gradient(135deg, transparent 0 42%, currentColor 43% 49%, transparent 50% 60%, currentColor 61% 67%, transparent 68%)";
    this.resizeHandle.style.border = "0";
    this.resizeHandle.style.bottom = "0";
    this.resizeHandle.style.color = "rgba(255, 255, 255, 0.88)";
    this.resizeHandle.style.cursor = "nwse-resize";
    this.resizeHandle.style.display = "none";
    this.resizeHandle.style.height = "28px";
    this.resizeHandle.style.opacity = "0";
    this.resizeHandle.style.padding = "0";
    this.resizeHandle.style.position = "absolute";
    this.resizeHandle.style.right = "0";
    this.resizeHandle.style.transition = "opacity 120ms ease-out";
    this.resizeHandle.style.width = "28px";
    this.element.append(this.resizeHandle);

    this.renderer = new SpritePetRenderer({ ...renderer, canvas });
    this.#applySize(width);
    this.#attachListeners();
    this.setFloating(floating);
  }

  /** Enables, disables, or reconfigures floating behavior without recreating the renderer. */
  setFloating(value: boolean | SpritePetFloatingOptions) {
    this.#assertActive();
    const enabled = value !== false;
    if (typeof value === "object") {
      this.#floatingOptions = resolveFloatingOptions(this.#floatingOptions, value);
      if (value.position !== undefined) {
        this.#assertPosition(value.position);
        this.#position = { ...value.position };
        this.#hasPosition = true;
      }
    }

    if (!enabled) {
      this.#floating = false;
      this.#finishGesture();
      globalThis.removeEventListener("resize", this.#handleViewportResize);
      this.element.dataset.floating = "false";
      this.element.style.cursor = "";
      this.element.style.left = "";
      this.element.style.position = "relative";
      this.element.style.top = "";
      this.element.style.touchAction = "";
      this.element.style.transform = "";
      this.element.style.willChange = "";
      this.element.style.zIndex = "";
      this.resizeHandle.style.display = "none";
      this.#updateHandleVisibility();
      return;
    }

    this.#floating = true;
    this.element.dataset.floating = "true";
    this.element.style.cursor = this.#floatingOptions.draggable ? "move" : "";
    this.element.style.left = "0";
    this.element.style.position = "fixed";
    this.element.style.top = "0";
    this.element.style.touchAction = "none";
    this.element.style.willChange = "transform";
    this.element.style.zIndex = String(this.#floatingOptions.zIndex);
    this.resizeHandle.style.display = this.#floatingOptions.resizable ? "block" : "none";

    this.#applySize(this.#width);
    if (!this.#hasPosition) {
      const margin = this.#floatingOptions.viewportMargin;
      this.#position = {
        x: globalThis.innerWidth - this.#width - margin,
        y: globalThis.innerHeight - this.#height - margin,
      };
      this.#hasPosition = true;
    }
    this.#applyPosition(this.#position.x, this.#position.y);
    globalThis.removeEventListener("resize", this.#handleViewportResize);
    globalThis.addEventListener("resize", this.#handleViewportResize);
    this.#updateHandleAccessibility();
  }

  /** Moves a floating pet to a viewport-relative point, constrained to the configured margin. */
  moveTo(x: number, y: number) {
    this.#assertActive();
    this.#assertPosition({ x, y });
    this.#position = this.#floating ? this.#constrainPosition(x, y) : { x, y };
    this.#hasPosition = true;
    if (this.#floating) this.#renderPosition();
  }

  /** Resizes the widget in CSS pixels while preserving its initial aspect ratio. */
  resize(width: number) {
    this.#assertActive();
    assertPositiveFinite(width, "Widget width");
    this.#applySize(width);
    if (this.#floating) this.#applyPosition(this.#position.x, this.#position.y);
  }

  /** Changes the active standard animation. */
  setState(state: SpritePetState) {
    this.renderer.setState(state);
  }

  /** Starts or resumes playback. */
  play() {
    this.renderer.play();
  }

  /** Pauses playback while keeping the current frame visible. */
  pause() {
    this.renderer.pause();
  }

  /** Points a v2 pet toward a viewport coordinate. */
  lookAt(clientX: number, clientY: number) {
    return this.renderer.lookAt(clientX, clientY);
  }

  /** Selects a v2 look pose in clockwise degrees where zero points up. */
  setLookDirection(degrees: number) {
    return this.renderer.setLookDirection(degrees);
  }

  /** Returns from a v2 look pose to the current standard animation. */
  clearLookDirection() {
    this.renderer.clearLookDirection();
  }

  /** Returns the combined renderer, size, position, and mode state. */
  getSnapshot(): SpritePetWidgetSnapshot {
    return {
      ...this.renderer.getSnapshot(),
      floating: this.#floating,
      position: { ...this.#position },
      width: this.#width,
      height: this.#height,
    };
  }

  /** Stops playback, removes listeners and owned DOM, and restores a caller-provided canvas. */
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#finishGesture();
    globalThis.removeEventListener("resize", this.#handleViewportResize);
    this.#detachListeners();
    this.renderer.destroy();

    if (this.#ownsCanvas) {
      this.element.remove();
      return;
    }

    if (this.#originalCanvasStyle === null) this.canvas.removeAttribute("style");
    else this.canvas.setAttribute("style", this.#originalCanvasStyle);
    if (this.#originalParent !== null) {
      if (this.#originalNextSibling?.parentNode === this.#originalParent) {
        this.#originalParent.insertBefore(this.canvas, this.#originalNextSibling);
      } else {
        this.#originalParent.append(this.canvas);
      }
    } else {
      this.canvas.remove();
    }
    this.element.remove();
  }

  #attachListeners() {
    this.element.addEventListener("pointerdown", this.#handlePointerDown);
    this.element.addEventListener("pointermove", this.#handlePointerMove);
    this.element.addEventListener("pointerup", this.#handlePointerEnd);
    this.element.addEventListener("pointercancel", this.#handlePointerEnd);
    this.element.addEventListener("lostpointercapture", this.#handlePointerEnd);
    this.element.addEventListener("pointerenter", this.#handlePointerEnter);
    this.element.addEventListener("pointerleave", this.#handlePointerLeave);
    this.element.addEventListener("dragstart", this.#preventDragStart);
    this.resizeHandle.addEventListener("pointerdown", this.#handleResizePointerDown);
    this.resizeHandle.addEventListener("keydown", this.#handleResizeKeyDown);
    this.resizeHandle.addEventListener("focus", this.#handleResizeFocus);
    this.resizeHandle.addEventListener("blur", this.#handleResizeBlur);
  }

  #detachListeners() {
    this.element.removeEventListener("pointerdown", this.#handlePointerDown);
    this.element.removeEventListener("pointermove", this.#handlePointerMove);
    this.element.removeEventListener("pointerup", this.#handlePointerEnd);
    this.element.removeEventListener("pointercancel", this.#handlePointerEnd);
    this.element.removeEventListener("lostpointercapture", this.#handlePointerEnd);
    this.element.removeEventListener("pointerenter", this.#handlePointerEnter);
    this.element.removeEventListener("pointerleave", this.#handlePointerLeave);
    this.element.removeEventListener("dragstart", this.#preventDragStart);
    this.resizeHandle.removeEventListener("pointerdown", this.#handleResizePointerDown);
    this.resizeHandle.removeEventListener("keydown", this.#handleResizeKeyDown);
    this.resizeHandle.removeEventListener("focus", this.#handleResizeFocus);
    this.resizeHandle.removeEventListener("blur", this.#handleResizeBlur);
  }

  #applySize(width: number) {
    const constrainedWidth = this.#floating ? this.#constrainWidth(width) : width;
    this.#width = constrainedWidth;
    this.#height = constrainedWidth / this.#aspectRatio;
    this.element.style.width = `${this.#width}px`;
    this.element.style.height = `${this.#height}px`;
    this.renderer.resize(this.#width, this.#height);
    this.#updateHandleAccessibility();
  }

  #constrainWidth(width: number) {
    const margin = this.#floatingOptions.viewportMargin;
    const availableWidth = Math.max(1, globalThis.innerWidth - margin * 2);
    const availableByHeight = Math.max(1, globalThis.innerHeight - margin * 2) * this.#aspectRatio;
    const maximum = Math.min(this.#floatingOptions.maxWidth, availableWidth, availableByHeight);
    const minimum = Math.min(this.#floatingOptions.minWidth, maximum);
    return clamp(width, minimum, maximum);
  }

  #constrainPosition(x: number, y: number): SpritePetPosition {
    const margin = this.#floatingOptions.viewportMargin;
    return {
      x: clamp(x, margin, Math.max(margin, globalThis.innerWidth - this.#width - margin)),
      y: clamp(y, margin, Math.max(margin, globalThis.innerHeight - this.#height - margin)),
    };
  }

  #applyPosition(x: number, y: number) {
    this.#position = this.#constrainPosition(x, y);
    this.#renderPosition();
  }

  #renderPosition() {
    this.element.style.transform = `translate3d(${this.#position.x}px, ${this.#position.y}px, 0)`;
  }

  #updateHandleAccessibility() {
    this.resizeHandle.setAttribute("aria-valuemin", String(this.#floatingOptions.minWidth));
    this.resizeHandle.setAttribute("aria-valuemax", String(this.#floatingOptions.maxWidth));
    this.resizeHandle.setAttribute("aria-valuenow", String(Math.round(this.#width)));
    this.resizeHandle.setAttribute("aria-valuetext", `${Math.round(this.#width)} pixels wide`);
  }

  #updateHandleVisibility() {
    const visible =
      this.#floating &&
      this.#floatingOptions.resizable &&
      (this.#handleHovered || this.#handleFocused || this.#gesture?.kind === "resize");
    this.resizeHandle.style.opacity = visible ? "1" : "0";
  }

  #assertPosition(position: SpritePetPosition) {
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
      throw new RangeError("Floating position coordinates must be finite numbers.");
    }
  }

  #assertActive() {
    if (this.#destroyed) throw new Error("Cannot use a destroyed sprite pet widget.");
  }

  #finishGesture() {
    if (this.#gesture === null) return;
    const pointerId = this.#gesture.pointerId;
    this.#gesture = null;
    delete this.element.dataset.interaction;
    if (this.element.hasPointerCapture(pointerId)) this.element.releasePointerCapture(pointerId);
    this.#updateHandleVisibility();
  }

  readonly #handlePointerDown = (event: PointerEvent) => {
    if (
      !this.#floating ||
      !this.#floatingOptions.draggable ||
      event.target === this.resizeHandle ||
      event.button !== 0 ||
      !event.isPrimary
    ) {
      return;
    }

    event.preventDefault();
    this.#gesture = {
      kind: "drag",
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: this.#position.x,
      y: this.#position.y,
      width: this.#width,
    };
    this.element.dataset.interaction = "dragging";
    this.element.setPointerCapture(event.pointerId);
  };

  readonly #handleResizePointerDown = (event: PointerEvent) => {
    if (
      !this.#floating ||
      !this.#floatingOptions.resizable ||
      event.button !== 0 ||
      !event.isPrimary
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.#gesture = {
      kind: "resize",
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: this.#position.x,
      y: this.#position.y,
      width: this.#width,
    };
    this.element.dataset.interaction = "resizing";
    this.element.setPointerCapture(event.pointerId);
    this.#updateHandleVisibility();
  };

  readonly #handlePointerMove = (event: PointerEvent) => {
    const gesture = this.#gesture;
    if (gesture === null || gesture.pointerId !== event.pointerId) return;

    event.preventDefault();
    const deltaX = event.clientX - gesture.clientX;
    const deltaY = event.clientY - gesture.clientY;
    if (gesture.kind === "drag") {
      this.#applyPosition(gesture.x + deltaX, gesture.y + deltaY);
      return;
    }

    const widthDelta = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX : deltaY * this.#aspectRatio;
    this.#applySize(gesture.width + widthDelta);
    this.#applyPosition(this.#position.x, this.#position.y);
  };

  readonly #handlePointerEnd = (event: PointerEvent) => {
    if (this.#gesture?.pointerId === event.pointerId) this.#finishGesture();
  };

  readonly #handleResizeKeyDown = (event: KeyboardEvent) => {
    if (!this.#floating || !this.#floatingOptions.resizable) return;
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (direction === 0) return;

    event.preventDefault();
    this.resize(this.#width + direction * (event.shiftKey ? 32 : 8));
  };

  readonly #handlePointerEnter = () => {
    this.#handleHovered = true;
    this.#updateHandleVisibility();
  };

  readonly #handlePointerLeave = () => {
    this.#handleHovered = false;
    this.#updateHandleVisibility();
  };

  readonly #handleResizeFocus = () => {
    this.#handleFocused = true;
    this.#updateHandleVisibility();
  };

  readonly #handleResizeBlur = () => {
    this.#handleFocused = false;
    this.#updateHandleVisibility();
  };

  readonly #handleViewportResize = () => {
    this.#applySize(this.#width);
    this.#applyPosition(this.#position.x, this.#position.y);
  };

  readonly #preventDragStart = (event: DragEvent) => {
    event.preventDefault();
  };
}
