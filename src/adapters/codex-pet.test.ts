import { describe, expect, it, vi } from "vitest";

import {
  adaptCodexPet,
  loadCodexPet,
  validateCodexAtlasSize,
  type CodexPetManifest,
} from "./codex-pet.js";

const manifest = {
  id: "test-pet",
  displayName: "Test Pet",
  description: "A test pet.",
  spritesheetPath: "spritesheet.webp",
} as const satisfies CodexPetManifest;

describe("adaptCodexPet", () => {
  it("remaps Codex rows into standalone pet behaviors", () => {
    const spec = adaptCodexPet(manifest, {
      baseUrl: "https://example.com/pets/test-pet/",
    });

    expect(spec.source.src).toBe("https://example.com/pets/test-pet/spritesheet.webp");
    expect(spec.source.grid).toEqual({
      columns: 8,
      rows: 9,
      frameWidth: 192,
      frameHeight: 208,
    });
    expect(spec.animations.idle.default.sourceState).toBe("idle");
    expect(spec.animations.hover.default.sourceState).toBe("waiting");
    expect(spec.animations.drag.left?.sourceState).toBe("running-left");
    expect(spec.animations.surprised.default.sourceState).toBe("failed");
    expect(spec.animations.celebrate.default.sourceState).toBe("jumping");
    expect(spec.animations.click.default.loop).toBe(false);
    expect(spec.animations.click.default.fallback).toBe("idle");
  });

  it("allows one semantic mapping to be replaced without changing the contract", () => {
    const spec = adaptCodexPet(manifest, {
      mapping: {
        hover: { default: { state: "review", loop: true } },
      },
    });

    expect(spec.animations.hover.default.sourceState).toBe("review");
    expect(spec.animations.idle.default.sourceState).toBe("idle");
  });

  it("preserves non-uniform timing and supports speed remapping", () => {
    const spec = adaptCodexPet(manifest);

    expect(spec.animations.idle.default.frames.map(({ durationMs }) => durationMs)).toEqual([
      280, 110, 110, 140, 140, 320,
    ]);
    expect(spec.animations.sleep.default.frames[0]?.durationMs).toBe(504);
  });
});

describe("loadCodexPet", () => {
  it("fetches the manifest and validates atlas dimensions", async () => {
    const fetchImplementation = vi.fn(
      async () => new Response(JSON.stringify(manifest), { status: 200 }),
    );
    const imageSizeLoader = vi.fn(async () => ({ width: 1536, height: 1872 }));

    const spec = await loadCodexPet("https://example.com/pets/test-pet/pet.json", {
      fetch: fetchImplementation,
      imageSizeLoader,
    });

    expect(fetchImplementation).toHaveBeenCalledOnce();
    expect(imageSizeLoader).toHaveBeenCalledWith(
      "https://example.com/pets/test-pet/spritesheet.webp",
    );
    expect(spec.id).toBe("test-pet");
  });
});

describe("validateCodexAtlasSize", () => {
  it("rejects incompatible sprite geometry", () => {
    expect(() => validateCodexAtlasSize(1024, 1024)).toThrow(
      "expected 1536x1872, received 1024x1024",
    );
  });
});
