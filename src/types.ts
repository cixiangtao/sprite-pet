/** States provided by the standard 8x9 animated pet atlas. */
export type SpritePetState =
  | "idle"
  | "move-right"
  | "move-left"
  | "wave"
  | "jump"
  | "failure"
  | "waiting"
  | "working"
  | "reviewing";

/** The supported atlas contracts. Version 2 adds two rows with 16 look directions. */
export type SpritePetVersion = 1 | 2;

/** Portable metadata stored next to a pet spritesheet. */
export interface SpritePetManifest {
  id: string;
  displayName: string;
  description?: string;
  spritesheetPath: string;
  spriteVersionNumber?: SpritePetVersion;
  kind?: string;
}

/** Pixel dimensions and grid geometry for a supported atlas. */
export interface SpritePetLayout {
  cellWidth: number;
  cellHeight: number;
  columns: number;
  standardRows: number;
  extendedRows: number;
}

/** Defines how one row advances while the renderer is playing. */
export interface SpriteAnimationDefinition {
  row: number;
  frameCount: number;
  /** Frames per second. */
  fps: number;
  loop: boolean;
}

/** A decoded pet ready to be passed to {@link SpritePetRenderer}. */
export interface SpritePetSource {
  manifest: SpritePetManifest;
  image: CanvasImageSource;
  imageWidth: number;
  imageHeight: number;
  version: SpritePetVersion;
  spritesheetUrl?: string;
}

/** Options used when loading a manifest and spritesheet over HTTP. */
export interface LoadSpritePetOptions {
  signal?: AbortSignal;
  crossOrigin?: string | null;
  fetch?: typeof globalThis.fetch;
}

/** A pair of local browser files selected by the user. */
export interface SpritePetFileBundle {
  manifest: File;
  spritesheet: File;
}

/** Canvas scaling behavior within the configured viewport. */
export type SpritePetFit = "contain" | "fill";

/** Configuration for a canvas renderer instance. */
export interface SpritePetRendererOptions {
  canvas: HTMLCanvasElement;
  source: SpritePetSource;
  width?: number;
  height?: number;
  pixelRatio?: number;
  initialState?: SpritePetState;
  autoplay?: boolean;
  imageSmoothing?: boolean;
  fit?: SpritePetFit;
  animations?: Partial<Record<SpritePetState, Partial<SpriteAnimationDefinition>>>;
}

/** Observable renderer state for UI bindings and diagnostics. */
export interface SpritePetSnapshot {
  state: SpritePetState;
  frame: number;
  playing: boolean;
  lookDirection: number | null;
  version: SpritePetVersion;
}
