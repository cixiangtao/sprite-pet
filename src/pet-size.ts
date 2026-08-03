/** Rendered dimensions of one pet animation frame, in CSS pixels. */
export interface RenderedPetSize {
  width: number;
  height: number;
}

/**
 * A width, height, or bounding box used to resize a pet without changing its aspect ratio.
 * When both dimensions are provided, the pet is contained inside the requested box.
 */
export type PetSizeConstraint =
  | { width: number; height?: number }
  | { width?: number; height: number };

interface PetFrameSize {
  frameWidth: number;
  frameHeight: number;
}

const assertPositiveFinite = (value: number, name: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
};

const validateFrameSize = (frame: PetFrameSize) => {
  assertPositiveFinite(frame.frameWidth, "Pet frame width");
  assertPositiveFinite(frame.frameHeight, "Pet frame height");
};

/** Validates a proportional scale before it is applied to a pet. */
export const normalizePetScale = (scale: number) => {
  assertPositiveFinite(scale, "Pet scale");
  return scale;
};

/** Resolves a proportional scale from a frame-size constraint. */
export const getPetScaleForSize = (size: PetSizeConstraint, frame: PetFrameSize) => {
  validateFrameSize(frame);

  const scales: number[] = [];
  if (size.width !== undefined) {
    assertPositiveFinite(size.width, "Pet width");
    scales.push(size.width / frame.frameWidth);
  }
  if (size.height !== undefined) {
    assertPositiveFinite(size.height, "Pet height");
    scales.push(size.height / frame.frameHeight);
  }

  return normalizePetScale(Math.min(...scales));
};

/** Returns the visible frame dimensions produced by a proportional scale. */
export const getRenderedPetSize = (scale: number, frame: PetFrameSize): RenderedPetSize => {
  const normalizedScale = normalizePetScale(scale);
  validateFrameSize(frame);
  return {
    width: frame.frameWidth * normalizedScale,
    height: frame.frameHeight * normalizedScale,
  };
};
