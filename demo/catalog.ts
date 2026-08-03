/** One browser-loadable pet package shown by the demo. */
export interface PetCatalogEntry {
  id: string;
  displayName: string;
  description: string;
  manifestPath: string;
}

interface PetCatalogIndex {
  pets: PetCatalogEntry[];
}

const isPetCatalogEntry = (value: unknown): value is PetCatalogEntry => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Record<PropertyKey, unknown>;
  return ["id", "displayName", "description", "manifestPath"].every(
    (field) => typeof entry[field] === "string" && entry[field].length > 0,
  );
};

/** Validates an external catalog without admitting a malformed entry. */
export const parsePetCatalogIndex = (value: unknown): PetCatalogIndex => {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("pets" in value) ||
    !Array.isArray(value.pets) ||
    !value.pets.every(isPetCatalogEntry)
  ) {
    throw new TypeError("Pet catalog index is invalid.");
  }
  return { pets: value.pets };
};

/** Loads and validates a bundled or development-only pet catalog. */
export const loadPetCatalog = async (url: string | URL, fetcher: typeof fetch = fetch) => {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Unable to load pet catalog: HTTP ${response.status}.`);
  const value: unknown = await response.json();
  return parsePetCatalogIndex(value).pets;
};

/** Merges catalogs by id, keeping entries from earlier sources. */
export const mergePetCatalogs = (...catalogs: readonly PetCatalogEntry[][]) => {
  const entries = new Map<string, PetCatalogEntry>();
  for (const catalog of catalogs) {
    for (const entry of catalog) {
      if (!entries.has(entry.id)) entries.set(entry.id, entry);
    }
  }
  return [...entries.values()];
};

/** Resolves the spritesheet stored beside a catalog entry's manifest. */
export const getCatalogSpritesheetUrl = (entry: PetCatalogEntry, baseUrl: string | URL) =>
  new URL("./spritesheet.webp", new URL(entry.manifestPath, baseUrl)).toString();
