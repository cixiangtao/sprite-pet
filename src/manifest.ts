import { SPRITE_PET_LAYOUT } from "./constants.js";
import type { SpritePetManifest, SpritePetVersion } from "./types.js";

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
  const spriteVersionNumber = value.spriteVersionNumber;

  if (description !== undefined && typeof description !== "string") {
    throw new TypeError('Pet manifest field "description" must be a string when provided.');
  }

  if (kind !== undefined && typeof kind !== "string") {
    throw new TypeError('Pet manifest field "kind" must be a string when provided.');
  }

  if (spriteVersionNumber !== undefined && spriteVersionNumber !== 1 && spriteVersionNumber !== 2) {
    throw new TypeError('Pet manifest field "spriteVersionNumber" must be 1 or 2.');
  }

  return {
    id,
    displayName,
    spritesheetPath,
    ...(description === undefined ? {} : { description }),
    ...(kind === undefined ? {} : { kind }),
    ...(spriteVersionNumber === undefined ? {} : { spriteVersionNumber }),
  };
};

/**
 * Resolves the atlas version and checks its exact pixel dimensions.
 *
 * A missing version is inferred from image height for compatibility with older pet bundles.
 *
 * @throws {RangeError} When the spritesheet does not match the 8x9 or 8x11 contract.
 */
export const resolveSpritePetVersion = (
  manifest: SpritePetManifest,
  imageWidth: number,
  imageHeight: number,
): SpritePetVersion => {
  const expectedWidth = SPRITE_PET_LAYOUT.columns * SPRITE_PET_LAYOUT.cellWidth;
  const standardHeight = SPRITE_PET_LAYOUT.standardRows * SPRITE_PET_LAYOUT.cellHeight;
  const extendedHeight = SPRITE_PET_LAYOUT.extendedRows * SPRITE_PET_LAYOUT.cellHeight;

  if (imageWidth !== expectedWidth) {
    throw new RangeError(`Spritesheet width must be ${expectedWidth}px; received ${imageWidth}px.`);
  }

  const inferredVersion =
    imageHeight === extendedHeight ? 2 : imageHeight === standardHeight ? 1 : 0;
  if (inferredVersion === 0) {
    throw new RangeError(
      `Spritesheet height must be ${standardHeight}px (v1) or ${extendedHeight}px (v2); received ${imageHeight}px.`,
    );
  }

  if (
    manifest.spriteVersionNumber !== undefined &&
    manifest.spriteVersionNumber !== inferredVersion
  ) {
    throw new RangeError(
      `Manifest declares v${manifest.spriteVersionNumber}, but the spritesheet dimensions match v${inferredVersion}.`,
    );
  }

  return inferredVersion;
};
