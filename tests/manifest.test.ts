import { describe, expect, it } from "vitest";

import { parseSpritePetManifest, validateSpritePetDimensions } from "../src/index.js";

const manifest = {
  id: "momo",
  displayName: "Momo",
  spritesheetPath: "spritesheet.webp",
};

describe("pet manifests", () => {
  it("accepts a portable minimal manifest", () => {
    expect(parseSpritePetManifest(manifest)).toEqual(manifest);
  });

  it("rejects missing required fields", () => {
    expect(() => parseSpritePetManifest({ displayName: "Momo" })).toThrow(
      'Pet manifest field "id" must be a non-empty string.',
    );
  });

  it("accepts the exact 8x9 atlas dimensions", () => {
    expect(() => validateSpritePetDimensions(1536, 1872)).not.toThrow();
  });

  it("rejects unsupported geometry", () => {
    expect(() => validateSpritePetDimensions(1024, 1872)).toThrow(
      "Spritesheet width must be 1536px",
    );
    expect(() => validateSpritePetDimensions(1536, 2288)).toThrow(
      "Spritesheet height must be 1872px",
    );
  });
});
