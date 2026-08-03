import { describe, expect, it, vi } from "vitest";

import {
  getCatalogSpritesheetUrl,
  loadPetCatalog,
  mergePetCatalogs,
  parsePetCatalogIndex,
  type PetCatalogEntry,
} from "./catalog.js";

const usagi = {
  id: "usagi",
  displayName: "Usagi",
  description: "A bunny.",
  manifestPath: "./pets/usagi/pet.json",
} as const satisfies PetCatalogEntry;

describe("pet catalog", () => {
  it("rejects a malformed external entry", () => {
    expect(() => parsePetCatalogIndex({ pets: [{ id: "missing-fields" }] })).toThrow("invalid");
  });

  it("loads and validates a catalog response", async () => {
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify({ pets: [usagi] }), { status: 200 }),
    );

    await expect(loadPetCatalog("/pets/index.json", fetcher)).resolves.toEqual([usagi]);
    expect(fetcher).toHaveBeenCalledWith("/pets/index.json");
  });

  it("keeps local entries when catalog ids overlap", () => {
    const localUsagi = { ...usagi, manifestPath: "/@local-pets/usagi/pet.json" };
    const doro = { ...usagi, id: "doro", displayName: "Doro" };

    expect(mergePetCatalogs([localUsagi], [usagi, doro])).toEqual([localUsagi, doro]);
  });

  it("resolves a spritesheet beside its manifest", () => {
    expect(getCatalogSpritesheetUrl(usagi, "https://example.com/sprite-pet/")).toBe(
      "https://example.com/sprite-pet/pets/usagi/spritesheet.webp",
    );
  });
});
