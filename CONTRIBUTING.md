# Contributing

[English](./CONTRIBUTING.md) · [简体中文](./CONTRIBUTING.zh-CN.md)

Thanks for helping improve `sprite-pet`.

## Development

Requirements:

- Node.js 24
- pnpm 10.34.5

Install dependencies and run the complete local gate:

```bash
pnpm install
pnpm check
pnpm test:browser
```

Use `pnpm dev` to open the interactive browser demo. Keep changes focused, add behavior-based tests
for runtime changes, and do not commit third-party pet artwork or generated package archives.

## Pull requests

- Explain the user-facing behavior and motivation.
- Add or update tests for runtime behavior.
- Keep `pnpm release:check` passing.
- Call out changes to the atlas or manifest contract.

For security issues, follow [SECURITY.md](./SECURITY.md) instead of opening a public issue.

Maintainers preparing a version should also follow [RELEASING.md](./RELEASING.md).
