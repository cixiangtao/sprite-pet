# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are web developers who want to add an animated sprite pet to a browser product.
They need a small runtime that separates the pet's semantic behavior from the source atlas state
names, while keeping the exact sprite contract easy to validate and integrate.

## Product Purpose

`sprite-pet` makes portable animated pets easy to load, animate, and host on the web without
adopting a framework. The behavior runtime translates browser interactions such as hover, click, and
drag into semantic pet behaviors, while adapters preserve the source atlas's own state names and
frame timing. A pet can live inline with the page or float above it as a movable companion.

Success means a visitor can choose a pet, trigger meaningful behavior, see which original animation
is playing, and understand how the same runtime supports inline, floating, draggable, and resizable
hosts.

## Positioning

The product combines a behavior state machine, a CSS sprite renderer, Codex atlas adapters, and the
existing dependency-free Canvas APIs under one exact, portable 8x9 contract. The browser demo proves
the behavior layer directly; local development can also discover Codex pet packages from the user's
local pet directory without bundling their artwork.

## Operating Context

- Developers evaluate the renderer through the public GitHub Pages demo, then use the README for
  installation, API details, and atlas documentation.
- Product developers can connect semantic behavior to any existing DOM host or continue using the
  higher-level Canvas widget.
- Visitors choose an included pet, trigger semantic behavior, observe the source-state mapping, and
  switch the same pet between staged and page-floating presentation.
- Local development merges bundled demo pets with valid packages from `~/.codex/pets`; the static
  Pages build contains only the already-authorized demo assets.

## Capabilities and Constraints

- The runtime is browser-only, framework-agnostic TypeScript with named exports and no global side
  effects.
- The semantic runtime supports autonomous idle activity, hover, click, drag, sleep, surprise, and
  celebration without exposing source-state names to the host.
- Floating presentation is explicit. The demo supports runtime mode changes, pointer dragging,
  proportional resizing, viewport constraints, persistence, keyboard sizing, and cleanup.
- The renderer supports one documented 8x9 atlas contract. Every cell is 192x208 pixels and every
  row contains eight frames.
- The public demo must remain deployable under the `/sprite-pet/` GitHub Pages repository path.
- Included pet artwork may be displayed in the public Pages demo under MIT authorization from the
  repository owner, but pet artwork remains excluded from the npm package.
- Public APIs remain typed and documented with JSDoc.

## Brand Commitments

- Preserve the product name `sprite-pet` and the terminology `pet.json`, `spritesheet`,
  behavior, source state, atlas, and built-in pet.
- The product voice should be concise, technically trustworthy, and approachable to developers who
  are actively making something playful.
- The Pages experience is a daylight behavior stage, not an atlas inspector: the pet leads, the
  behavior-to-source mapping stays visible, and direct manipulation proves the runtime.

## Evidence on Hand

- A working interactive demo exists in `demo/`.
- Built-in pet manifests and spritesheets exist under `demo/public/pets/` and are authorized for the
  public Pages experience.
- The built-in pets demonstrate semantic behavior mapped onto their original Codex animation rows.
- The README contains installation, quick-start, bundle-format, atlas, and API documentation.
- There are no testimonials, customer logos, usage metrics, benchmarks, or external endorsements;
  future pages must not fabricate them.

## Product Principles

1. Let the pet prove the renderer before asking visitors to read about it.
2. Keep behavior names independent from source-atlas state names.
3. Keep local discovery private and development-only; never leak local artwork into the build.
4. Make the exact atlas contract visible through behavior rather than an inspector-first UI.
5. Keep the public demo expressive while the npm package stays lean and artwork-free.
6. Keep rendering separate from placement so inline and floating integrations share one renderer.
