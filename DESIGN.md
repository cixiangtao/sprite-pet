---
name: "sprite-pet"
description: "A cool-light developer workbench that puts live sprite proof ahead of explanation."
colors:
  shell: "#f6f8fb"
  surface: "#ffffff"
  surface-muted: "#f1f4f8"
  ink: "#101828"
  control-ink: "#344054"
  command-ink: "#263247"
  muted: "#566174"
  quiet: "#778197"
  line: "#d9e0ea"
  line-strong: "#bcc7d6"
  stage: "#0c111d"
  stage-grid: "#101725"
  indigo: "#675cf5"
  indigo-dark: "#5145df"
  indigo-soft: "#efeeff"
  selection-line: "#a9a2ff"
  green: "#21865a"
  green-soft: "#eaf8f1"
  red: "#b4233f"
typography:
  brand:
    fontFamily: '"Avenir Next", Avenir, ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.08rem"
    fontWeight: 750
    lineHeight: "normal"
    letterSpacing: "-0.025em"
  display:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(2rem, 4vw, 3.8rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  ui:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.74rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
  data:
    fontFamily: 'ui-monospace, "SFMono-Regular", Consolas, monospace'
    fontSize: "0.67rem"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
rounded:
  field: "7px"
  control: "8px"
  option: "9px"
  panel: "14px"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.55rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "2rem"
components:
  install-command:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.command-ink}"
    typography: "{typography.data}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.7rem"
    height: "2.5rem"
  button-primary:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.surface}"
    typography: "{typography.ui}"
    rounded: "{rounded.field}"
    padding: "0.55rem 0.75rem"
    height: "2.5rem"
  pet-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.option}"
    padding: "0.35rem 0.45rem"
    height: "3.6rem"
  pet-option-selected:
    backgroundColor: "{colors.indigo-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.option}"
    padding: "0.35rem 0.45rem"
    height: "3.6rem"
  state-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "0.45rem 0.55rem"
    height: "2.8rem"
  disclosure:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.option}"
    padding: "0.55rem 0.65rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.field}"
    padding: "0.55rem 0.65rem"
    height: "2.5rem"
  workbench:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
---

# Design System: sprite-pet

## Overview

**Creative North Star: "The Open Workbench"**

The Open Workbench is a precise, approachable environment for developers who need to see an atlas work before they trust it. Its cool-light shell and contiguous white panes make the interface feel like a mature browser tool, while the dark pixel stage gives the animated artifact a clear place of consequence.

The system is compact without feeling cramped. Crisp dividers, measured controls, restrained indigo selection, and explicit emerald or red status feedback make relationships legible without turning the product into a themed dashboard. Brand character comes from proportion, exact state design, and the contrast between quiet tooling and vivid pixel artwork.

**Key Characteristics:**

- Cool-light application shell with contiguous white working surfaces.
- Dark, gridded stages that isolate and dignify pixel artwork.
- Indigo for selection and action; emerald and red only for operational status.
- Dense, exact controls supported by generous space around the primary artifact.
- Crisp rules and tonal layering instead of decorative surface effects.

## Colors

The palette is a cool technical neutral field with one operational indigo accent and narrowly scoped semantic feedback.

### Primary

- **Workbench Indigo:** The sole action and selection color for primary buttons, active controls, focus outlines, and current frames.
- **Deep Workbench Indigo:** The hover tone for committed actions and interactive links.
- **Selection Wash:** A pale background that keeps selected list rows legible without overpowering their content.
- **Selection Line:** A quiet border that joins selected controls to the indigo family.

### Neutral

- **Cool Shell:** The page field around the tool.
- **Clean Surface:** The contiguous pane and control surface.
- **Muted Surface:** Hover, expanded, and secondary-area fill.
- **Workbench Ink:** Primary labels and content.
- **Control Slate:** Strong secondary control text and compact facts.
- **Command Ink:** Install-command text against a white control.
- **Muted Slate:** Explanatory text and ordinary metadata.
- **Quiet Slate:** Subordinate labels, frame counts, and captions.
- **Rule Gray / Strong Rule Gray:** Structural dividers; the stronger value closes major containers and regions.
- **Pixel Stage / Pixel Grid:** The near-black preview field and its low-contrast checker pattern.

### Status

- **Ready Emerald:** Successful readiness, privacy reassurance, and exact-contract confirmation.
- **Ready Wash:** Copied-command confirmation without introducing another action color.
- **Error Crimson:** Load and source failures in the status rail.

### Named Rules

**The One Accent Rule.** Indigo is the only interactive accent; semantic green and red communicate state and never compete for navigation or selection.

**The Artifact Contrast Rule.** Pixel artwork belongs on the dark stage; controls and explanatory content stay on light surfaces.

## Typography

**Display Font:** System UI sans-serif
**Body Font:** System UI sans-serif
**Brand Font:** Avenir Next (with Avenir and system sans-serif fallbacks)
**Label/Mono Font:** UI monospace (with SFMono-Regular and Consolas fallbacks)

**Character:** The system type stack keeps the workbench native, compact, and immediately readable. Avenir Next appears only in the product brand; monospace is reserved for commands, dimensions, row and frame numbers, and other machine-readable data.

### Hierarchy

- **Display:** A tightly tracked system heading for the documentation handoff, never the opening frame of the tool.
- **Brand:** A compact, confident product signature limited to the rail.
- **Body:** Calm explanatory copy with generous leading and a practical reading width.
- **UI:** Dense pane headings, button labels, and short supporting instructions.
- **Data:** Compact commands and exact atlas facts that benefit from aligned technical forms.

### Named Rules

**The Functional Mono Rule.** Use monospace only when the content is executable, numeric, versioned, or structurally exact; prose and ordinary labels remain system UI.

**The Singular Brand Face Rule.** Avenir Next is a product-name accent, not a heading system.

## Layout

The system uses one broad application shell capped at 94rem, with fluid outer gutters and compact pane padding. Operational surfaces favor contiguous regions separated by rules rather than floating cards. A dominant artifact region may take roughly twice the width of its adjacent inspectors, while narrow control panes keep lists dense and scannable.

At 60rem, secondary inspectors move below the main working row. At 48rem, the live artifact becomes the first stacked region, followed by source controls, state controls, and horizontally scrollable frame content. At 30rem, metadata stacks and secondary state details may collapse. Responsive reflow preserves the relationship between source, artifact, state, and exact data; it does not shrink the live proof into a thumbnail.

Spacing follows a compact rhythm for controls and a larger two-step rhythm between major regions. Dense items use the small spacing tokens; panels use the large token; major handoffs rely on fluid whitespace rather than extra card chrome.

### Named Rules

**The Contiguous Tool Rule.** Related controls and previews share one bordered working surface, with dividers carrying hierarchy inside it.

**The Artifact-First Reflow Rule.** On narrow screens, place the live artifact before its controls while keeping the controls in their causal order.

## Elevation & Depth

The system is flat and structural by default. Surface hierarchy comes from cool tonal shifts, crisp borders, and the dark stage rather than card shadows. Small shadows are reserved for active operational signals: the live status dot, the current frame, and the rendered pet itself.

### Shadow Vocabulary

- **Rendered Artifact:** A soft drop shadow separates sprite pixels from the stage without smoothing them.
- **Ready Signal:** A compact emerald glow makes live status visible at a glance.
- **Error Signal:** A compact crimson glow preserves the same status geometry on failure.
- **Current Frame:** A restrained indigo shadow marks playback position without lifting every frame cell.

### Named Rules

**The Flat-by-Default Rule.** Resting surfaces do not cast shadows; depth appears only where live state or the artifact itself needs separation.

## Shapes

The form language is gently squared and tool-like. Fields use the tightest corners, ordinary controls use a slightly softer radius, selectable rows and disclosures gain one additional step, and the outer workbench receives the broadest corner. Pills are reserved for compact counts or current-value badges; status markers remain circular. One-pixel borders define most silhouettes.

Pixel canvases and thumbnails preserve hard edges through pixelated rendering. The stage clips its contents to the containing workbench instead of introducing a second decorative frame.

## Components

### Buttons

- **Shape:** Compact rounded rectangles with one-pixel borders and control-density padding.
- **Primary:** White text on Workbench Indigo; hover moves to Deep Workbench Indigo without displacement.
- **Hover / Focus:** Color transitions are short and ease out; keyboard focus uses a visible indigo outline outside the control.
- **Secondary:** Install-command controls stay white with a strong neutral border and use Ready Wash only after copying.

### Selectable Rows

- **Style:** Pet and state rows begin neutral, gain a muted hover fill, and use Selection Wash plus Selection Line when pressed.
- **State:** A small circular marker repeats the same indigo selection signal at the far edge.
- **Content:** Human labels use system UI; row numbers, dimensions, and frame counts use data type.

### Cards / Containers

- **Corner Style:** Major containers use the broad panel shape; internal regions meet edge-to-edge.
- **Background:** Clean Surface for controls and panes, Pixel Stage for artwork.
- **Shadow Strategy:** Flat at rest; see Elevation & Depth for state-only exceptions.
- **Border:** Strong rules close the workbench and timeline, while ordinary rules divide panes and groups.
- **Internal Padding:** Compact and consistent around working controls.

### Inputs / Fields

- **Style:** White fill, strong neutral stroke, tight rounded corners, and system UI text.
- **Focus:** The shared external indigo outline applies without shifting layout.
- **Error / Disabled:** Errors are reported in the persistent status rail; disabled source options retain their geometry and lower opacity.

### Navigation

- **Style:** A compact sticky product rail places the brand first, install command next to documentation access, and repository access last. Text links are neutral at rest and use Deep Workbench Indigo on hover.
- **Mobile:** The rail becomes static, descriptive copy wraps to a second row, and low-priority text links yield before the install command.

### Source Disclosure

Expandable source tools look like ordinary bordered controls at rest. Opening a tool changes the summary to Muted Surface, adds a dividing rule, and reveals a compact form; the chevron rotates while reduced-motion preferences suppress the ornamental transition.

### Live Status

Status stays attached below the artifact. The dot, message, atlas dimensions, and grid present one continuous operational readout, with emerald for readiness and crimson for failure.

## Do's and Don'ts

### Do:

- **Do** let the live artifact dominate any operational surface built from this system.
- **Do** use contiguous light panes and one-pixel rules to show relationships between tools.
- **Do** reserve Workbench Indigo for action, selection, focus, and current playback state.
- **Do** keep pixel artwork crisp and place it on a dark, low-contrast grid when it needs inspection.
- **Do** pair exact atlas facts with monospace while keeping explanatory language in system UI.
- **Do** keep motion short and state-driven, and honor reduced-motion preferences for ornamental transitions.

### Don't:

- **Don't** turn the interface into a generic marketing hero before the working artifact appears.
- **Don't** scatter related controls into elevated cards or decorate every surface with shadows.
- **Don't** use Avenir Next beyond the product brand or use monospace as a general interface voice.
- **Don't** use emerald or crimson as competing action colors.
- **Don't** smooth pixel canvases, crop exact frame evidence, or hide operational errors in transient decoration.
