export interface PetResizeSession {
  startPointerX: number;
  startWidth: number;
}

/** Constrains and rounds a rendered pet width to the supported resize range. */
export const clampPetWidth = (width: number, minimumWidth: number, maximumWidth: number) =>
  Math.round(Math.max(minimumWidth, Math.min(maximumWidth, width)));

/** Resolves the next width from the resize handle's horizontal pointer movement. */
export const getResizedPetWidth = (
  session: PetResizeSession,
  pointerX: number,
  minimumWidth: number,
  maximumWidth: number,
) =>
  clampPetWidth(session.startWidth + pointerX - session.startPointerX, minimumWidth, maximumWidth);
