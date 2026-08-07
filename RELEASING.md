# Releasing sprite-pet

[English](./RELEASING.md) · [简体中文](./RELEASING.zh-CN.md)

`package.json` is the version source. Stable releases use SemVer, an annotated `vX.Y.Z` Git tag,
and the npm `latest` dist-tag. GitHub Releases are not required because the package has no binary
assets; the npm registry and Git tag are the delivery surfaces.

## Prepare the release PR

1. Start from a clean `main` branch synchronized with `origin/main`.
2. Create the exact branch `release/vX.Y.Z`.
3. Run `pnpm release:prepare X.Y.Z` to update `package.json` and `pnpm-lock.yaml` together.
4. Add the `X.Y.Z` entry to `CHANGELOG.md`, with an English section followed by a Chinese section.
5. Update public documentation in both English and Chinese when user-facing behavior changes.
6. Run `pnpm release:check`, then review the packed file list and confirm that `demo/`, `pets/`,
   secrets, and local artifacts are absent.
7. Commit only `package.json`, `pnpm-lock.yaml`, and `CHANGELOG.md` as
   `chore(release): prepare vX.Y.Z`, push the branch, and open a pull request into `main`.

The release PR is intentionally limited to those three files. Documentation or implementation
changes must be reviewed and merged in an earlier PR.

## Release notes

Every published version should include a concise English section followed by a Chinese section,
covering user-visible changes, compatibility notes, and migration steps. Do not invent a changelog
entry when a version contains no relevant change.

## Publish and verify

Merge the release PR through GitHub after its required checks pass. The `Release npm package`
workflow accepts only a merged PR whose branch is exactly `release/vX.Y.Z`, whose version matches
the branch, and whose changed files match the release-only list. It then builds one npm artifact,
creates the annotated `vX.Y.Z` tag, and publishes that artifact through npm trusted publishing.

Do not create or push the release tag locally, and do not run `npm publish` from a workstation.
A direct commit to `main`, a regular feature PR, or a release PR containing unrelated files is not
eligible to publish. Other unrelated open pull requests do not block a valid release PR.

After the workflow completes, independently verify:

- `origin/main` and `vX.Y.Z` resolve to the intended commit;
- CI and Pages workflows succeed for that commit;
- npm reports version `X.Y.Z` and the intended dist-tag;
- the public tarball contains the runtime, declarations, license, and both READMEs, but no pet art;
- a fresh consumer can import the public package;
- the Pages homepage, JavaScript, CSS, catalog, and one download remain accessible.

If any remote step fails, inspect the release PR, branch, tag, npm version, dist-tag, workflow, and
working tree before retrying. Never reuse or overwrite a published version.
