import { describe, expect, it } from "vitest";

import { clampPetWidth, getResizedPetWidth } from "./pet-resize";

describe("direct pet resize", () => {
  const session = { startPointerX: 800, startWidth: 192 };

  it("changes width from horizontal handle movement", () => {
    expect(getResizedPetWidth(session, 760, 80, 224)).toBe(152);
    expect(getResizedPetWidth(session, 820, 80, 224)).toBe(212);
  });

  it("clamps the Codex-compatible width range", () => {
    expect(getResizedPetWidth(session, 200, 80, 224)).toBe(80);
    expect(getResizedPetWidth(session, 1200, 80, 224)).toBe(224);
  });

  it("rounds subpixel widths for stable persistence", () => {
    expect(clampPetWidth(143.6, 80, 224)).toBe(144);
  });
});
