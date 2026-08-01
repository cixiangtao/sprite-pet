import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

const sourceRoot = resolve(process.argv[2] ?? join(homedir(), ".codex", "pets"));
const destinationRoot = resolve("demo/public/pets");

const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const makeProjectNeutral = (description) => description.replaceAll("Codex pet", "web pet");

const readPet = async (directoryName) => {
  const sourceDirectory = join(sourceRoot, directoryName);
  const manifestPath = join(sourceDirectory, "pet.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  if (
    !isRecord(manifest) ||
    typeof manifest.id !== "string" ||
    typeof manifest.displayName !== "string" ||
    typeof manifest.description !== "string" ||
    manifest.spritesheetPath !== "spritesheet.webp"
  ) {
    throw new Error(`Invalid pet manifest: ${manifestPath}`);
  }

  if (manifest.id !== directoryName) {
    throw new Error(`Pet id ${manifest.id} does not match directory ${directoryName}.`);
  }

  const version = manifest.spriteVersionNumber ?? 1;
  if (version !== 1 && version !== 2) {
    throw new Error(`Unsupported sprite version for ${manifest.id}: ${version}`);
  }

  const destinationDirectory = join(destinationRoot, manifest.id);
  const bundledManifest = {
    ...manifest,
    description: makeProjectNeutral(manifest.description),
  };
  await mkdir(destinationDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      join(destinationDirectory, "pet.json"),
      `${JSON.stringify(bundledManifest, null, 2)}\n`,
      "utf8",
    ),
    copyFile(
      join(sourceDirectory, manifest.spritesheetPath),
      join(destinationDirectory, "spritesheet.webp"),
    ),
  ]);

  return {
    id: manifest.id,
    displayName: manifest.displayName,
    description: bundledManifest.description,
    spriteVersionNumber: version,
    manifestPath: `./pets/${manifest.id}/pet.json`,
  };
};

const directoryEntries = await readdir(sourceRoot, { withFileTypes: true });
const directoryNames = directoryEntries
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .toSorted((left, right) => left.localeCompare(right));

if (directoryNames.length === 0) {
  throw new Error(`No pet directories found in ${sourceRoot}.`);
}

await mkdir(destinationRoot, { recursive: true });
const pets = await Promise.all(directoryNames.map(readPet));

await writeFile(
  join(destinationRoot, "index.json"),
  `${JSON.stringify({ pets }, null, 2)}\n`,
  "utf8",
);

console.log(`Copied ${pets.length} pets from ${sourceRoot} to ${basename(destinationRoot)}.`);
