import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, type Plugin } from "vite";

import { createPetArchive } from "./pet-archive.js";

const LOCAL_PETS_ROUTE = "/@local-pets";
const BUNDLED_PETS_ROUTE = "/pets";
const BUNDLED_PETS_DIRECTORY = fileURLToPath(new URL("../pets", import.meta.url));
const PET_FILE_NAMES = new Set(["pet.json", "spritesheet.webp"]);
const SAFE_DIRECTORY_NAME = /^[a-zA-Z0-9._-]+$/;

interface LocalPetManifest {
  id: string;
  displayName: string;
  description: string;
  spritesheetPath: string;
}

interface BundledPetCatalogEntry {
  id: string;
  displayName: string;
  description: string;
  manifestPath: string;
}

interface BundledPetCatalog {
  pets: BundledPetCatalogEntry[];
}

const getPetsDirectory = () => join(process.env.CODEX_HOME ?? join(homedir(), ".codex"), "pets");

const isLocalPetManifest = (value: unknown): value is LocalPetManifest => {
  if (typeof value !== "object" || value === null) return false;
  const manifest = value as Record<PropertyKey, unknown>;
  return ["id", "displayName", "description", "spritesheetPath"].every(
    (field) => typeof manifest[field] === "string" && manifest[field].length > 0,
  );
};

const isBundledPetCatalogEntry = (value: unknown): value is BundledPetCatalogEntry => {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<PropertyKey, unknown>;
  return ["id", "displayName", "description", "manifestPath"].every(
    (field) => typeof entry[field] === "string" && entry[field].length > 0,
  );
};

const readBundledPetCatalog = async (): Promise<BundledPetCatalog> => {
  const value: unknown = JSON.parse(
    await readFile(join(BUNDLED_PETS_DIRECTORY, "index.json"), "utf8"),
  );
  if (
    typeof value !== "object" ||
    value === null ||
    !("pets" in value) ||
    !Array.isArray(value.pets) ||
    !value.pets.every(isBundledPetCatalogEntry)
  ) {
    throw new TypeError("The bundled pet catalog is invalid.");
  }
  return { pets: value.pets };
};

const readBundledPetFiles = async (petId: string) => {
  const petDirectory = join(BUNDLED_PETS_DIRECTORY, petId);
  const [manifest, spritesheet, notice] = await Promise.all([
    readFile(join(petDirectory, "pet.json")),
    readFile(join(petDirectory, "spritesheet.webp")),
    readFile(join(BUNDLED_PETS_DIRECTORY, "NOTICE.md")),
  ]);
  return { manifest, spritesheet, notice };
};

const createBundledPetArchive = async (petId: string) =>
  createPetArchive(await readBundledPetFiles(petId));

const readLocalPetCatalog = async () => {
  const petsDirectory = getPetsDirectory();
  const directoryEntries = await readdir(petsDirectory, { withFileTypes: true }).catch(() => []);
  const candidates = directoryEntries.filter(
    (entry) => entry.isDirectory() && SAFE_DIRECTORY_NAME.test(entry.name),
  );
  const results = await Promise.all(
    candidates.map(async (directoryEntry) => {
      try {
        const manifestText = await readFile(
          join(petsDirectory, directoryEntry.name, "pet.json"),
          "utf8",
        );
        const manifest: unknown = JSON.parse(manifestText);
        if (!isLocalPetManifest(manifest)) return undefined;

        const baseUrl = `${LOCAL_PETS_ROUTE}/${encodeURIComponent(directoryEntry.name)}`;
        return {
          id: manifest.id,
          displayName: manifest.displayName,
          description: manifest.description,
          manifestPath: `${baseUrl}/pet.json`,
        };
      } catch {
        // One malformed local package must not hide the other valid pets.
        return undefined;
      }
    }),
  );

  const pets = results.filter((entry) => entry !== undefined);
  pets.sort((left, right) => left.id.localeCompare(right.id));
  return { pets };
};

const bundledPetsPlugin = (): Plugin => ({
  name: "bundled-downloadable-pets",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const handleRequest = async () => {
        const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
        if (!requestUrl.pathname.startsWith(`${BUNDLED_PETS_ROUTE}/`)) {
          next();
          return;
        }

        if (requestUrl.pathname === `${BUNDLED_PETS_ROUTE}/index.json`) {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(await readFile(join(BUNDLED_PETS_DIRECTORY, "index.json")));
          return;
        }

        if (
          requestUrl.pathname === `${BUNDLED_PETS_ROUTE}/NOTICE.md` ||
          requestUrl.pathname === `${BUNDLED_PETS_ROUTE}/README.md`
        ) {
          const fileName = requestUrl.pathname.endsWith("NOTICE.md") ? "NOTICE.md" : "README.md";
          response.setHeader("Content-Type", "text/markdown; charset=utf-8");
          response.end(await readFile(join(BUNDLED_PETS_DIRECTORY, fileName)));
          return;
        }

        const downloadMatch = requestUrl.pathname.match(/^\/pets\/downloads\/([^/]+)\.zip$/);
        if (downloadMatch !== null) {
          const petId = decodeURIComponent(downloadMatch[1] ?? "");
          if (!SAFE_DIRECTORY_NAME.test(petId)) {
            response.statusCode = 400;
            response.end("Invalid pet id.");
            return;
          }

          const archive = await createBundledPetArchive(petId);
          response.setHeader("Content-Type", "application/zip");
          response.setHeader("Content-Disposition", `attachment; filename="${petId}.zip"`);
          response.setHeader("Cache-Control", "no-store");
          response.end(archive);
          return;
        }

        const routeParts = requestUrl.pathname.slice(BUNDLED_PETS_ROUTE.length + 1).split("/");
        if (
          routeParts.length !== 2 ||
          !SAFE_DIRECTORY_NAME.test(routeParts[0] ?? "") ||
          !PET_FILE_NAMES.has(routeParts[1] ?? "")
        ) {
          next();
          return;
        }

        const [petId = "", fileName = ""] = routeParts;
        const file = await readFile(join(BUNDLED_PETS_DIRECTORY, petId, fileName));
        response.setHeader(
          "Content-Type",
          fileName === "pet.json" ? "application/json; charset=utf-8" : "image/webp",
        );
        response.setHeader("Cache-Control", "no-store");
        response.end(file);
      };

      void handleRequest().catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          response.statusCode = 404;
          response.end("Pet asset not found.");
          return;
        }
        next(error);
      });
    });
  },
  async generateBundle() {
    const catalog = await readBundledPetCatalog();
    const [catalogSource, noticeSource, readmeSource] = await Promise.all([
      readFile(join(BUNDLED_PETS_DIRECTORY, "index.json")),
      readFile(join(BUNDLED_PETS_DIRECTORY, "NOTICE.md")),
      readFile(join(BUNDLED_PETS_DIRECTORY, "README.md")),
    ]);

    this.emitFile({ type: "asset", fileName: "pets/index.json", source: catalogSource });
    this.emitFile({ type: "asset", fileName: "pets/NOTICE.md", source: noticeSource });
    this.emitFile({ type: "asset", fileName: "pets/README.md", source: readmeSource });

    await Promise.all(
      catalog.pets.map(async ({ id }) => {
        if (!SAFE_DIRECTORY_NAME.test(id)) {
          throw new TypeError(`Invalid bundled pet id: ${id}`);
        }
        const { manifest, spritesheet, notice } = await readBundledPetFiles(id);
        const archive = createPetArchive({ manifest, spritesheet, notice });
        this.emitFile({ type: "asset", fileName: `pets/${id}/pet.json`, source: manifest });
        this.emitFile({
          type: "asset",
          fileName: `pets/${id}/spritesheet.webp`,
          source: spritesheet,
        });
        this.emitFile({
          type: "asset",
          fileName: `pets/downloads/${id}.zip`,
          source: archive,
        });
      }),
    );
  },
});

const localPetsPlugin = (): Plugin => ({
  name: "local-codex-pets",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const handleRequest = async () => {
        const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
        if (requestUrl.pathname === `${LOCAL_PETS_ROUTE}/index.json`) {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(JSON.stringify(await readLocalPetCatalog()));
          return;
        }

        const routeParts = requestUrl.pathname.slice(LOCAL_PETS_ROUTE.length + 1).split("/");
        if (
          !requestUrl.pathname.startsWith(`${LOCAL_PETS_ROUTE}/`) ||
          routeParts.length !== 2 ||
          !PET_FILE_NAMES.has(routeParts[1] ?? "")
        ) {
          next();
          return;
        }

        const directoryName = decodeURIComponent(routeParts[0] ?? "");
        const fileName = routeParts[1] ?? "";
        if (!SAFE_DIRECTORY_NAME.test(directoryName)) {
          response.statusCode = 400;
          response.end("Invalid pet directory.");
          return;
        }

        try {
          const file = await readFile(join(getPetsDirectory(), directoryName, fileName));
          response.setHeader(
            "Content-Type",
            fileName === "pet.json" ? "application/json; charset=utf-8" : "image/webp",
          );
          response.setHeader("Cache-Control", "no-store");
          response.end(file);
        } catch {
          response.statusCode = 404;
          response.end("Pet asset not found.");
        }
      };

      void handleRequest().catch(next);
    });
  },
});

export default defineConfig({ plugins: [bundledPetsPlugin(), localPetsPlugin()] });
