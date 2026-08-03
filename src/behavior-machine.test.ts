import { describe, expect, it } from "vitest";

import { PetBehaviorMachine } from "./behavior-machine.js";

describe("PetBehaviorMachine", () => {
  it("uses pointer presence as a host-independent hover trigger", () => {
    const machine = new PetBehaviorMachine({ startedAt: 0 });

    expect(machine.dispatch({ type: "pointer-enter" }, 100).behavior).toBe("hover");
    expect(machine.dispatch({ type: "pointer-leave" }, 200).behavior).toBe("idle");
  });

  it("plays transient reactions and returns to the contextual fallback", () => {
    const machine = new PetBehaviorMachine({ startedAt: 0 });

    machine.dispatch({ type: "pointer-enter" }, 100);
    expect(
      machine.dispatch({ type: "trigger", behavior: "click", durationMs: 500 }, 200).behavior,
    ).toBe("click");
    expect(machine.tick(699).behavior).toBe("click");
    expect(machine.tick(700).behavior).toBe("hover");
  });

  it("gives dragging priority and selects a directional variant", () => {
    const machine = new PetBehaviorMachine({ startedAt: 0 });

    machine.dispatch({ type: "trigger", behavior: "celebrate", durationMs: 1000 }, 10);
    expect(machine.dispatch({ type: "drag-start", facing: "left" }, 20)).toMatchObject({
      behavior: "drag",
      facing: "left",
      dragging: true,
    });
    expect(machine.dispatch({ type: "drag-end" }, 30)).toMatchObject({
      behavior: "idle",
      dragging: false,
    });
  });

  it("sleeps after inactivity and wakes on input", () => {
    const machine = new PetBehaviorMachine({
      startedAt: 0,
      config: { sleepAfterMs: 1000 },
    });

    expect(machine.tick(1000).behavior).toBe("sleep");
    expect(machine.dispatch({ type: "activity" }, 1100).behavior).toBe("idle");
  });

  it("schedules deterministic autonomous behavior", () => {
    const machine = new PetBehaviorMachine({
      startedAt: 0,
      random: () => 0,
      config: {
        sleepAfterMs: 5000,
        autonomousIntervalMs: [100, 100],
        autonomousBehaviors: ["active"],
      },
    });

    expect(machine.tick(99).behavior).toBe("idle");
    expect(machine.tick(100).behavior).toBe("active");
  });
});
