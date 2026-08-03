import type {
  AnimationClip,
  AnimationFrame,
  PetBehavior,
  PetFacing,
  UnifiedPetSpec,
} from "./runtime-types.js";

/** Returns the best directional clip, falling back to the behavior's default clip. */
export const selectAnimationClip = (
  spec: UnifiedPetSpec,
  behavior: PetBehavior,
  facing: PetFacing,
) => spec.animations[behavior][facing] ?? spec.animations[behavior].default;

/** Returns the total timeline length of a clip in milliseconds. */
export const getClipDurationMs = (clip: AnimationClip) =>
  clip.frames.reduce((total, frame) => total + frame.durationMs, 0);

/** Resolves the visible frame while preserving every source frame's exact duration. */
export const getAnimationFrame = (
  clip: AnimationClip,
  elapsedMs: number,
  reducedMotion = false,
): AnimationFrame => {
  const firstFrame = clip.frames[0];
  if (firstFrame === undefined) {
    throw new Error(`Animation clip "${clip.id}" has no frames.`);
  }
  if (reducedMotion) return firstFrame;

  const duration = getClipDurationMs(clip);
  if (duration <= 0) {
    throw new RangeError(`Animation clip "${clip.id}" has an invalid duration.`);
  }

  const positiveElapsed = Math.max(0, elapsedMs);
  const playhead = clip.loop
    ? positiveElapsed % duration
    : Math.min(positiveElapsed, Math.max(0, duration - Number.EPSILON));
  let cursor = 0;

  for (const frame of clip.frames) {
    cursor += frame.durationMs;
    if (playhead < cursor) return frame;
  }

  return clip.frames.at(-1) ?? firstFrame;
};
