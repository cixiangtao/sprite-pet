import { LOOK_DIRECTION_STEP } from "./constants.js";

/** Normalizes any finite degree value to the clockwise range `[0, 360)`. */
export const normalizeDirection = (degrees: number) => {
  if (!Number.isFinite(degrees)) {
    throw new RangeError("Look direction must be a finite number.");
  }

  return ((degrees % 360) + 360) % 360;
};

/** Maps clockwise degrees, where 0 points up, to one of 16 direction cells. */
export const getLookDirectionIndex = (degrees: number) =>
  Math.round(normalizeDirection(degrees) / LOOK_DIRECTION_STEP) % 16;

/** Converts one of 16 direction indexes to its v2 atlas row and column. */
export const getLookCell = (directionIndex: number) => {
  if (!Number.isInteger(directionIndex) || directionIndex < 0 || directionIndex > 15) {
    throw new RangeError("Look direction index must be an integer from 0 through 15.");
  }

  return directionIndex < 8
    ? { row: 9, column: directionIndex }
    : { row: 10, column: directionIndex - 8 };
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
