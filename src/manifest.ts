import { SPRITE_PET_LAYOUT } from "./constants.js";
import type { SpritePetManifest } from "./types.js";

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null;

const readRequiredString = (value: Record<PropertyKey, unknown>, key: string) => {
  const property = value[key];
  if (typeof property !== "string" || property.trim() === "") {
    throw new TypeError(`Pet manifest field "${key}" must be a non-empty string.`);
  }

  return property;
};

/**
 * Validates untrusted JSON and returns the supported manifest fields.
 *
 * @throws {TypeError} When a required field is missing or has an invalid type.
 */
export const parseSpritePetManifest = (value: unknown): SpritePetManifest => {
  if (!isRecord(value)) {
    throw new TypeError("Pet manifest must be a JSON object.");
  }

  const id = readRequiredString(value, "id");
  const displayName = readRequiredString(value, "displayName");
  const spritesheetPath = readRequiredString(value, "spritesheetPath");
  const description = value.description;
  const kind = value.kind;

  if (description !== undefined && typeof description !== "string") {
    throw new TypeError('Pet manifest field "description" must be a string when provided.');
  }

  if (kind !== undefined && typeof kind !== "string") {
    throw new TypeError('Pet manifest field "kind" must be a string when provided.');
  }

  return {
    id,
    displayName,
    spritesheetPath,
    ...(description === undefined ? {} : { description }),
    ...(kind === undefined ? {} : { kind }),
  };
};

/**
 * Checks that a spritesheet matches the exact 8x9 atlas contract.
 *
 * @throws {RangeError} When the spritesheet does not match the 8x9 contract.
 */
export const validateSpritePetDimensions = (imageWidth: number, imageHeight: number) => {
  const expectedWidth = SPRITE_PET_LAYOUT.columns * SPRITE_PET_LAYOUT.cellWidth;
  const expectedHeight = SPRITE_PET_LAYOUT.rows * SPRITE_PET_LAYOUT.cellHeight;

  if (imageWidth !== expectedWidth) {
    throw new RangeError(`Spritesheet width must be ${expectedWidth}px; received ${imageWidth}px.`);
  }

  if (imageHeight !== expectedHeight) {
    throw new RangeError(
      `Spritesheet height must be ${expectedHeight}px; received ${imageHeight}px.`,
    );
  }
};
