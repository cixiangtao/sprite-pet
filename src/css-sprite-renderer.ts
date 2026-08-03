import type { BehaviorSnapshot } from "./behavior-machine.js";
import type { UnifiedPetSpec } from "./runtime-types.js";
import { getAnimationFrame, selectAnimationClip } from "./sprite-player.js";

/** Paint result returned by {@link CssSpriteRenderer.render}. */
export interface CssSpriteRenderResult {
  clip: ReturnType<typeof selectAnimationClip>;
  frame: ReturnType<typeof getAnimationFrame>;
}

/** CSS background-position renderer for one fixed-grid sprite atlas. */
export class CssSpriteRenderer {
  readonly #element: HTMLElement;
  readonly #spec: UnifiedPetSpec;

  constructor(element: HTMLElement, spec: UnifiedPetSpec) {
    this.#element = element;
    this.#spec = spec;
    const { frameWidth, frameHeight, columns, rows } = spec.source.grid;

    element.style.width = `${frameWidth}px`;
    element.style.height = `${frameHeight}px`;
    element.style.backgroundImage = `url("${spec.source.src}")`;
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundSize = `${columns * frameWidth}px ${rows * frameHeight}px`;
    element.style.transformOrigin = "50% 82%";
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", spec.displayName);
  }

  /** Paints one runtime snapshot and exposes its state through data attributes. */
  render(snapshot: BehaviorSnapshot, now: number, reducedMotion = false): CssSpriteRenderResult {
    const clip = selectAnimationClip(this.#spec, snapshot.behavior, snapshot.facing);
    const frame = getAnimationFrame(clip, now - snapshot.since, reducedMotion);
    const { frameWidth, frameHeight } = this.#spec.source.grid;
    const bob = reducedMotion || snapshot.dragging ? 0 : Math.sin(now / 620) * 1.5;
    const pressScaleX = snapshot.pressed ? 1.06 : 1;
    const pressScaleY = snapshot.pressed ? 0.92 : 1;
    const dragLean = snapshot.dragging ? (snapshot.facing === "left" ? -5 : 5) : 0;
    const lean = snapshot.lookX * 4 + dragLean;

    this.#element.style.backgroundPosition = `-${frame.column * frameWidth}px -${frame.row * frameHeight}px`;
    this.#element.style.transform = [
      `translate3d(${snapshot.lookX * 3}px, ${snapshot.lookY * 2 + bob}px, 0)`,
      `rotate(${lean}deg)`,
      `scale(${pressScaleX}, ${pressScaleY})`,
    ].join(" ");
    this.#element.dataset.behavior = snapshot.behavior;
    this.#element.dataset.sourceState = clip.sourceState;
    this.#element.dataset.frame = `${frame.row}:${frame.column}`;
    return { clip, frame };
  }
}
