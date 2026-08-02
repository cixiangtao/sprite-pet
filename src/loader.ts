import { parseSpritePetManifest, validateSpritePetDimensions } from "./manifest.js";
import type {
  LoadSpritePetOptions,
  SpritePetFileBundle,
  SpritePetManifest,
  SpritePetSource,
} from "./types.js";

interface LoadImageOptions {
  crossOrigin?: string | null;
}

const loadImage = async (url: string, options: LoadImageOptions = {}) => {
  const image = new Image();
  if (options.crossOrigin !== undefined && options.crossOrigin !== null) {
    image.crossOrigin = options.crossOrigin;
  }

  await new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener(
      "error",
      () => reject(new Error(`Unable to load pet spritesheet: ${url}`)),
      { once: true },
    );
    image.src = url;
  });

  return image;
};

/** Loads and validates an already parsed manifest with an explicit spritesheet URL. */
export const loadSpritePetSource = async (
  manifestValue: unknown,
  spritesheetUrl: string,
  options: Pick<LoadSpritePetOptions, "crossOrigin"> = {},
): Promise<SpritePetSource> => {
  const manifest = parseSpritePetManifest(manifestValue);
  const image = await loadImage(spritesheetUrl, options);
  validateSpritePetDimensions(image.naturalWidth, image.naturalHeight);

  return {
    manifest,
    image,
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    spritesheetUrl,
  };
};

/**
 * Loads a remote pet bundle from its manifest URL.
 *
 * The spritesheet path is resolved relative to the manifest, making the pair portable across hosts.
 */
export const loadSpritePet = async (
  manifestUrl: string | URL,
  options: LoadSpritePetOptions = {},
): Promise<SpritePetSource> => {
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const response = await fetchImplementation(
    manifestUrl,
    options.signal === undefined ? undefined : { signal: options.signal },
  );
  if (!response.ok) {
    throw new Error(`Unable to load pet manifest: HTTP ${response.status}.`);
  }

  const manifest = parseSpritePetManifest(await response.json());
  const resolvedManifestUrl = new URL(manifestUrl, globalThis.location?.href);
  const spritesheetUrl = new URL(manifest.spritesheetPath, resolvedManifestUrl).href;

  return loadSpritePetSource(manifest, spritesheetUrl, options);
};

/** Loads a pet bundle selected through browser file inputs without uploading either file. */
export const loadSpritePetFiles = async ({
  manifest: manifestFile,
  spritesheet,
}: SpritePetFileBundle): Promise<SpritePetSource> => {
  let manifestValue: unknown;
  try {
    manifestValue = JSON.parse(await manifestFile.text());
  } catch (error) {
    throw new SyntaxError("The selected pet manifest is not valid JSON.", { cause: error });
  }

  const objectUrl = URL.createObjectURL(spritesheet);
  try {
    return await loadSpritePetSource(manifestValue, objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/** Creates a manifest object for callers that only have a spritesheet URL. */
export const defineSpritePetManifest = (manifest: SpritePetManifest) =>
  parseSpritePetManifest(manifest);
