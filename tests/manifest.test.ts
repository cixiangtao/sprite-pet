import { describe, expect, it } from "vitest";

import { parseSpritePetManifest, resolveSpritePetVersion } from "../src/index.js";

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

  it("infers v1 and v2 from exact atlas dimensions", () => {
    expect(resolveSpritePetVersion(manifest, 1536, 1872)).toBe(1);
    expect(resolveSpritePetVersion(manifest, 1536, 2288)).toBe(2);
  });

  it("rejects a declared version that conflicts with the image", () => {
    expect(() =>
      resolveSpritePetVersion({ ...manifest, spriteVersionNumber: 2 }, 1536, 1872),
    ).toThrow("Manifest declares v2, but the spritesheet dimensions match v1.");
  });

  it("rejects unsupported geometry", () => {
    expect(() => resolveSpritePetVersion(manifest, 1024, 1872)).toThrow(
      "Spritesheet width must be 1536px",
    );
    expect(() => resolveSpritePetVersion(manifest, 1536, 2000)).toThrow(
      "Spritesheet height must be 1872px (v1) or 2288px (v2)",
    );
  });
});
