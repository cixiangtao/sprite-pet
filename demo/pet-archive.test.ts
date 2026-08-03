import { strFromU8, strToU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { createPetArchive } from "./pet-archive.js";

describe("createPetArchive", () => {
  it("packages the manifest, atlas, and rights notice", () => {
    const spritesheet = new Uint8Array([1, 2, 3, 4]);
    const archive = createPetArchive({
      manifest: strToU8('{"id":"guga"}'),
      spritesheet,
      notice: strToU8("# Pet asset notice"),
    });
    const files = unzipSync(archive);

    expect(Object.keys(files)).toHaveLength(3);
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(["NOTICE.md", "pet.json", "spritesheet.webp"]),
    );
    expect(strFromU8(files["pet.json"] ?? new Uint8Array())).toBe('{"id":"guga"}');
    expect(files["spritesheet.webp"]).toEqual(spritesheet);
    expect(strFromU8(files["NOTICE.md"] ?? new Uint8Array())).toContain("Pet asset notice");
  });
});
