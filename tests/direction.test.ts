import { describe, expect, it } from "vitest";

import { getLookDegrees, normalizeDirection } from "../src/index.js";

describe("look directions", () => {
  it("normalizes degrees into a clockwise turn", () => {
    expect(normalizeDirection(-22.5)).toBe(337.5);
    expect(normalizeDirection(360)).toBe(0);
    expect(normalizeDirection(742.5)).toBe(22.5);
  });

  it("calculates screen-relative cardinal directions", () => {
    expect(getLookDegrees(50, 50, 50, 0)).toBe(0);
    expect(getLookDegrees(50, 50, 100, 50)).toBe(90);
    expect(getLookDegrees(50, 50, 50, 100)).toBe(180);
    expect(getLookDegrees(50, 50, 0, 50)).toBe(270);
  });
});
