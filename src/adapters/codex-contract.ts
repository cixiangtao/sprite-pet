import type { SpriteAnimationDefinition } from "../types.js";

/** Exact geometry used by Codex Pet 8x9 atlases. */
export const CODEX_ATLAS = {
  width: 1536,
  height: 1872,
  columns: 8,
  rows: 9,
  frameWidth: 192,
  frameHeight: 208,
} as const;

/** Source state names stored in the current Codex Pet atlas contract. */
export const CODEX_ANIMATION_STATES = [
  "idle",
  "running-right",
  "running-left",
  "waving",
  "jumping",
  "failed",
  "waiting",
  "running",
  "review",
] as const;

/** A source state stored in a Codex Pet atlas. */
export type CodexAnimationState = (typeof CODEX_ANIMATION_STATES)[number];

/** Source row and non-uniform frame timing for a Codex animation. */
export interface CodexAnimationRow {
  row: number;
  durationsMs: readonly number[];
}

/** Current Codex 8x9 atlas row contract, including non-uniform frame timing. */
export const CODEX_ANIMATION_ROWS = {
  idle: { row: 0, durationsMs: [280, 110, 110, 140, 140, 320] },
  "running-right": { row: 1, durationsMs: [120, 120, 120, 120, 120, 120, 120, 220] },
  "running-left": { row: 2, durationsMs: [120, 120, 120, 120, 120, 120, 120, 220] },
  waving: { row: 3, durationsMs: [140, 140, 140, 280] },
  jumping: { row: 4, durationsMs: [140, 140, 140, 140, 280] },
  failed: { row: 5, durationsMs: [140, 140, 140, 140, 140, 140, 140, 240] },
  waiting: { row: 6, durationsMs: [150, 150, 150, 150, 150, 260] },
  running: { row: 7, durationsMs: [120, 120, 120, 120, 120, 220] },
  review: { row: 8, durationsMs: [150, 150, 150, 150, 150, 280] },
} as const satisfies Record<CodexAnimationState, CodexAnimationRow>;

/** Converts a timed Codex row into the existing fixed-FPS renderer contract. */
export const getApproximateAnimationDefinition = (
  state: CodexAnimationState,
): SpriteAnimationDefinition => {
  const row = CODEX_ANIMATION_ROWS[state];
  const averageDuration =
    row.durationsMs.reduce((total, duration) => total + duration, 0) / row.durationsMs.length;
  return {
    row: row.row,
    frameCount: row.durationsMs.length,
    fps: 1000 / averageDuration,
    loop: true,
  };
};
