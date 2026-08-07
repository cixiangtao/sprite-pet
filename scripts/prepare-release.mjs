import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const [version, ...extraArguments] = process.argv.slice(2);
const versionPattern = /^\d+\.\d+\.\d+(?:-(?:alpha|beta|rc|next)(?:\.[0-9A-Za-z-]+)*)?$/u;

if (!version || extraArguments.length > 0 || !versionPattern.test(version)) {
  throw new Error("Usage: pnpm release:prepare <X.Y.Z|X.Y.Z-(alpha|beta|rc|next).N>");
}

const branch = execFileSync("git", ["branch", "--show-current"], {
  encoding: "utf8",
}).trim();
const expectedBranch = `release/v${version}`;

if (branch !== expectedBranch) {
  throw new Error(
    `Release preparation must run on ${expectedBranch}; current branch is ${branch}.`,
  );
}

const status = execFileSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
}).trim();

if (status) {
  throw new Error("Release preparation requires a clean working tree.");
}

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

if (packageJson.version === version) {
  throw new Error(`package.json is already at version ${version}.`);
}

execFileSync("npm", ["version", version, "--no-git-tag-version"], {
  stdio: "inherit",
});
execFileSync("pnpm", ["install", "--lockfile-only"], {
  stdio: "inherit",
});

console.log(`Prepared package.json and pnpm-lock.yaml for v${version}.`);
console.log(
  "Add the bilingual CHANGELOG.md entry, run pnpm release:check, then open the release PR.",
);
