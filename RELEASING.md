# Releasing sprite-pet

[English](./RELEASING.md) · [简体中文](./RELEASING.zh-CN.md)

GitHub Actions is the only npm and GitHub Release publisher. Release Please automatically creates
or updates the release pull request.

## Normal flow

1. Merge ordinary changes into protected `main` through pull requests and required checks.
   Unrelated open pull requests may remain open.
2. Release Please updates one automated release PR from a
   `release-please--branches--main--...` branch. Conventional commit or squash-merge titles
   determine the proposed SemVer version and `CHANGELOG.md` (`fix` = patch, `feat` = minor, and
   `!` or `BREAKING CHANGE` = major).
3. Review the release-only diff, proposed version, bilingual changelog, and CI, then merge the PR.
4. `.github/workflows/release.yml` revalidates that exact merge, builds and packs once, creates
   `vX.Y.Z`, publishes the inspected artifact through npm trusted publishing, and creates the
   matching GitHub Release.
5. Verify the tag target, GitHub Release flags, npm version/dist-tags, public tarball, fresh
   consumer import, and Pages site.

Do not bump versions, create tags, or publish from a workstation. Documentation and implementation
changes belong in ordinary PRs, not the automated release PR.

## Automation credentials and recovery

Define the Actions variable `RELEASE_APP_CLIENT_ID` and secret `RELEASE_APP_PRIVATE_KEY` for a
GitHub App installed on this repository with Contents, Issues, and Pull requests read/write
permissions. Its token lets required CI run unattended; PR checks created with the default
`GITHUB_TOKEN` currently wait for separate workflow approval.

If a remote step fails, inspect the merged release PR, workflow, tag, GitHub Release, npm version,
and dist-tags first. Then manually run the release workflow from `main` with that merged Release
Please PR number. Recovery revalidates the exact PR, merge commit, release-only diff, version,
ancestry, tag, and registry state before it resumes any missing steps. Never reuse or overwrite a
published version.
