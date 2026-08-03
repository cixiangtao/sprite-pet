import type { PetBehavior, PetFacing } from "./runtime-types.js";

/** Observable semantic runtime state. */
export interface BehaviorSnapshot {
  behavior: PetBehavior;
  facing: PetFacing;
  /** Monotonic timestamp when the current behavior began. */
  since: number;
  lookX: number;
  lookY: number;
  pressed: boolean;
  dragging: boolean;
}

/** Timing and autonomous behavior settings for {@link PetBehaviorMachine}. */
export interface BehaviorMachineConfig {
  sleepAfterMs: number;
  autonomousIntervalMs: readonly [minimum: number, maximum: number];
  autonomousBehaviors: readonly PetBehavior[];
  transientDurationMs: Partial<Record<PetBehavior, number>>;
}

/** Host inputs understood by {@link PetBehaviorMachine}. */
export type BehaviorEvent =
  | { type: "pointer-enter" }
  | { type: "pointer-leave" }
  | { type: "pointer-move"; lookX: number; lookY: number; velocityX?: number }
  | { type: "pointer-down" }
  | { type: "pointer-up" }
  | { type: "drag-start"; facing: PetFacing }
  | { type: "drag-end" }
  | { type: "trigger"; behavior: PetBehavior; durationMs?: number }
  | { type: "activity" };

/** Construction options for a deterministic behavior machine. */
export interface BehaviorMachineOptions {
  config?: Partial<BehaviorMachineConfig>;
  random?: () => number;
  startedAt?: number;
}

const DEFAULT_TRANSIENT_DURATIONS = {
  active: 2200,
  click: 900,
  surprised: 1500,
  celebrate: 1200,
} as const satisfies Partial<Record<PetBehavior, number>>;

/** Default inactivity, autonomous-action, and transient timing. */
export const DEFAULT_BEHAVIOR_CONFIG = {
  sleepAfterMs: 30_000,
  autonomousIntervalMs: [7_000, 13_000],
  autonomousBehaviors: ["active", "celebrate"],
  transientDurationMs: DEFAULT_TRANSIENT_DURATIONS,
} as const satisfies BehaviorMachineConfig;

const clampUnit = (value: number) => Math.max(-1, Math.min(1, value));

/** Pure event-driven behavior state machine with no DOM or rendering ownership. */
export class PetBehaviorMachine {
  readonly #config: BehaviorMachineConfig;
  readonly #random: () => number;
  #behavior: PetBehavior = "idle";
  #since: number;
  #facing: PetFacing = "right";
  #lookX = 0;
  #lookY = 0;
  #pressed = false;
  #dragging = false;
  #pointerInside = false;
  #lastInteractionAt: number;
  #transientUntil: number | undefined;
  #nextAutonomousAt: number;

  constructor(options: BehaviorMachineOptions = {}) {
    const startedAt = options.startedAt ?? 0;
    const config = options.config ?? {};
    this.#config = {
      ...DEFAULT_BEHAVIOR_CONFIG,
      ...config,
      transientDurationMs: {
        ...DEFAULT_BEHAVIOR_CONFIG.transientDurationMs,
        ...config.transientDurationMs,
      },
    };
    this.#random = options.random ?? Math.random;
    this.#since = startedAt;
    this.#lastInteractionAt = startedAt;
    this.#nextAutonomousAt = this.#scheduleNextAutonomous(startedAt);
  }

  /** Applies one host input at a monotonic timestamp and returns the resulting snapshot. */
  dispatch(event: BehaviorEvent, now: number): BehaviorSnapshot {
    switch (event.type) {
      case "pointer-enter":
        this.#pointerInside = true;
        this.#recordActivity(now);
        break;
      case "pointer-leave":
        this.#pointerInside = false;
        break;
      case "pointer-move":
        this.#lookX = clampUnit(event.lookX);
        this.#lookY = clampUnit(event.lookY);
        if (event.velocityX !== undefined && Math.abs(event.velocityX) > 0.01) {
          this.#facing = event.velocityX < 0 ? "left" : "right";
        }
        this.#recordActivity(now);
        break;
      case "pointer-down":
        this.#pressed = true;
        this.#recordActivity(now);
        break;
      case "pointer-up":
        this.#pressed = false;
        this.#recordActivity(now);
        break;
      case "drag-start":
        this.#dragging = true;
        this.#facing = event.facing;
        this.#transientUntil = undefined;
        this.#recordActivity(now);
        break;
      case "drag-end":
        this.#dragging = false;
        this.#pressed = false;
        this.#recordActivity(now);
        break;
      case "trigger":
        this.#startTransient(event.behavior, now, event.durationMs);
        this.#recordActivity(now);
        break;
      case "activity":
        this.#recordActivity(now);
        break;
    }

    return this.tick(now);
  }

  /** Advances time-based sleep, fallback, hover, and autonomous transitions. */
  tick(now: number): BehaviorSnapshot {
    if (this.#dragging) return this.#transition("drag", now);

    if (this.#transientUntil !== undefined) {
      if (now < this.#transientUntil) return this.#snapshot();
      this.#transientUntil = undefined;
    }

    if (this.#pointerInside) return this.#transition("hover", now);
    if (now - this.#lastInteractionAt >= this.#config.sleepAfterMs) {
      return this.#transition("sleep", now);
    }

    if (now >= this.#nextAutonomousAt && this.#config.autonomousBehaviors.length > 0) {
      const index = Math.min(
        this.#config.autonomousBehaviors.length - 1,
        Math.floor(this.#random() * this.#config.autonomousBehaviors.length),
      );
      const behavior = this.#config.autonomousBehaviors[index];
      if (behavior !== undefined) this.#startTransient(behavior, now);
      this.#nextAutonomousAt = this.#scheduleNextAutonomous(now);
      return this.#snapshot();
    }

    return this.#transition("idle", now);
  }

  /** Returns the current state without advancing time. */
  get snapshot(): BehaviorSnapshot {
    return this.#snapshot();
  }

  #recordActivity(now: number) {
    this.#lastInteractionAt = now;
    this.#nextAutonomousAt = this.#scheduleNextAutonomous(now);
  }

  #scheduleNextAutonomous(now: number) {
    const [minimum, maximum] = this.#config.autonomousIntervalMs;
    return now + minimum + (maximum - minimum) * this.#random();
  }

  #startTransient(behavior: PetBehavior, now: number, durationMs?: number) {
    const duration = durationMs ?? this.#config.transientDurationMs[behavior] ?? 1000;
    this.#transientUntil = now + Math.max(0, duration);
    this.#transition(behavior, now);
  }

  #transition(behavior: PetBehavior, now: number) {
    if (behavior !== this.#behavior) {
      this.#behavior = behavior;
      this.#since = now;
    }
    return this.#snapshot();
  }

  #snapshot(): BehaviorSnapshot {
    return {
      behavior: this.#behavior,
      facing: this.#facing,
      since: this.#since,
      lookX: this.#lookX,
      lookY: this.#lookY,
      pressed: this.#pressed,
      dragging: this.#dragging,
    };
  }
}
