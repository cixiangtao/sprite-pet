---
name: "sprite-pet"
description: "A daylight behavior stage where the pet demonstrates the runtime through direct manipulation."
colors:
  page: "#f7f8fb"
  surface: "#ffffff"
  surface-muted: "#f1f4f8"
  ink: "#182230"
  control-ink: "#344054"
  muted: "#566174"
  quiet: "#778197"
  line: "#d9e0ea"
  line-strong: "#bcc7d6"
  accent: "#675cf5"
  accent-dark: "#5145df"
  accent-soft: "#efeeff"
  green: "#21865a"
  green-soft: "#eaf8f1"
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "clamp(3rem, 7vw, 6.6rem)"
    fontWeight: 760
    lineHeight: 0.95
    letterSpacing: "-0.07em"
  display-tablet:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "clamp(3.2rem, 15vw, 5.8rem)"
    fontWeight: 760
    lineHeight: 0.95
    letterSpacing: "-0.07em"
  display-mobile:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "clamp(3rem, 13.2vw, 4.8rem)"
    fontWeight: 760
    lineHeight: 0.95
    letterSpacing: "-0.06em"
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "clamp(1rem, 1.6vw, 1.22rem)"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "normal"
  eyebrow:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "0.78rem"
    fontWeight: 720
    lineHeight: "normal"
    letterSpacing: "0.16em"
  section:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "0.92rem"
    fontWeight: 650
    lineHeight: "normal"
    letterSpacing: "0.02em"
  control:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "0.9rem"
    fontWeight: 650
    lineHeight: "normal"
    letterSpacing: "normal"
  hint:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  data:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  arrow:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
rounded:
  handle: "6px"
  compact: "8px"
  option: "15px"
  control: "18px"
  mobile-card: "26px"
  habitat: "34px"
  pill: "999px"
spacing:
  xs: "0.25rem"
  sm: "0.6rem"
  md: "1rem"
  lg: "2rem"
  xl: "3rem"
components:
  behavior-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.control-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1rem"
  mode-toggle:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0.875rem 1rem"
  pet-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.data}"
    rounded: "{rounded.option}"
    padding: "0.5rem"
  mapping-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "1.125rem 1.25rem"
  habitat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.habitat}"
---

# Design System: sprite-pet

## Overview

**Creative North Star: "The Daylight Habitat"**

The Daylight Habitat is a bright operating surface where the pet itself proves the runtime. It
replaces the old atlas-inspector workbench with a behavior-first experience: visitors act, the pet
responds, and the exact source animation remains visible as supporting evidence.

The physical scene is a developer trying a playful browser component during an ordinary, well-lit
workday. That makes the light field intentional rather than theme-dependent. The page declares
`color-scheme: light` and remains light even when the operating system prefers dark mode.

## Visual character

- Cool daylight page field with low-opacity indigo and green atmosphere.
- White glass-like controls with cool gray borders and restrained shadows.
- Near-black typography with a very large, tightly tracked Chinese headline.
- Indigo for action, focus, and selection; green only for live and enabled state.
- Pixel artwork remains crisp and colorful without a dark inspection stage.

## Layout

Desktop uses a two-part stage: the promise, behavior controls, pet library, and source mapping occupy
the left; one dominant habitat occupies the right. The shell is capped at 1180px and vertically
centered in the first viewport.

Below 880px, the experience becomes a single column. The complete operating story stays in order:
promise, triggers, floating mode, picker, source mapping, then habitat. The pet library scrolls
horizontally rather than widening the page. Below 520px, metadata stacks and the habitat uses the
mobile corner token.

### Named rules

**Behavior Before Contract.** Visitors meet actions before atlas terminology. The mapping card
explains the contract only after the pet can be operated.

**One Dominant Habitat.** Never duplicate the live pet into several preview panes. Picker thumbnails
are navigation, not secondary stages.

**No Horizontal Page Drift.** Narrow screens may scroll the pet picker, but the document itself must
remain within the viewport.

## Type

The system uses the native UI sans stack so Chinese and Latin text share one practical voice. The
headline supplies character through scale, weight, and tight tracking instead of a separate display
family. Uppercase product labeling uses wide tracking; source states remain ordinary sans text so
they stay approachable rather than turning the page into a diagnostic console.

The three responsive display sizes are intentional tokens because line breaks are part of the
composition. Supporting copy uses generous leading; controls and facts remain compact.

## Color and state

The palette is restrained: cool neutrals plus indigo. Green appears only when a pet is live or
floating mode is enabled.

- `page` owns the full viewport.
- `surface` owns controls, mapping, and habitat.
- `accent` marks selected pets, focus, arrows, and interactive hover.
- `accent-soft` is the selected/hover wash.
- `green` and `green-soft` indicate a running pet or enabled switch.
- Borders carry most component structure; shadows belong to the habitat and selected pet only.

## Components

### Behavior chips

Pill buttons are lightweight semantic triggers. Hover and focus move them one pixel upward, change
the border to indigo, and apply the accent wash. They never look like primary navigation.

### Floating-mode switch

The switch is a full-width explanatory row rather than a bare toggle. Its copy names the mode and
its consequence; the control turns green only when enabled. The status word may disappear on narrow
screens, but the switch geometry and accessible checked state remain.

### Pet picker

Pet options expose one atlas frame at 48×52 CSS pixels. The row scrolls horizontally, selected state
uses an indigo border and wash, and every option keeps its human-readable label. Local and bundled
catalog entries use exactly the same visual treatment.

### Source mapping

The mapping card reads left to right from original Codex animation to semantic web behavior. It is
evidence, not a control. Long source names truncate instead of resizing the composition.

### Habitat

The habitat is the strongest container: a large white-to-cool gradient surface with a 34px corner,
one strong border, and a broad cool shadow. Indigo and green ambient circles keep the empty field
alive without competing with the sprite. Metadata stays attached below the stage.

### Direct manipulation

The pet shell owns hover, click, and drag input. A bottom-right resize handle becomes visible on
hover, keyboard focus, touch devices, or during resizing. Floating mode removes the habitat chrome,
keeps the page readable below, and makes only the pet accept pointer input.

## Motion and accessibility

- Control transitions use 120–180ms timing.
- Pet position uses an 80ms linear transition to keep dragging connected without feeling rigid.
- Reduced-motion preference collapses ornamental transitions and animation frame progression.
- All controls have visible focus outlines and semantic labels.
- Resize supports arrow keys plus Home and End.
- Escape exits floating mode.
- Light theme, contrast, and focus are invariant across system theme preferences.

## Do and don't

### Do

- Let direct pet behavior lead the page.
- Keep the source-state mapping visible and truthful.
- Use one bright habitat and allow pixel art to provide most of the color.
- Keep local-pet discovery development-only and visually identical to bundled pets.
- Preserve responsive line breaks and horizontal picker containment.

### Don't

- Reintroduce the three-pane atlas workbench as the opening experience.
- Add a dark-theme media override; this surface is intentionally light.
- Turn green into a general action color.
- Smooth, crop, or recolor the pet artwork.
- Hide placement ownership inside the runtime; the host owns page position.
