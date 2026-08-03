export interface PetPosition {
  x: number;
  y: number;
}

export interface ElementSize {
  width: number;
  height: number;
}

const getMovementLimits = (stage: ElementSize, pet: ElementSize) => ({
  x: Math.max(0, (stage.width - pet.width) / 2),
  y: Math.max(0, (stage.height - pet.height) / 2),
});

const clampAxis = (value: number, limit: number) =>
  limit === 0 ? 0 : Math.max(-limit, Math.min(limit, value));

/** Keeps a center-anchored pet entirely inside its stage. */
export const clampPetPosition = (
  position: PetPosition,
  stage: ElementSize,
  pet: ElementSize,
): PetPosition => {
  const limits = getMovementLimits(stage, pet);
  return {
    x: clampAxis(position.x, limits.x),
    y: clampAxis(position.y, limits.y),
  };
};

/** Applies a drag delta while preserving the visible stage boundary. */
export const movePetPosition = (
  position: PetPosition,
  movement: PetPosition,
  stage: ElementSize,
  pet: ElementSize,
): PetPosition =>
  clampPetPosition({ x: position.x + movement.x, y: position.y + movement.y }, stage, pet);

/** Returns a bottom-right dock position for a full-page floating stage. */
export const getFloatingDockPosition = (
  stage: ElementSize,
  pet: ElementSize,
  margin: number,
): PetPosition => {
  const limits = getMovementLimits(stage, pet);
  return {
    x: Math.max(0, limits.x - margin),
    y: Math.max(0, limits.y - margin),
  };
};
