import { describe, expect, it } from "vitest";

import { adaptCodexPet, type CodexPetManifest } from "./adapters/codex-pet.js";
import { getAnimationFrame, selectAnimationClip } from "./sprite-player.js";

const manifest = {
  id: "test-pet",
  displayName: "Test Pet",
  description: "A test pet.",
  spritesheetPath: "spritesheet.webp",
} as const satisfies CodexPetManifest;

describe("sprite player", () => {
  const spec = adaptCodexPet(manifest);

  it("selects directional variants when available", () => {
    expect(selectAnimationClip(spec, "drag", "left").sourceState).toBe("running-left");
    expect(selectAnimationClip(spec, "drag", "right").sourceState).toBe("running-right");
    expect(selectAnimationClip(spec, "hover", "left").sourceState).toBe("waiting");
  });

  it("uses each source frame duration instead of a fixed fps", () => {
    const clip = spec.animations.idle.default;

    expect(getAnimationFrame(clip, 279).column).toBe(0);
    expect(getAnimationFrame(clip, 280).column).toBe(1);
    expect(getAnimationFrame(clip, 390).column).toBe(2);
  });

  it("loops recurring clips and holds the last frame of one-shot clips", () => {
    const idle = spec.animations.idle.default;
    const click = spec.animations.click.default;

    expect(getAnimationFrame(idle, 1100).column).toBe(0);
    expect(getAnimationFrame(click, 10_000).column).toBe(3);
  });

  it("pins the first frame when reduced motion is requested", () => {
    expect(getAnimationFrame(spec.animations.idle.default, 700, true).column).toBe(0);
  });
});
