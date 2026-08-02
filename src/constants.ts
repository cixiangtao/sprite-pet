import type { SpriteAnimationDefinition, SpritePetLayout, SpritePetState } from "./types.js";

/** Exact geometry shared by every supported pet atlas. */
export const SPRITE_PET_LAYOUT = {
  cellWidth: 192,
  cellHeight: 208,
  columns: 8,
  rows: 9,
} as const satisfies SpritePetLayout;

/** Ordered standard states, matching atlas rows 0 through 8. */
export const SPRITE_PET_STATES = [
  "idle",
  "move-right",
  "move-left",
  "wave",
  "jump",
  "failure",
  "waiting",
  "working",
  "reviewing",
] as const satisfies readonly SpritePetState[];

/** Default playback settings for the nine standard animation rows. */
export const DEFAULT_ANIMATIONS = {
  idle: { row: 0, frameCount: 8, fps: 6, loop: true },
  "move-right": { row: 1, frameCount: 8, fps: 12, loop: true },
  "move-left": { row: 2, frameCount: 8, fps: 12, loop: true },
  wave: { row: 3, frameCount: 8, fps: 8, loop: true },
  jump: { row: 4, frameCount: 8, fps: 10, loop: true },
  failure: { row: 5, frameCount: 8, fps: 6, loop: true },
  waiting: { row: 6, frameCount: 8, fps: 6, loop: true },
  working: { row: 7, frameCount: 8, fps: 10, loop: true },
  reviewing: { row: 8, frameCount: 8, fps: 6, loop: true },
} as const satisfies Record<SpritePetState, SpriteAnimationDefinition>;
