import { DEFAULT_ANIMATIONS, LOOK_DIRECTION_STEP, SPRITE_PET_LAYOUT } from "./constants.js";
import { getLookCell, getLookDegrees, getLookDirectionIndex } from "./direction.js";
import type {
  SpriteAnimationDefinition,
  SpritePetFit,
  SpritePetRendererOptions,
  SpritePetSnapshot,
  SpritePetState,
} from "./types.js";

const getPixelRatio = () => Math.max(1, globalThis.devicePixelRatio ?? 1);

const mergeAnimations = (
  overrides: SpritePetRendererOptions["animations"],
): Record<SpritePetState, SpriteAnimationDefinition> => {
  const entries = Object.entries(DEFAULT_ANIMATIONS).map(([state, definition]) => {
    const merged = { ...definition, ...overrides?.[state as SpritePetState] };
    if (!Number.isInteger(merged.row) || merged.row < 0 || merged.row >= 9) {
      throw new RangeError(`Animation "${state}" row must be an integer from 0 through 8.`);
    }
    if (
      !Number.isInteger(merged.frameCount) ||
      merged.frameCount < 1 ||
      merged.frameCount > SPRITE_PET_LAYOUT.columns
    ) {
      throw new RangeError(`Animation "${state}" frame count must be from 1 through 8.`);
    }
    if (!Number.isFinite(merged.fps) || merged.fps <= 0) {
      throw new RangeError(`Animation "${state}" FPS must be a positive finite number.`);
    }

    return [state, merged];
  });

  return Object.fromEntries(entries) as Record<SpritePetState, SpriteAnimationDefinition>;
};

/**
 * Renders a decoded animated pet into an existing canvas.
 *
 * The renderer owns canvas dimensions and its animation frame, but never removes the canvas or
 * attaches global input listeners. Call {@link destroy} when the instance is no longer needed.
 */
export class SpritePetRenderer {
  readonly canvas: HTMLCanvasElement;

  readonly source: SpritePetRendererOptions["source"];

  readonly #context: CanvasRenderingContext2D;

  readonly #animations: Record<SpritePetState, SpriteAnimationDefinition>;

  readonly #pixelRatio: number;

  readonly #fit: SpritePetFit;

  readonly #imageSmoothing: boolean;

  #width: number;

  #height: number;

  #state: SpritePetState;

  #frame = 0;

  #playing = false;

  #animationFrame: number | null = null;

  #lastFrameAt: number | null = null;

  #lookDirection: number | null = null;

  constructor(options: SpritePetRendererOptions) {
    const context = options.canvas.getContext("2d");
    if (context === null) {
      throw new Error("A 2D canvas context is required to render a sprite pet.");
    }

    this.canvas = options.canvas;
    this.source = options.source;
    this.#context = context;
    this.#animations = mergeAnimations(options.animations);
    this.#pixelRatio = options.pixelRatio ?? getPixelRatio();
    this.#fit = options.fit ?? "contain";
    this.#imageSmoothing = options.imageSmoothing ?? true;
    this.#width = options.width ?? SPRITE_PET_LAYOUT.cellWidth;
    this.#height = options.height ?? SPRITE_PET_LAYOUT.cellHeight;
    this.#state = options.initialState ?? "idle";
    if (!Number.isFinite(this.#pixelRatio) || this.#pixelRatio <= 0) {
      throw new RangeError("Pixel ratio must be a positive finite number.");
    }

    this.resize(this.#width, this.#height);
    if (options.autoplay ?? true) this.play();
  }

  /** Changes the active standard animation and resets it to its first frame. */
  setState(state: SpritePetState) {
    this.#state = state;
    this.#frame = 0;
    this.#lastFrameAt = null;
    this.#lookDirection = null;
    this.render();
  }

  /** Starts or resumes standard animation playback. */
  play() {
    if (this.#playing) return;

    this.#playing = true;
    this.#lastFrameAt = null;
    this.#animationFrame = requestAnimationFrame(this.#tick);
  }

  /** Pauses playback while keeping the current frame visible. */
  pause() {
    this.#playing = false;
    if (this.#animationFrame !== null) cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = null;
    this.#lastFrameAt = null;
  }

  /** Resizes the canvas in CSS pixels and updates its high-DPI backing store. */
  resize(
    width: number,
    height = (width * SPRITE_PET_LAYOUT.cellHeight) / SPRITE_PET_LAYOUT.cellWidth,
  ) {
    if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
      throw new RangeError("Canvas width and height must be positive finite numbers.");
    }

    this.#width = width;
    this.#height = height;
    this.canvas.width = Math.round(width * this.#pixelRatio);
    this.canvas.height = Math.round(height * this.#pixelRatio);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.#context.imageSmoothingEnabled = this.#imageSmoothing;
    this.render();
  }

  /**
   * Selects the nearest v2 look cell using clockwise degrees where 0 points up.
   *
   * @returns `false` for a v1 atlas, otherwise `true` after rendering the direction.
   */
  setLookDirection(degrees: number) {
    if (this.source.version < 2) return false;

    this.#lookDirection = getLookDirectionIndex(degrees);
    this.render();
    return true;
  }

  /** Looks from the canvas center toward a point in viewport coordinates. */
  lookAt(clientX: number, clientY: number) {
    const bounds = this.canvas.getBoundingClientRect();
    const originX = bounds.left + bounds.width / 2;
    const originY = bounds.top + bounds.height / 2;
    return this.setLookDirection(getLookDegrees(originX, originY, clientX, clientY));
  }

  /** Clears a v2 look pose and returns to the current standard animation. */
  clearLookDirection() {
    if (this.#lookDirection === null) return;
    this.#lookDirection = null;
    this.#lastFrameAt = null;
    this.render();
  }

  /** Draws the current pose immediately. */
  render() {
    if (this.#lookDirection === null) {
      const animation = this.#animations[this.#state];
      this.#drawCell(animation.row, this.#frame);
      return;
    }

    const { row, column } = getLookCell(this.#lookDirection);
    this.#drawCell(row, column);
  }

  /** Returns a stable snapshot suitable for controls, diagnostics, and tests. */
  getSnapshot(): SpritePetSnapshot {
    return {
      state: this.#state,
      frame: this.#frame,
      playing: this.#playing,
      lookDirection:
        this.#lookDirection === null ? null : this.#lookDirection * LOOK_DIRECTION_STEP,
      version: this.source.version,
    };
  }

  /** Stops playback and clears the canvas backing store. */
  destroy() {
    this.pause();
    this.#context.setTransform(1, 0, 0, 1, 0, 0);
    this.#context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  readonly #tick = (timestamp: number) => {
    if (!this.#playing) return;

    if (this.#lookDirection === null) {
      const animation = this.#animations[this.#state];
      const frameDuration = 1000 / animation.fps;
      const lastFrameAt = this.#lastFrameAt ?? timestamp;
      const elapsed = timestamp - lastFrameAt;

      if (elapsed >= frameDuration) {
        const elapsedFrames = Math.max(1, Math.floor(elapsed / frameDuration));
        const nextFrame = this.#frame + elapsedFrames;
        this.#frame = animation.loop
          ? nextFrame % animation.frameCount
          : Math.min(nextFrame, animation.frameCount - 1);
        this.#lastFrameAt = timestamp - (elapsed % frameDuration);
        this.render();
      } else if (this.#lastFrameAt === null) {
        this.#lastFrameAt = timestamp;
      }
    }

    this.#animationFrame = requestAnimationFrame(this.#tick);
  };

  #drawCell(row: number, column: number) {
    const sourceX = column * SPRITE_PET_LAYOUT.cellWidth;
    const sourceY = row * SPRITE_PET_LAYOUT.cellHeight;
    let destinationX = 0;
    let destinationY = 0;
    let destinationWidth = this.#width;
    let destinationHeight = this.#height;

    if (this.#fit === "contain") {
      const scale = Math.min(
        this.#width / SPRITE_PET_LAYOUT.cellWidth,
        this.#height / SPRITE_PET_LAYOUT.cellHeight,
      );
      destinationWidth = SPRITE_PET_LAYOUT.cellWidth * scale;
      destinationHeight = SPRITE_PET_LAYOUT.cellHeight * scale;
      destinationX = (this.#width - destinationWidth) / 2;
      destinationY = (this.#height - destinationHeight) / 2;
    }

    this.#context.setTransform(this.#pixelRatio, 0, 0, this.#pixelRatio, 0, 0);
    this.#context.clearRect(0, 0, this.#width, this.#height);
    this.#context.drawImage(
      this.source.image,
      sourceX,
      sourceY,
      SPRITE_PET_LAYOUT.cellWidth,
      SPRITE_PET_LAYOUT.cellHeight,
      destinationX,
      destinationY,
      destinationWidth,
      destinationHeight,
    );
  }
}
