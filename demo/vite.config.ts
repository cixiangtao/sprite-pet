import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { defineConfig, type Plugin } from "vite";

const LOCAL_PETS_ROUTE = "/@local-pets";
const PET_FILE_NAMES = new Set(["pet.json", "spritesheet.webp"]);
const SAFE_DIRECTORY_NAME = /^[a-zA-Z0-9._-]+$/;

interface LocalPetManifest {
  id: string;
  displayName: string;
  description: string;
  spritesheetPath: string;
}

const getPetsDirectory = () => join(process.env.CODEX_HOME ?? join(homedir(), ".codex"), "pets");

const isLocalPetManifest = (value: unknown): value is LocalPetManifest => {
  if (typeof value !== "object" || value === null) return false;
  const manifest = value as Record<PropertyKey, unknown>;
  return ["id", "displayName", "description", "spritesheetPath"].every(
    (field) => typeof manifest[field] === "string" && manifest[field].length > 0,
  );
};

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

export default defineConfig({ plugins: [localPetsPlugin()] });
