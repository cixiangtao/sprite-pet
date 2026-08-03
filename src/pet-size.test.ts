import { describe, expect, it } from "vitest";

import { getPetScaleForSize, getRenderedPetSize, normalizePetScale } from "./pet-size.js";

describe("pet size", () => {
  const frame = { frameWidth: 192, frameHeight: 208 };

  it("keeps a valid initialization scale unchanged", () => {
    expect(normalizePetScale(0.75)).toBe(0.75);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the invalid scale %s",
    (scale) => {
      expect(() => normalizePetScale(scale)).toThrow(RangeError);
    },
  );

  it("resolves scale from width or height constraints", () => {
    expect(getPetScaleForSize({ width: 240 }, frame)).toBe(1.25);
    expect(getPetScaleForSize({ height: 104 }, frame)).toBe(0.5);
    expect(getPetScaleForSize({ width: 384, height: 208 }, frame)).toBe(1);
    expect(getRenderedPetSize(1.25, frame)).toEqual({ width: 240, height: 260 });
  });

  it("rejects invalid rendered dimensions", () => {
    expect(() => getPetScaleForSize({ width: 0 }, frame)).toThrow(RangeError);
  });
});
