# sprite-pet

English · [简体中文](./README.zh-CN.md)

A small, framework-agnostic TypeScript runtime for animated pets on the web. It separates semantic
browser behavior from source-atlas state names, preserves exact frame timing, and includes both a
CSS sprite runtime and the original high-DPI Canvas renderer.

The npm package ships no character artwork. The repository owner has confirmed explicit permission
for this project to display and distribute the downloadable files under `pets/`; that project-level
authorization does not place the artwork under the MIT License or grant downstream reuse rights.
See [THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md).

[Open the live demo](https://cixiangtao.github.io/sprite-pet/) to choose a pet, trigger behavior,
inspect its source-state mapping, and try floating, dragging, and resizing.

## Features

- Semantic behavior machine for idle, active, hover, click, drag, sleep, surprise, and celebration
- Browser-native CSS sprite and Canvas renderers with no runtime dependencies
- Codex atlas adapter with directional clips and nonuniform source frame timing
- DOM interaction runtime with pointer tracking, dragging, sizing, and complete cleanup
- Existing floating Canvas widget with viewport-safe dragging and proportional resizing
- Downloadable built-in pet gallery generated from portable pet bundles
- Remote URL and local browser-file loaders for the Canvas API
- Exact validation for the 8x9 atlas contract
- Nine named animation states with configurable FPS and looping
- Pointer following for every pet through the standard left/right movement animations
- Device-pixel-ratio-aware output and configurable sizing
- ESM bundle and TypeScript declarations built with tsdown

## Download a pet

The website packages each built-in pet as a ZIP containing `pet.json`, `spritesheet.webp`, and
`NOTICE.md`. These downloads are optional website assets; installing `sprite-pet` never installs
character artwork.

| Pet               | Download                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Doro              | [doro.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/doro.zip)                           |
| Goku              | [goku.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/goku.zip)                           |
| 咕嘎              | [guga.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/guga.zip)                           |
| 胡桃              | [hutao.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/hutao.zip)                         |
| ikkun             | [ikkun.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/ikkun.zip)                         |
| ikun-gaara        | [ikun-gaara.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/ikun-gaara.zip)               |
| ikun-giegie       | [ikun-giegie.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/ikun-giegie.zip)             |
| ikunchick         | [ikunchick.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/ikunchick.zip)                 |
| Kimlet Hover Clap | [kimlet-hover-clap.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/kimlet-hover-clap.zip) |
| Mini Elon         | [mini-elon.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/mini-elon.zip)                 |
| Nimbus            | [nimbus.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/nimbus.zip)                       |
| Shinchan          | [shinchan.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/shinchan.zip)                   |
| Trump             | [trump.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/trump.zip)                         |
| Usagi             | [usagi.zip](https://cixiangtao.github.io/sprite-pet/pets/downloads/usagi.zip)                         |

The source folders are available in [`pets/`](../pets/). The project is authorized to serve these
specific files, but download availability is not a downstream license grant; review the included
notice before reuse.

## Install

```bash
pnpm add sprite-pet
```

## Behavior runtime

Place the manifest and image on the same host:

```text
public/pets/momo/
├── pet.json
└── spritesheet.webp
```

```html
<div id="pet-shell">
  <span id="pet-sprite"></span>
</div>
```

```ts
import { PetRuntime, loadCodexPet } from "sprite-pet";

const spec = await loadCodexPet("/pets/momo/pet.json");
const interactionElement = document.querySelector<HTMLElement>("#pet-shell");
const spriteElement = document.querySelector<HTMLElement>("#pet-sprite");
if (interactionElement === null || spriteElement === null) throw new Error("Missing pet host");

const pet = new PetRuntime({
  spec,
  interactionElement,
  spriteElement,
  onDragMove: ({ deltaX, deltaY }) => {
    // The host owns placement; move the shell using the drag delta.
  },
});

pet.start();
pet.trigger("celebrate");
```

`PetRuntime` owns behavior, pointer listeners, and animation rendering, but it deliberately leaves
layout and persistence to the host. Call `pet.destroy()` when the host is removed.

## Canvas widget

The existing Canvas API remains supported:

```ts
import { SpritePetWidget, loadSpritePet } from "sprite-pet";

const source = await loadSpritePet("/pets/momo/pet.json");
const pet = new SpritePetWidget({ source, width: 192, floating: true });
pet.setState("working");
```

The floating widget starts near the bottom-right of the viewport. Drag the pet itself to move it
and use its bottom-right handle to resize it.

### Inline or floating

Floating mode is explicit and can be changed without recreating the renderer:

```ts
const pet = new SpritePetWidget({
  container: document.querySelector<HTMLElement>("#pet-slot")!,
  source,
  floating: false,
});

pet.setFloating({
  position: { x: 24, y: 24 },
  minWidth: 120,
  maxWidth: 480,
});

pet.moveTo(80, 120);
pet.resize(256);
pet.setFloating(false);
```

Pointer dragging is constrained to the visible viewport. Resizing preserves the pet's initial
aspect ratio and supports the arrow keys when the resize handle is focused.

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

The loader API remains available for applications that provide their own file picker. The current
demo focuses on behavior and direct manipulation rather than file inspection.

## Bundle format

### `pet.json`

```json
{
  "id": "momo",
  "displayName": "Momo",
  "description": "A tiny animated companion.",
  "spritesheetPath": "spritesheet.webp"
}
```

### Atlas geometry

The spritesheet is exactly `1536x1872`: 8 columns by 9 rows. Every cell is `192x208`.

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

Pointer following reuses the `move-right` and `move-left` rows, so no extra atlas data is required.

## API

### Behavior and Codex adaptation

- `loadCodexPet(manifestUrl, options?)` validates a Codex `pet.json`, its exact 8x9 image size,
  directional rows, and original per-frame durations.
- `adaptCodexPet(manifest, options?)` converts an already-loaded manifest into a
  `UnifiedPetSpec`.
- `PetBehaviorMachine` is a pure event-driven state machine for deterministic host integration and
  testing.
- `CssSpriteRenderer` renders a behavior snapshot into one existing DOM element.
- `PetRuntime` connects the behavior machine, CSS renderer, pointer input, dragging, and live
  proportional sizing.
- `getRenderedPetSize()`, `getPetScaleForSize()`, and `normalizePetScale()` support hosts that
  own their own placement UI.

### Loading

- `loadSpritePet(manifestUrl, options?)` loads a remote bundle.
- `loadSpritePetFiles({ manifest, spritesheet })` loads user-selected local files.
- `loadSpritePetSource(manifest, spritesheetUrl, options?)` loads an explicit pair.
- `parseSpritePetManifest(value)` validates untrusted JSON.

### `SpritePetWidget`

`SpritePetWidget` owns a lightweight DOM host and delegates drawing to `SpritePetRenderer`.

- `setFloating(false | options)` switches between inline and floating placement.
- `moveTo(x, y)` moves the floating widget in viewport CSS pixels.
- `resize(width)` resizes proportionally within the configured limits.
- `setState()`, `play()`, `pause()`, `lookAt()`, and the look-direction methods delegate to the
  renderer.
- `getSnapshot()` includes renderer state plus `floating`, `position`, `width`, and `height`.
- `destroy()` removes listeners and owned DOM. A caller-provided canvas is restored to its original
  position and inline style.

Use `floating: { draggable: false }` or `floating: { resizable: false }` to disable either
interaction. `minWidth`, `maxWidth`, `viewportMargin`, `position`, and `zIndex` are also configurable.

### `SpritePetRenderer`

Use the lower-level renderer when your application already owns the canvas and placement behavior:

```ts
import { SpritePetRenderer } from "sprite-pet";

const canvas = document.querySelector<HTMLCanvasElement>("#pet");
if (canvas === null) throw new Error("Missing pet canvas");

const renderer = new SpritePetRenderer({ canvas, source, width: 192 });
```

- `setState(state)` switches and resets a standard animation.
- `play()` and `pause()` control playback.
- `resize(width, height?)` updates CSS size and the high-DPI backing store.
- `setLookDirection(degrees)` selects the left or right movement animation for horizontal targets.
- `lookAt(clientX, clientY)` points a pet toward a viewport coordinate.
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
pnpm sync:pets
pnpm dev
pnpm check
pnpm test:browser
pnpm verify:package
```

`pnpm dev` merges the bundled demo catalog with valid packages found under
`${CODEX_HOME:-~/.codex}/pets`. This local route exists only in the development server; local pet
artwork is not copied into `demo-dist` or the npm package.

`pnpm release:check` runs the full local readiness gate. The project uses tsdown, TypeScript,
Oxlint, Oxfmt, Vitest, Vite, and a real Chromium smoke test.

Release Please maintains the release PR automatically. Maintainers should follow the bilingual
[release procedure](../RELEASING.md), review its version, changelog, and CI, and merge it when ready.
GitHub Actions owns the tag and npm publication.

Contributions are welcome. Read [CONTRIBUTING.md](../CONTRIBUTING.md) or its
[Chinese translation](../CONTRIBUTING.zh-CN.md), and report vulnerabilities through
[SECURITY.md](../SECURITY.md) or [SECURITY.zh-CN.md](../SECURITY.zh-CN.md).

## License

The renderer source is available under the [MIT License](../LICENSE). Downloadable pet artwork is
authorized for this project's public distribution but is not covered by that license; read
[THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md) before publishing or reusing it elsewhere.
