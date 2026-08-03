import type {
  AnimationClip,
  AnimationVariants,
  PetBehavior,
  UnifiedPetSpec,
} from "../runtime-types.js";
import { CODEX_ANIMATION_ROWS, CODEX_ATLAS, type CodexAnimationState } from "./codex-contract.js";

/** Portable manifest shape emitted by Codex Pet packages. */
export interface CodexPetManifest {
  id: string;
  displayName: string;
  description: string;
  spritesheetPath: string;
  kind?: string;
}

/** Selects one source state for a semantic runtime behavior. */
export interface CodexAnimationSelector {
  state: CodexAnimationState;
  /** Multiplier applied to every original frame duration. */
  durationScale?: number;
  loop?: boolean;
  fallback?: PetBehavior;
}

/** Default and directional selectors for one semantic behavior. */
export interface CodexBehaviorMappingEntry {
  default: CodexAnimationSelector;
  left?: CodexAnimationSelector;
  right?: CodexAnimationSelector;
}

/** Complete remapping from runtime behaviors to Codex source states. */
export type CodexBehaviorMapping = Record<PetBehavior, CodexBehaviorMappingEntry>;

/** Options for adapting an already loaded Codex manifest. */
export interface AdaptCodexPetOptions {
  /** Absolute URL used to resolve the manifest's relative spritesheet path. */
  baseUrl?: string;
  /** Direct source override for hosts that resolve assets themselves. */
  spriteUrl?: string;
  mapping?: Partial<CodexBehaviorMapping>;
}

/** Browser dependencies and mapping overrides used by {@link loadCodexPet}. */
export interface LoadCodexPetOptions {
  mapping?: Partial<CodexBehaviorMapping>;
  fetch?: typeof globalThis.fetch;
  imageSizeLoader?: (src: string) => Promise<{ width: number; height: number }>;
}

const looping = (state: CodexAnimationState, durationScale?: number): CodexAnimationSelector => ({
  state,
  ...(durationScale === undefined ? {} : { durationScale }),
  loop: true,
});

const once = (state: CodexAnimationState): CodexAnimationSelector => ({
  state,
  loop: false,
  fallback: "idle",
});

/** Default mapping from Codex task states to autonomous browser-pet behaviors. */
export const DEFAULT_CODEX_BEHAVIOR_MAPPING = {
  idle: { default: looping("idle") },
  active: {
    default: looping("running"),
    left: looping("running-left"),
    right: looping("running-right"),
  },
  hover: { default: looping("waiting") },
  click: { default: once("waving") },
  drag: {
    default: looping("running-right"),
    left: looping("running-left"),
    right: looping("running-right"),
  },
  sleep: { default: looping("idle", 1.8) },
  surprised: { default: once("failed") },
  celebrate: { default: once("jumping") },
} as const satisfies CodexBehaviorMapping;

const assertManifest: (value: unknown) => asserts value is CodexPetManifest = (value) => {
  if (typeof value !== "object" || value === null) {
    throw new TypeError("Codex pet manifest must be an object.");
  }

  const manifest = value as Record<PropertyKey, unknown>;
  for (const field of ["id", "displayName", "description", "spritesheetPath"]) {
    if (typeof manifest[field] !== "string" || manifest[field].length === 0) {
      throw new TypeError(`Codex pet manifest field "${field}" must be a non-empty string.`);
    }
  }
};

/** Checks an image against the fixed Codex Pet atlas contract. */
export const validateCodexAtlasSize = (width: number, height: number) => {
  if (width !== CODEX_ATLAS.width || height !== CODEX_ATLAS.height) {
    throw new RangeError(
      `Invalid Codex pet atlas: expected ${CODEX_ATLAS.width}x${CODEX_ATLAS.height}, received ${width}x${height}.`,
    );
  }
};

const buildClip = (behavior: PetBehavior, selector: CodexAnimationSelector): AnimationClip => {
  const row = CODEX_ANIMATION_ROWS[selector.state];
  const durationScale = selector.durationScale ?? 1;
  if (!Number.isFinite(durationScale) || durationScale <= 0) {
    throw new RangeError(`Animation durationScale for "${behavior}" must be greater than zero.`);
  }

  return {
    id: `${behavior}:${selector.state}`,
    sourceState: selector.state,
    frames: row.durationsMs.map((durationMs, column) => ({
      column,
      row: row.row,
      durationMs: durationMs * durationScale,
    })),
    loop: selector.loop ?? true,
    ...(selector.fallback === undefined ? {} : { fallback: selector.fallback }),
  };
};

const buildVariants = (
  behavior: PetBehavior,
  mapping: CodexBehaviorMappingEntry,
): AnimationVariants => ({
  default: buildClip(behavior, mapping.default),
  ...(mapping.left === undefined ? {} : { left: buildClip(behavior, mapping.left) }),
  ...(mapping.right === undefined ? {} : { right: buildClip(behavior, mapping.right) }),
});

const resolveSpriteUrl = (manifest: CodexPetManifest, options: AdaptCodexPetOptions) => {
  if (options.spriteUrl !== undefined) return options.spriteUrl;
  if (options.baseUrl !== undefined) {
    return new URL(manifest.spritesheetPath, options.baseUrl).toString();
  }
  return manifest.spritesheetPath;
};

/** Converts a Codex manifest and 8x9 atlas into a host-neutral runtime specification. */
export const adaptCodexPet = (
  value: unknown,
  options: AdaptCodexPetOptions = {},
): UnifiedPetSpec => {
  assertManifest(value);
  const manifest = value;
  const mapping = { ...DEFAULT_CODEX_BEHAVIOR_MAPPING, ...options.mapping };

  return {
    id: manifest.id,
    displayName: manifest.displayName,
    description: manifest.description,
    source: {
      kind: "sprite-sheet",
      src: resolveSpriteUrl(manifest, options),
      grid: {
        columns: CODEX_ATLAS.columns,
        rows: CODEX_ATLAS.rows,
        frameWidth: CODEX_ATLAS.frameWidth,
        frameHeight: CODEX_ATLAS.frameHeight,
      },
    },
    animations: {
      idle: buildVariants("idle", mapping.idle),
      active: buildVariants("active", mapping.active),
      hover: buildVariants("hover", mapping.hover),
      click: buildVariants("click", mapping.click),
      drag: buildVariants("drag", mapping.drag),
      sleep: buildVariants("sleep", mapping.sleep),
      surprised: buildVariants("surprised", mapping.surprised),
      celebrate: buildVariants("celebrate", mapping.celebrate),
    },
  };
};

const loadImageSize = async (src: string) => {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener(
      "error",
      () => reject(new Error(`Unable to load Codex pet atlas: ${src}`)),
      { once: true },
    );
    image.src = src;
  });
  return { width: image.naturalWidth, height: image.naturalHeight };
};

/** Fetches, validates, and adapts a complete Codex Pet package for browser hosts. */
export const loadCodexPet = async (
  manifestUrl: string | URL,
  options: LoadCodexPetOptions = {},
): Promise<UnifiedPetSpec> => {
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const response = await fetchImplementation(manifestUrl);
  if (!response.ok) {
    throw new Error(`Unable to load Codex pet manifest: HTTP ${response.status}.`);
  }

  const manifest: unknown = await response.json();
  const resolvedManifestUrl = new URL(manifestUrl, globalThis.location?.href);
  const spec = adaptCodexPet(manifest, {
    baseUrl: new URL(".", resolvedManifestUrl).toString(),
    ...(options.mapping === undefined ? {} : { mapping: options.mapping }),
  });
  const imageSize = await (options.imageSizeLoader ?? loadImageSize)(spec.source.src);
  validateCodexAtlasSize(imageSize.width, imageSize.height);
  return spec;
};
