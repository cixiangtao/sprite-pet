---
version: 1
slug: "demo-index-html"
primary_target: "demo/index.html"
related_targets: ["demo/main.ts", "demo/style.css"]
---

# Pages playground

## Scope and mode

- Surface: `demo/index.html` and its supporting demo styles and interactions.
- Mode: Operate, with a small Persuade layer that points visitors to installation and the README.

## Audience, job, and action

- Primary audience: web developers who are also likely to prepare or test pet atlas assets.
- Primary job: select or load a pet, play its states, and verify the renderer immediately.
- Primary action: interact with the live pet; secondary actions are loading a custom bundle and
  continuing to the README for installation and API documentation.

## Proof, content, and constraints

- The working Canvas renderer, nine animation states, v2 pointer following, built-in pets, remote
  URL loading, and private local-file loading are the proof.
- Preserve the exact v1/v2 atlas contracts, browser-only behavior, `/sprite-pet/` Pages base path,
  typed library boundary, and artwork-free npm package.
- Built-in pets are authorized for the public Pages demo.

## Chosen direction

- A category-standard, mature open-source developer playground with no added thematic metaphor.
- Restrained cool-light workbench, pale sprite stage, one indigo action color, emerald success state,
  crisp dividers, compact developer typography, and low visual noise.
- The memorable moment is a large pet responding immediately while its state and source controls
  remain visibly connected to the preview.

## Approved composition

- Use the three-pane asset-authoring workbench shown in
  `.impeccable/mocks/three-pane-workbench.webp`.
- Desktop reading order: compact product rail; source navigator on the left; dominant live stage in
  the center; animation inspector on the right; eight-frame contact strip below; concise README and
  install handoff after the workbench.
- Responsive layouts may stack or collapse panes, but the live pet remains the first operational
  focus and the source, state, and frame relationships must stay obvious.

## Implementation inventory

| Visible ingredient        | Implementation medium                                        | Commitment                                                                 |
| ------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Product rail              | Semantic HTML and CSS                                        | Product name, copyable install command, README and GitHub links            |
| Built-in source navigator | Buttons, real manifests, and real spritesheet thumbnails     | Selected pet is unambiguous and gallery remains scrollable                 |
| Remote and local sources  | Existing forms with progressive disclosure                   | URL and local-file paths remain fully functional and errors stay visible   |
| Live stage                | Existing Canvas renderer and a CSS transparency grid         | Center pane dominates; v2 pets follow the pointer                          |
| Animation inspector       | Nine semantic buttons generated from the real state contract | Active state, icon, and state name are all visible                         |
| Eight-frame contact strip | Eight small canvases drawn from the loaded source image      | Frames reflect the active animation row, not decorative thumbnails         |
| Playback status           | Live renderer snapshot polling                               | Current frame, playing state, version, and source metadata remain accurate |
| Documentation handoff     | Semantic lower section                                       | Real install command and README link only; no fabricated proof             |
| Responsive behavior       | CSS grid and container-aware reflow                          | Three panes become stage-first stacked regions on narrow screens           |
| Motion and focus          | Existing renderer motion plus CSS state transitions          | Reduced-motion disables ornamental transitions, not pet playback controls  |

## Accepted translation

- The comp is a north star, not a literal screenshot: generated pet names, icons, counters, and
  metadata that do not exist in the product will not ship.
- The library exposes a live frame snapshot but no scrub API, so the contact strip is an accurate
  read-only view of the active atlas row rather than a draggable editor timeline.

## Unresolved

- None blocking implementation.
