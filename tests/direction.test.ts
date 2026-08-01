import { describe, expect, it } from "vitest";

import {
  getLookCell,
  getLookDegrees,
  getLookDirectionIndex,
  normalizeDirection,
} from "../src/index.js";

describe("look directions", () => {
  it("normalizes degrees into a clockwise turn", () => {
    expect(normalizeDirection(-22.5)).toBe(337.5);
    expect(normalizeDirection(360)).toBe(0);
    expect(normalizeDirection(742.5)).toBe(22.5);
  });

  it("maps degrees to the nearest one of 16 cells", () => {
    expect(getLookDirectionIndex(0)).toBe(0);
    expect(getLookDirectionIndex(90)).toBe(4);
    expect(getLookDirectionIndex(180)).toBe(8);
    expect(getLookDirectionIndex(270)).toBe(12);
    expect(getLookDirectionIndex(359)).toBe(0);
  });

  it("maps direction indexes across the two v2 rows", () => {
    expect(getLookCell(0)).toEqual({ row: 9, column: 0 });
    expect(getLookCell(7)).toEqual({ row: 9, column: 7 });
    expect(getLookCell(8)).toEqual({ row: 10, column: 0 });
    expect(getLookCell(15)).toEqual({ row: 10, column: 7 });
  });

  it("calculates screen-relative cardinal directions", () => {
    expect(getLookDegrees(50, 50, 50, 0)).toBe(0);
    expect(getLookDegrees(50, 50, 100, 50)).toBe(90);
    expect(getLookDegrees(50, 50, 50, 100)).toBe(180);
    expect(getLookDegrees(50, 50, 0, 50)).toBe(270);
  });
});
