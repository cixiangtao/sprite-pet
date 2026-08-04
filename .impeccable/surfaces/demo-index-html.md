---
version: 1
slug: "demo-index-html"
primary_target: "demo/index.html"
related_targets: ["demo/main.ts", "demo/style.css"]
---

# Pages behavior stage

## Scope and mode

- Surface: `demo/index.html` and its supporting demo styles and interactions.
- Mode: Operate, with a small Persuade layer that demonstrates the runtime before documentation.

## Audience, job, and action

- Primary audience: web developers evaluating an animated browser pet runtime.
- Primary job: choose a pet, trigger semantic behavior, and verify the source-state mapping.
- Primary actions: interact with, float, drag, resize, or download the selected built-in pet.
- Secondary action: continue from the proven demo to installation, source, npm, or full documentation.

## Proof, content, and constraints

- The live behavior runtime, real 8x9 atlases, original frame timing, and direct manipulation are the
  proof.
- Preserve the browser-only boundary, `/sprite-pet/` Pages base path, typed library API, and
  artwork-free npm package.
- Bundled pets come only from root `pets/`. Local development may merge `~/.codex/pets`, but local
  pets never enter the static build.
- Every website ZIP contains `pet.json`, `spritesheet.webp`, and `NOTICE.md`.
- The experience defaults to Chinese and exposes complete English copy through a visible language
  switch, shareable `lang` query, and remembered preference.

## Chosen direction

- The Daylight Habitat: cool daylight, one dominant white pet stage, indigo interaction, green live
  state, and compact rounded controls.
- Desktop pairs a behavior-led promise and operating controls with the habitat. Narrow screens stack
  the complete story without horizontal page drift.
- The memorable moment is the same pet moving from staged preview to page-floating companion.

## Implementation inventory

| Visible ingredient  | Implementation medium               | Commitment                                            |
| ------------------- | ----------------------------------- | ----------------------------------------------------- |
| Behavior triggers   | Semantic buttons                    | Trigger runtime behaviors, not source row names       |
| Floating mode       | Accessible switch                   | Persist state and expose checked status               |
| Pet picker          | Real root-catalog thumbnails        | Scroll horizontally and preserve selection            |
| Source mapping      | Read-only live facts                | Keep source state and semantic behavior truthful      |
| Habitat             | CSS sprite runtime                  | Keep the pet crisp, draggable, and resizable          |
| Pet download        | Native download link                | Show only for root bundled pets and serve a named ZIP |
| Language switch     | Accessible two-option control       | Translate visible, live, metadata, and ARIA copy      |
| Responsive behavior | CSS grid and contained overflow     | Keep the document inside narrow viewports             |
| Rights notice       | ZIP member and documentation links  | Download availability never implies an asset license  |
| Developer handoff   | Ordered setup and TypeScript sample | Keep instructions truthful, brief, and after the demo |
| Project links       | Visible GitHub address and links    | Expose source, full docs, and the npm package         |

## Unresolved

- None blocking implementation.
