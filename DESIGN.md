---
name: Earth's Pulse
description: A NASA ocean-observation plate treated as a scientific instrument.
colors:
  primary: "#42c7d9"
  secondary: "#438be8"
  tertiary: "#9bc8d8"
  blocked: "#d6a84b"
  void: "#080d16"
  raised: "#101925"
  panel: "#151f2d"
  panel-deep: "#0b1220"
  plate-void: "#05080e"
  ink: "#e8eef5"
  muted: "#8b9aaa"
  faint: "#7c8ca0"
  line: "rgba(155, 200, 216, 0.14)"
  line-strong: "rgba(155, 200, 216, 0.26)"
  line-faint: "rgba(155, 200, 216, 0.07)"
  transparent: "transparent"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(30px, 3vw, 42px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.032em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(26px, 2.35vw, 34px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.027em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  reading:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "normal"
  nav:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.005em"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "9.5px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.12em"
  meta:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10.5px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  full: "50%"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
  4xl: "64px"
components:
  nav-link:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.muted}"
    typography: "{typography.nav}"
    rounded: "{rounded.none}"
    padding: "9px 0"
  stage-link:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 0 6px 20px"
  status-tag:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0"
  plate-frame:
    backgroundColor: "{colors.panel-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  source-panel:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
  transport:
    backgroundColor: "{colors.panel-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "13px 16px"
  button-primary:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "9px 13px"
---

# Design System: Earth's Pulse

## Overview

**Creative North Star: "The Calibrated Plate"**

Earth's Pulse reads as an oceanographic instrument bay, not a dashboard for selling one. The system borrows its composure from research charts and observatory consoles: a near-black navy field, one dominant NASA plate, hairline rules, and monospaced annotations that behave like measured labels. The page is quiet enough that the ocean image can carry it, and exact enough that provenance can interrupt the mood without feeling bolted on.

Everything is rectangular and flat. Depth comes from tone rather than stacked shadows, and the only ambient lift belongs to the visualization plate. Status is always spelled out next to its color. The layout gives the plate the first viewport and gives the source record a permanent rail, so the visual and the evidence are read together.

Motion is limited to state feedback: a thin scan line while the plate loads, 120ms color transitions, and no entrance choreography. The world explicitly refuses the dark neon dashboard, glass panels, gradient spectacle, hero metrics, and fake charts that would make an unavailable scientific system look finished.

**Key Characteristics:**
- Near-black navy fields with blue-grey hairlines.
- One rectangular 2:1 visualization plate as the dominant object.
- Inter for reading; IBM Plex Mono only for identifiers, coordinates, timestamps, and measurements.
- Cyan for available or active, amber for blocked, neutral grey for pending.
- Flat panels, square corners, and one deep plate shadow.
- Disabled controls that explain their missing subsystem in visible copy.

## Colors

The palette is a cold ocean field with three semantic signals: cyan for available, amber for blocked, and neutral blue-grey for pending. Blue and ice are supporting water tones, not competing accents.

### Primary
- **Instrument Cyan** (#42c7d9): Links, focus outlines, available status dots, plate loading progress, and the active navigation rule. Reserved for meaning and interaction; it never becomes a background wash.

### Secondary
- **Deep Current Blue** (#438be8): Defined as a supporting water tone in the token layer. Stage 1 does not need a second live accent, so the interface keeps it in reserve rather than spreading it across components.

### Tertiary
- **Sea Ice** (#9bc8d8): Inline code and the quiet emphasis line that closes the "Why sound" argument. It sits between text white and muted grey.

### Neutral
- **Abyss** (#080d16): Page floor and sticky header surface.
- **Raised Navy** (#101925): Plate bars, captions, source-record panels, and quiet callout blocks.
- **Instrument Panel** (#151f2d): Reserved panel tone for denser surfaces that need one more step of separation.
- **Deep Panel** (#0b1220): Player shell and plate frame.
- **Plate Void** (#05080e): Empty image field behind the NASA still.
- **Ink** (#e8eef5): Primary reading text and data values.
- **Muted Blue-Grey** (#8b9aaa): Secondary copy, navigation at rest, and field labels.
- **Faint Blue-Grey** (#7c8ca0): Tertiary labels, timestamps, and fine print that still meets AA.
- **Hairlines** (rgba 155, 200, 216 at 7%, 14%, and 26%): Section rules, row dividers, and frame borders. The 26% rule is the strongest structural line.

### Named Rules
**The One Signal Rule.** Cyan means available or active, amber means blocked or incomplete, and neutral grey means pending. Never use one of these hues for decoration.

**The Hairline Rule.** Structure is drawn with 1px rules and tonal shifts, not with rounded cards, glass, or shadows on panels.

## Typography

**Display Font:** Inter (self-hosted variable, with system-ui fallback)
**Body Font:** Inter (self-hosted variable, with system-ui fallback)
**Label/Mono Font:** IBM Plex Mono (self-hosted 400/500, with ui-monospace fallback)

**Character:** A calm research report with instrument labels. Inter carries sentences and titles; IBM Plex Mono marks the things that were looked up, measured, or timed.

### Hierarchy
- **Display** (600, clamp 30px to 42px, 1.06): Inner-page titles such as "About Earth's Pulse" and "Data sources and provenance."
- **Headline** (600, clamp 26px to 34px, 1.12): The Explore title, which must remain the largest reading voice on the primary surface.
- **Title** (600, 20px, 1.25): Article section headings and the top level of long-form content.
- **Body** (400, 14px, 1.6): Ledes, player notes, and interface copy. Measures stop around 61–64ch.
- **Reading** (400, 13.5px, 1.72): Article prose at a maximum of 68ch.
- **Nav** (500, 12px, 1.4): Top navigation and compact interface labels that must stay in the sans face.
- **Label** (500, 9.5px, 1.2, 0.12em, uppercase): Panel titles, field labels, table headers, and status tags.
- **Meta** (400, 10.5px, 1.45): Record values, dates, identifiers, and transport metrics.

### Named Rules
**The Measurement Mono Rule.** IBM Plex Mono is reserved for identifiers, coordinates, timestamps, units, machine status, and compact data values. Prose stays in Inter.

**The Quiet Heading Rule.** Headings gain emphasis through size and weight, never through gradient fills, shadows, or all-caps display type.

## Layout

The page uses a 1440px shell with 32px side gutters and 18px gutters below 760px. The header is a 64px sticky band with a single 1px bottom rule; below 980px it wraps the navigation onto a second row and grows to roughly 92px. Explore opens with a title block, then a two-column instrument bay: a flexible visualization column and a 368px evidence rail with a 26px gap. Below 1180px the rail moves under the plate as two columns; below 760px it becomes one column.

The plate holds a fixed 2:1 aspect ratio and always precedes the sonification transport. The rail places Source Record, Signal Path, and the data note in that order, because evidence should be read after the image but before any control. Inner pages use a 760px article column and a 220px sticky aside with a 64px gap; under 1180px the aside narrows to 200px, and under 980px the table of contents moves above the article and the footnote is hidden.

Spacing is grouped tightly inside a record, then separated generously between systems: 6–12px within rows, 14–18px between panels, 22–42px between major sections. Headings carry more space above than below. The page ends on a 62px footer band with a top hairline, never a call-to-action block.

## Elevation & Depth

The system is flat by default. Depth is tonal: Abyss sits behind Raised Navy, which sits behind the Deep Panel player shell and the Plate Void image field. A 1px border does the work that a shadow would do elsewhere. The only ambient shadow in the product is the deep, soft lift under the visualization plate.

### Shadow Vocabulary
- **Plate Lift** (`box-shadow: 0 30px 70px -44px rgba(0, 0, 0, 0.95)`): The visualization frame only. It keeps the NASA plate feeling mounted above the page without turning panels into floating cards.

### Named Rules
**The Single Lift Rule.** Only the visualization plate casts a shadow. Header, rail panels, player, tables, and callouts stay flat on their tonal layer.

## Shapes

The form language is rectilinear and instrument-like. Corners are square (0px radius); the only circles are 4px status dots and the 4px bullets in marker lists. Frames are 1px, controls are 24–44px tall, and the signature plate is a strict 2:1 rectangle with 9px L-shaped corner ticks at its four corners. There are no pills, no nested rounded cards, and no decorative clipping.

## Components

### Navigation
- **Style:** 12px Inter links in muted blue-grey, spaced 27px apart on a 64px sticky header.
- **States:** Hover lifts to ink; the current page uses ink plus a 1px cyan underline. Focus is a 1px cyan outline with 3px offset.
- **Stage link:** Separated by a 1px left rule and set in 10px mono uppercase, with an amber status dot. On mobile it collapses to "Stage 01" plus the dot.

### Buttons and Links
- **Primary button:** A square, transparent control with a 1px cyan border, 10px mono uppercase label, and 9px × 13px padding. Hover adds an 8% cyan wash; focus uses the global cyan outline.
- **Text links:** Cyan, no underline at rest, underline on hover with 3px offset. Arrow icons are 13–14px Lucide strokes.
- **Disabled transport:** A 44px square outlined play control at 65% opacity with `cursor: not-allowed`. It never pretends to be active; its visible note explains that Stage 2 is missing.

### Status Marks
- **Style:** A 4px dot plus a 9.5px mono uppercase label. Available is cyan, blocked is amber, pending is muted, neutral is faint.
- **Rule:** Color is never the only channel. Every dot has a word next to it, and blocked states carry a reason nearby.

### Cards and Panels
- **Corner style:** Square (0px).
- **Background:** Raised Navy for source panels and callouts; Deep Panel for the player; Abyss for the page.
- **Shadow:** None. Panels rely on a 1px hairline and surface tone.
- **Internal padding:** 12px × 14px for rail panels; 13px × 16px for the transport.

### Visualization Plate
- **Shape:** A 2:1 rectangle with a 34px metadata bar, a Plate Void image field, and a 10px caption band.
- **Frame:** 1px strong hairline with the Plate Lift shadow and four 9px cyan corner ticks at 50% opacity.
- **States:** Loading shows a centered "Loading rendered plate" overlay and a thin scanning rule; error replaces the image with a plain recovery message and a link to the NASA record. The caption and source credit never disappear.

### Sonification Transport
- **Shape:** Deep Panel shell with a 3-column metadata header, a dashed timeline rule, and a control row of square segments.
- **State:** The entire transport is offline in Stage 1. The play control, speed segments, and layer checkboxes are disabled, the status tag reads "Offline," and visible copy names the missing engine and numerical fields.

### Source Record
- **Shape:** Raised Navy panel with an 90px label column and flexible value column.
- **Type:** Values use 11.5px Inter; record IDs, dates, and file dimensions switch to mono.
- **Footer:** A 1px rule separates the NASA record link from the validation date.

## Do's and Don'ts

### Do:
- **Do** keep the NASA plate as the largest, first-read object on Explore.
- **Do** use 1px hairlines and tonal surfaces to separate regions before reaching for any shadow.
- **Do** pair every status color with a text label and a nearby reason.
- **Do** reserve IBM Plex Mono for identifiers, coordinates, timestamps, units, measurements, and machine status.
- **Do** keep reading measure between 61ch and 68ch and preserve the 2:1 plate ratio.
- **Do** let disabled controls state what is missing in visible copy as well as `aria-describedby`.
- **Do** keep the page background at Abyss and the plate frame on Deep Panel so the image remains the brightest field.

### Don't:
- **Don't** introduce gradients, glassmorphism, neon glows, or decorative blur.
- **Don't** wrap panels in rounded cards or add shadows to rail panels, the header, or the player.
- **Don't** communicate availability with color alone.
- **Don't** sample rendered pixel colors as measurements or imply that the plate is numerical data.
- **Don't** use marketing hero metrics, card grids, oversized slogans, or chart-like ornament that implies data we do not have.
- **Don't** make a disabled control look active or hide the reason it cannot be used.
- **Don't** use the mono face for prose.
