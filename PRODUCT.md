# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are web developers who want to add an animated sprite pet to a browser product.
These developers are often also the artists or asset authors preparing and testing the pet atlas,
so the product must support both integration and asset validation in one workflow.

## Product Purpose

`sprite-pet` makes portable animated pets easy to preview and render on the web without adopting a
framework. The Pages experience should prioritize immediate, hands-on play with a working pet while
still helping developers understand the package and continue to the README for installation and
complete documentation.

Success means a visitor can quickly recognize what the renderer does, try its meaningful states and
pointer behavior, and understand how their own `pet.json + spritesheet` bundle fits the same model.

## Positioning

The product combines a dependency-free Canvas renderer with an exact, portable atlas contract and a
browser-only playground that can load both remote and local pet bundles. Local files stay inside the
browser tab rather than being uploaded.

## Operating Context

- Developers evaluate the renderer through the public GitHub Pages demo, then use the README for
  installation, API details, and atlas documentation.
- Asset authors switch among the nine standard animation states and, for v2 pets, test 16
  pointer-facing poses.
- Visitors can select an included pet, load a manifest URL, or select a local `pet.json` and
  spritesheet pair.

## Capabilities and Constraints

- The runtime is browser-only, framework-agnostic TypeScript with named exports and no global side
  effects.
- The renderer supports the documented 8x9 v1 and 8x11 v2 atlas contracts. Every cell is 192x208
  pixels and every row contains eight frames.
- The public demo must remain deployable under the `/sprite-pet/` GitHub Pages repository path.
- Included pet artwork may be displayed in the public Pages demo under MIT authorization from the
  repository owner, but pet artwork remains excluded from the npm package.
- Public APIs remain typed and documented with JSDoc.

## Brand Commitments

- Preserve the product name `sprite-pet` and the terminology `pet.json`, `spritesheet`, v1, v2,
  state, atlas, and built-in pet.
- The product voice should be concise, technically trustworthy, and approachable to developers who
  are actively making something playful.
- The Pages experience should use the familiar structure and interaction grammar of a mature
  open-source developer playground. Clarity and speed take priority over a themed visual metaphor;
  craft should come from hierarchy, proportion, typography, and precise state design.

## Evidence on Hand

- A working interactive demo exists in `demo/`.
- Built-in pet manifests and spritesheets exist under `demo/public/pets/` and are authorized for the
  public Pages experience.
- A generated v2 sample demonstrates pointer-facing poses without relying on included artwork.
- The README contains installation, quick-start, bundle-format, atlas, and API documentation.
- There are no testimonials, customer logos, usage metrics, benchmarks, or external endorsements;
  future pages must not fabricate them.

## Product Principles

1. Let the pet prove the renderer before asking visitors to read about it.
2. Treat asset creation and code integration as two halves of one developer workflow.
3. Keep local experimentation private, direct, and free from upload steps.
4. Make the exact atlas contract visible through behavior rather than marketing claims.
5. Keep the public demo expressive while the npm package stays lean and artwork-free.
