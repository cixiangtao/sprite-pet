/** Runtime behaviors that are independent from source-atlas state names. */
export const PET_BEHAVIORS = [
  "idle",
  "active",
  "hover",
  "click",
  "drag",
  "sleep",
  "surprised",
  "celebrate",
] as const;

/** A semantic behavior understood by {@link PetBehaviorMachine}. */
export type PetBehavior = (typeof PET_BEHAVIORS)[number];

/** Horizontal direction used to select an animation variant. */
export type PetFacing = "left" | "right";

/** Fixed sprite-atlas geometry used by a runtime animation package. */
export interface SpriteGrid {
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
}

/** Browser-resolvable sprite-atlas source. */
export interface SpriteSheetSource {
  kind: "sprite-sheet";
  src: string;
  grid: SpriteGrid;
}

/** One atlas cell and its exact display duration. */
export interface AnimationFrame {
  column: number;
  row: number;
  /** How long the frame remains visible, in milliseconds. */
  durationMs: number;
}

/** Ordered frames played for one semantic behavior. */
export interface AnimationClip {
  id: string;
  sourceState: string;
  frames: readonly AnimationFrame[];
  loop: boolean;
  fallback?: PetBehavior;
}

/** Default and directional clips available for one behavior. */
export interface AnimationVariants {
  default: AnimationClip;
  left?: AnimationClip;
  right?: AnimationClip;
}

/** Host-neutral animation package consumed by behavior and rendering layers. */
export interface UnifiedPetSpec {
  id: string;
  displayName: string;
  description: string;
  source: SpriteSheetSource;
  animations: Record<PetBehavior, AnimationVariants>;
}
