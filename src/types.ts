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

/** A viewport-relative point in CSS pixels. */
export interface SpritePetPosition {
  x: number;
  y: number;
}

/** Interaction and viewport constraints for a floating pet widget. */
export interface SpritePetFloatingOptions {
  /** Allows pointer dragging from the pet surface. @defaultValue true */
  draggable?: boolean;
  /** Shows a resize affordance and enables pointer or keyboard resizing. @defaultValue true */
  resizable?: boolean;
  /** Initial top-left viewport position. Defaults to the bottom-right corner. */
  position?: SpritePetPosition;
  /** Smallest permitted CSS width. @defaultValue 96 */
  minWidth?: number;
  /** Largest permitted CSS width before viewport constraints are applied. @defaultValue 576 */
  maxWidth?: number;
  /** Minimum distance from the viewport edge in CSS pixels. @defaultValue 16 */
  viewportMargin?: number;
  /** Stacking order used while floating. @defaultValue 2147483000 */
  zIndex?: number;
}

/** Options for the DOM-owning pet widget. */
export interface SpritePetWidgetOptions extends Omit<SpritePetRendererOptions, "canvas"> {
  /** Existing canvas to enhance. A new canvas is created when omitted. */
  canvas?: HTMLCanvasElement;
  /** Mount target for a new canvas, or an explicit target when moving an existing canvas. */
  container?: HTMLElement;
  /** Enables the draggable and resizable viewport layer. @defaultValue false */
  floating?: boolean | SpritePetFloatingOptions;
}

/** Observable renderer state for UI bindings and diagnostics. */
export interface SpritePetSnapshot {
  state: SpritePetState;
  frame: number;
  playing: boolean;
  lookDirection: number | null;
  version: SpritePetVersion;
}

/** Combined render and placement state exposed by {@link SpritePetWidget}. */
export interface SpritePetWidgetSnapshot extends SpritePetSnapshot {
  floating: boolean;
  position: SpritePetPosition;
  width: number;
  height: number;
}
