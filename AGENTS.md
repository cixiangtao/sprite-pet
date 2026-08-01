# AGENTS.md

## Project

`sprite-pet` is a framework-agnostic browser renderer for 8-column animated pet atlases.

## Commands

- `pnpm dev`: run the interactive browser demo.
- `pnpm build:demo`: build the GitHub Pages artifact into `demo-dist`.
- `pnpm check`: run lint, formatting, type checking, tests, and the library build.
- `pnpm test:browser`: build and verify the demo in Chromium.
- `pnpm verify:package`: pack the library and verify it from a fresh consumer.
- `pnpm release:check`: run the complete local release-readiness gate.

## Rules

- Keep the runtime browser-only and framework-agnostic.
- Keep pet artwork out of the npm package. Demo assets require a separate notice and explicit
  authorization before public redistribution.
- Keep the demo deployable under the `/sprite-pet/` GitHub Pages repository path.
- Preserve the documented 8x9 v1 and 8x11 v2 atlas contracts.
- Keep public APIs typed and documented with JSDoc.
- Prefer named exports and avoid global side effects.
- Keep checks read-only; use `pnpm lint:fix` only when intentionally rewriting files.

## Verification

- Runtime changes: `pnpm check` and `pnpm test:browser`.
- Package metadata or exports: also run `pnpm verify:package`.
- Demo-only changes: `pnpm build:demo` and `pnpm test:browser`.
