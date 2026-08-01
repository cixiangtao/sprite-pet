import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const packageRoot = new URL("..", import.meta.url);
const temporaryRoot = await mkdtemp(join(tmpdir(), "sprite-pet-package-"));

try {
  const { stdout } = await execute(
    "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", temporaryRoot],
    { cwd: packageRoot },
  );
  const packResult = JSON.parse(stdout);
  assert.equal(packResult.length, 1);

  const packed = packResult[0];
  assert.ok(packed.files.some(({ path }) => path === "dist/index.js"));
  assert.ok(packed.files.some(({ path }) => path === "dist/index.d.ts"));
  assert.ok(packed.files.some(({ path }) => path === "LICENSE"));
  assert.ok(!packed.files.some(({ path }) => path.startsWith("demo/")));

  const consumerRoot = join(temporaryRoot, "consumer");
  await mkdir(consumerRoot);
  await writeFile(
    join(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );

  const archive = join(temporaryRoot, packed.filename);
  await execute("npm", ["install", "--ignore-scripts", "--no-package-lock", archive], {
    cwd: consumerRoot,
  });
  await writeFile(
    join(consumerRoot, "smoke.mjs"),
    `import assert from "node:assert/strict";
import { SPRITE_PET_LAYOUT, SpritePetWidget, getLookCell, parseSpritePetManifest } from "sprite-pet";
assert.equal(SPRITE_PET_LAYOUT.cellWidth, 192);
assert.deepEqual(getLookCell(8), { row: 10, column: 0 });
assert.equal(parseSpritePetManifest({ id: "pet", displayName: "Pet", spritesheetPath: "pet.webp" }).id, "pet");
assert.equal(typeof SpritePetWidget, "function");
`,
  );
  await execute(process.execPath, ["smoke.mjs"], { cwd: consumerRoot });

  const packedManifest = JSON.parse(
    await readFile(join(consumerRoot, "node_modules", "sprite-pet", "package.json"), "utf8"),
  );
  assert.equal(packedManifest.license, "MIT");
  assert.equal(packedManifest.version, "0.1.0");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
