import { describe, expect, it } from "vitest";

import { clampPetPosition, getFloatingDockPosition, movePetPosition } from "./pet-position";

describe("page-floating pet position", () => {
  const stage = { width: 1000, height: 800 };
  const pet = { width: 200, height: 200 };

  it("docks the pet at the bottom-right viewport margin", () => {
    expect(getFloatingDockPosition(stage, pet, 24)).toEqual({ x: 376, y: 276 });
  });

  it("allows free movement while clamping every viewport edge", () => {
    expect(movePetPosition({ x: 0, y: 0 }, { x: -900, y: 900 }, stage, pet)).toEqual({
      x: -400,
      y: 300,
    });
  });

  it("centers a pet that is larger than its available stage", () => {
    expect(clampPetPosition({ x: 40, y: -40 }, { width: 100, height: 100 }, pet)).toEqual({
      x: 0,
      y: 0,
    });
  });
});
