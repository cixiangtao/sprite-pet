import {
  PetBehaviorMachine,
  type BehaviorEvent,
  type BehaviorMachineConfig,
  type BehaviorSnapshot,
} from "./behavior-machine.js";
import { CssSpriteRenderer } from "./css-sprite-renderer.js";
import {
  getPetScaleForSize,
  getRenderedPetSize,
  normalizePetScale,
  type PetSizeConstraint,
  type RenderedPetSize,
} from "./pet-size.js";
import type { PetBehavior, UnifiedPetSpec } from "./runtime-types.js";

/** Options for connecting semantic behavior to DOM interaction and CSS rendering. */
export interface PetRuntimeOptions {
  spec: UnifiedPetSpec;
  interactionElement: HTMLElement;
  spriteElement: HTMLElement;
  behavior?: Partial<BehaviorMachineConfig>;
  onStateChange?: (snapshot: BehaviorSnapshot) => void;
  onDragMove?: (movement: { deltaX: number; deltaY: number }) => void;
  reducedMotion?: boolean;
  /** Initial proportional size. @defaultValue 1 */
  scale?: number;
}

interface PointerPosition {
  x: number;
  y: number;
}

interface ElementSize {
  width: number;
  height: number;
}

const interactionBaseSizes = new WeakMap<HTMLElement, ElementSize>();

const getInteractionBaseSize = (element: HTMLElement, fallback: ElementSize) => {
  const storedSize = interactionBaseSizes.get(element);
  if (storedSize !== undefined) return storedSize;

  const width = element.offsetWidth > 0 ? element.offsetWidth : fallback.width;
  const height = element.offsetHeight > 0 ? element.offsetHeight : fallback.height;
  const size = { width, height };
  interactionBaseSizes.set(element, size);
  return size;
};

/** Connects pointer input, autonomous behavior, and the CSS sprite renderer. */
export class PetRuntime {
  readonly #options: PetRuntimeOptions;
  readonly #machine: PetBehaviorMachine;
  readonly #renderer: CssSpriteRenderer;
  readonly #document: Document;
  readonly #abortController = new AbortController();
  #animationFrame: number | undefined;
  #lastBehavior: PetBehavior | undefined;
  #pointerDownAt: PointerPosition | undefined;
  #lastPointer: PointerPosition | undefined;
  #dragging = false;
  #suppressNextClick = false;
  #scale = 1;
  readonly #interactionBaseSize: ElementSize;

  constructor(options: PetRuntimeOptions) {
    this.#options = options;
    this.#document = options.interactionElement.ownerDocument;
    this.#machine = new PetBehaviorMachine({
      startedAt: performance.now(),
      ...(options.behavior === undefined ? {} : { config: options.behavior }),
    });
    this.#renderer = new CssSpriteRenderer(options.spriteElement, options.spec);
    this.#interactionBaseSize = getInteractionBaseSize(options.interactionElement, {
      width: options.spec.source.grid.frameWidth,
      height: options.spec.source.grid.frameHeight,
    });
    this.setScale(options.scale ?? 1);
    this.#bindEvents();
  }

  /** Starts autonomous behavior and rendering. */
  start() {
    if (this.#animationFrame !== undefined) return;
    this.#animationFrame = requestAnimationFrame(this.#render);
  }

  /** Stops rendering while preserving the current pose and listeners. */
  stop() {
    if (this.#animationFrame === undefined) return;
    cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = undefined;
  }

  /** Stops rendering and removes every listener owned by the runtime. */
  destroy() {
    this.stop();
    this.#abortController.abort();
  }

  /** Triggers an explicit semantic behavior without exposing a source-state name. */
  trigger(behavior: PetBehavior, durationMs?: number) {
    const event: BehaviorEvent = {
      type: "trigger",
      behavior,
      ...(durationMs === undefined ? {} : { durationMs }),
    };
    const snapshot = this.#machine.dispatch(event, performance.now());
    this.#notify(snapshot);
  }

  /** Returns the current behavior snapshot without advancing time. */
  get snapshot() {
    return this.#machine.snapshot;
  }

  /** Current proportional scale relative to the source frame size. */
  get scale() {
    return this.#scale;
  }

  /** Current rendered frame dimensions in CSS pixels. */
  get size(): RenderedPetSize {
    return getRenderedPetSize(this.#scale, this.#options.spec.source.grid);
  }

  /** Applies a proportional scale immediately, including after the runtime has started. */
  setScale(scale: number): RenderedPetSize {
    this.#scale = normalizePetScale(scale);
    this.#options.interactionElement.style.width = `${this.#interactionBaseSize.width * this.#scale}px`;
    this.#options.interactionElement.style.height = `${this.#interactionBaseSize.height * this.#scale}px`;
    this.#options.spriteElement.style.scale = String(this.#scale);
    return this.size;
  }

  /** Fits the rendered pet to a width, height, or bounding box while preserving aspect ratio. */
  setSize(size: PetSizeConstraint): RenderedPetSize {
    return this.setScale(getPetScaleForSize(size, this.#options.spec.source.grid));
  }

  #bindEvents() {
    const signal = this.#abortController.signal;
    const target = this.#options.interactionElement;
    target.addEventListener("pointerenter", () => this.#dispatch({ type: "pointer-enter" }), {
      signal,
    });
    target.addEventListener("pointerleave", () => this.#dispatch({ type: "pointer-leave" }), {
      signal,
    });
    target.addEventListener("pointerdown", this.#onPointerDown, { signal });
    target.addEventListener("click", this.#onClick, { signal });
    this.#document.addEventListener("pointermove", this.#onPointerMove, { signal });
    this.#document.addEventListener("pointerup", this.#onPointerUp, { signal });
  }

  #dispatch(event: BehaviorEvent) {
    const snapshot = this.#machine.dispatch(event, performance.now());
    this.#notify(snapshot);
  }

  #onPointerDown = (event: PointerEvent) => {
    this.#pointerDownAt = { x: event.clientX, y: event.clientY };
    this.#lastPointer = this.#pointerDownAt;
    this.#dispatch({ type: "pointer-down" });
  };

  #onPointerMove = (event: PointerEvent) => {
    const rect = this.#options.interactionElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const lookX = (event.clientX - centerX) / Math.max(1, rect.width);
    const lookY = (event.clientY - centerY) / Math.max(1, rect.height);
    const velocityX = this.#lastPointer === undefined ? 0 : event.clientX - this.#lastPointer.x;

    if (this.#pointerDownAt !== undefined && this.#lastPointer !== undefined) {
      const distance = Math.hypot(
        event.clientX - this.#pointerDownAt.x,
        event.clientY - this.#pointerDownAt.y,
      );
      if (!this.#dragging && distance >= 4) {
        this.#dragging = true;
        this.#suppressNextClick = true;
        this.#dispatch({ type: "drag-start", facing: velocityX < 0 ? "left" : "right" });
      }
      if (this.#dragging) {
        this.#options.onDragMove?.({
          deltaX: event.clientX - this.#lastPointer.x,
          deltaY: event.clientY - this.#lastPointer.y,
        });
      }
    }

    this.#lastPointer = { x: event.clientX, y: event.clientY };
    this.#dispatch({ type: "pointer-move", lookX, lookY, velocityX });
  };

  #onPointerUp = () => {
    if (this.#dragging) {
      this.#dispatch({ type: "drag-end" });
      setTimeout(() => {
        this.#suppressNextClick = false;
      }, 0);
    } else {
      this.#dispatch({ type: "pointer-up" });
    }
    this.#pointerDownAt = undefined;
    this.#lastPointer = undefined;
    this.#dragging = false;
  };

  #onClick = () => {
    if (this.#suppressNextClick) {
      this.#suppressNextClick = false;
      return;
    }
    this.#dispatch({ type: "trigger", behavior: "click" });
  };

  #render = (now: number) => {
    const snapshot = this.#machine.tick(now);
    this.#renderer.render(snapshot, now, this.#options.reducedMotion ?? false);
    this.#notify(snapshot);
    this.#animationFrame = requestAnimationFrame(this.#render);
  };

  #notify(snapshot: BehaviorSnapshot) {
    if (snapshot.behavior === this.#lastBehavior) return;
    this.#lastBehavior = snapshot.behavior;
    this.#options.onStateChange?.(snapshot);
  }
}
