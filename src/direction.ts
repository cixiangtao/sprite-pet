/** Normalizes any finite degree value to the clockwise range `[0, 360)`. */
export const normalizeDirection = (degrees: number) => {
  if (!Number.isFinite(degrees)) {
    throw new RangeError("Look direction must be a finite number.");
  }

  return ((degrees % 360) + 360) % 360;
};

/** Calculates clockwise look degrees from one screen coordinate to another. */
export const getLookDegrees = (
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
) => {
  const radians = Math.atan2(targetX - originX, originY - targetY);
  return normalizeDirection((radians * 180) / Math.PI);
};
