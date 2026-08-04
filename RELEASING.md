# Releasing sprite-pet

[English](./RELEASING.md) · [简体中文](./RELEASING.zh-CN.md)

`package.json` is the version source. Stable releases use SemVer, an annotated `vX.Y.Z` Git tag,
and the npm `latest` dist-tag. GitHub Releases are not required because the package has no binary
assets; the npm registry and Git tag are the delivery surfaces.

## Before publishing

1. Start from a clean `main` branch synchronized with `origin/main`.
2. Choose the SemVer change and update `package.json` plus `pnpm-lock.yaml` together.
3. Update public documentation in both English and Chinese when user-facing behavior changes.
4. Run `pnpm release:check`.
5. Review the packed file list and confirm that `demo/`, `pets/`, secrets, and local artifacts are absent.
6. Commit as `chore(release): prepare vX.Y.Z` and create the annotated tag `vX.Y.Z`.

## Release notes

Every published version should include a concise English section followed by a Chinese section,
covering user-visible changes, compatibility notes, and migration steps. Do not invent a changelog
entry when a version contains no relevant change.

## Publish and verify

Publishing requires explicit authorization and npm credentials. Push the release commit and tag,
publish with the repository's supported npm flow, then independently verify:

- `origin/main` and `vX.Y.Z` resolve to the intended commit;
- CI and Pages workflows succeed for that commit;
- npm reports version `X.Y.Z` and the intended dist-tag;
- the public tarball contains the runtime, declarations, license, and both READMEs, but no pet art;
- a fresh consumer can import the public package;
- the Pages homepage, JavaScript, CSS, catalog, and one download remain accessible.

If any remote step fails, inspect the branch, tag, npm version, dist-tag, workflow, and working tree
before retrying. Never reuse or overwrite a published version.
