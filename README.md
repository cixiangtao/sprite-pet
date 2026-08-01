# sprite-pet

A small, framework-agnostic TypeScript library for rendering animated pets on the web with Canvas.
It loads a portable `pet.json + spritesheet` bundle, handles high-DPI rendering, plays nine standard
animation rows, and supports 16 pointer-facing poses for extended atlases.

`sprite-pet` ships no character artwork. You provide the files and remain responsible for permission
to use and distribute them.

## Features

- Browser-native Canvas renderer with no runtime dependencies
- Remote URL and local browser-file loaders
- Exact validation for 8x9 v1 and 8x11 v2 atlases
- Nine named animation states with configurable FPS and looping
- 16 clockwise look directions for v2 pets
- Device-pixel-ratio-aware output and configurable sizing
- ESM bundle and TypeScript declarations built with tsdown

## Install

```bash
pnpm add sprite-pet
```

## Quick start

Place the manifest and image on the same host:

```text
public/pets/momo/
├── pet.json
└── spritesheet.webp
```

```html
<canvas id="pet"></canvas>
```

```ts
import { SpritePetRenderer, loadSpritePet } from "sprite-pet";

const canvas = document.querySelector<HTMLCanvasElement>("#pet");
if (canvas === null) throw new Error("Missing pet canvas");

const source = await loadSpritePet("/pets/momo/pet.json");
const pet = new SpritePetRenderer({
  canvas,
  source,
  width: 192,
});

pet.setState("working");
window.addEventListener("pointermove", (event) => {
  pet.lookAt(event.clientX, event.clientY);
});
```

Call `pet.destroy()` when the canvas is removed.

## Local files

Web pages cannot read arbitrary files from a user's computer. Let the user select both files with
`<input type="file">`, then load them without uploading anything:

```ts
import { loadSpritePetFiles } from "sprite-pet";

const source = await loadSpritePetFiles({
  manifest: manifestFile,
  spritesheet: spritesheetFile,
});
```

See `pnpm dev` for a complete local-file picker.

## Bundle format

### `pet.json`

```json
{
  "id": "momo",
  "displayName": "Momo",
  "description": "A tiny animated companion.",
  "spritesheetPath": "spritesheet.webp",
  "spriteVersionNumber": 2
}
```

`spriteVersionNumber` may be omitted for a v1 image. The renderer infers the version from exact image
dimensions.

### Atlas geometry

Every cell is `192x208`, and every row contains 8 columns.

| Version | Image size  | Rows | Capability                     |
| ------- | ----------- | ---- | ------------------------------ |
| v1      | `1536x1872` | 9    | Standard animations            |
| v2      | `1536x2288` | 11   | Standard animations + 16 looks |

Standard rows:

| Row | State        |
| --- | ------------ |
| 0   | `idle`       |
| 1   | `move-right` |
| 2   | `move-left`  |
| 3   | `wave`       |
| 4   | `jump`       |
| 5   | `failure`    |
| 6   | `waiting`    |
| 7   | `working`    |
| 8   | `reviewing`  |

For v2, rows 9 and 10 contain 16 clockwise look poses in 22.5-degree steps. `0deg` points up,
`90deg` points screen-right, `180deg` points down, and `270deg` points screen-left.

## API

### Loading

- `loadSpritePet(manifestUrl, options?)` loads a remote bundle.
- `loadSpritePetFiles({ manifest, spritesheet })` loads user-selected local files.
- `loadSpritePetSource(manifest, spritesheetUrl, options?)` loads an explicit pair.
- `parseSpritePetManifest(value)` validates untrusted JSON.

### `SpritePetRenderer`

- `setState(state)` switches and resets a standard animation.
- `play()` and `pause()` control playback.
- `resize(width, height?)` updates CSS size and the high-DPI backing store.
- `setLookDirection(degrees)` renders a v2 look pose.
- `lookAt(clientX, clientY)` points a v2 pet toward a viewport coordinate.
- `clearLookDirection()` returns to the current animation.
- `getSnapshot()` exposes state for UI bindings and diagnostics.
- `destroy()` stops playback and clears the canvas.

Animation timing can be overridden per state:

```ts
new SpritePetRenderer({
  canvas,
  source,
  animations: {
    idle: { fps: 4 },
    wave: { fps: 10, loop: false },
  },
});
```

## Development

```bash
pnpm install
pnpm dev
pnpm check
pnpm test:browser
pnpm verify:package
```

`pnpm release:check` runs the full local readiness gate. The project uses tsdown, TypeScript,
Oxlint, Oxfmt, Vitest, Vite, and a real Chromium smoke test.

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md), and report vulnerabilities
through [SECURITY.md](./SECURITY.md).

## License

The renderer source is available under the [MIT License](./LICENSE). Pet artwork is not included and
may have separate terms.
