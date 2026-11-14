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

Earth's Pulse reads as an oceanographic instrument bay, not a dashboard for selling one. The system borrows its composure from research charts and observatory consoles: a near-black navy field, one dominant field plate, hairline rules, and monospaced annotations that behave like measured labels. The page is quiet enough that the ocean field can carry it, and exact enough that provenance can interrupt the mood without feeling bolted on.

Everything is rectangular and flat. Depth comes from tone rather than stacked shadows, and the only ambient lift belongs to the field plate. Status is always spelled out next to its color. The layout gives the field the first viewport and keeps the reading and evidence in a permanent rail, so the visual, the sound, and the numbers are read together.

Stage 2 adds a second channel without changing the visual language: the plate is now computed from the bundled field, the transport is live, and the rail reads the same sample that is sounding. Motion remains functional: advected particles show current direction, the playhead shows position, and the transport only changes on state. There is still no entrance choreography, no equalizer decoration, and no fake audio meter.

**Key Characteristics:**
- Near-black navy fields with blue-grey hairlines.
- One rectangular 2:1 computed field plate as the dominant object.
- Inter for reading; IBM Plex Mono only for identifiers, coordinates, timestamps, and measurements.
- Cyan for available, running, or focused; neutral grey for ready or paused; amber for a genuine error or missing condition.
- Flat panels, square corners, and one deep plate shadow.
- Missing data shown as text and silence, never as a zero value.
- A visible nonvisual path: reading panel, speech, live region, and full table.

## Colors

The palette is a cold ocean field with three semantic signals: cyan for available or active, amber for blocked or failed, and neutral blue-grey for pending or paused. Blue and ice are supporting water tones, not competing accents.

### Primary
- **Instrument Cyan** (#42c7d9): Active transport, links, focus outlines, available status dots, the position thumb, and the loading scan. Reserved for meaning and interaction; it never becomes a background wash.

### Secondary
- **Deep Current Blue** (#438be8): A supporting water tone in the token layer. The interface keeps it in reserve rather than spreading it across components.

### Tertiary
- **Sea Ice** (#9bc8d8): Inline code and quiet emphasis. It sits between text white and muted grey.

### Neutral
- **Abyss** (#080d16): Page floor and sticky header surface.
- **Raised Navy** (#101925): Plate bars, captions, panels, and quiet callout blocks.
- **Instrument Panel** (#151f2d): Reserved panel tone for denser surfaces that need one more step of separation.
- **Deep Panel** (#0b1220): Transport shell and plate frame.
- **Plate Void** (#05080e): Empty field behind the raster and the NASA still.
- **Ink** (#e8eef5): Primary reading text and data values.
- **Muted Blue-Grey** (#8b9aaa): Secondary copy, navigation at rest, and field labels.
- **Faint Blue-Grey** (#7c8ca0): Tertiary labels, timestamps, and fine print that still meets AA.
- **Hairlines** (rgba 155, 200, 216 at 7%, 14%, and 26%): Section rules, row dividers, and frame borders. The 26% rule is the strongest structural line.

### Named Rules
**The One Signal Rule.** Cyan means available, running, or focused; amber means blocked, failed, or missing. Neutral grey means ready or paused. Never use one of these hues for decoration.

**The Hairline Rule.** Structure is drawn with 1px rules and tonal shifts, not with rounded cards, glass, or shadows on panels.

**The Honest Silence Rule.** A missing value silences its voice. It is never mapped to zero, to the coldest temperature, or to slack water.

## Typography

**Display Font:** Inter (self-hosted variable, with system-ui fallback)
**Body Font:** Inter (self-hosted variable, with system-ui fallback)
**Label/Mono Font:** IBM Plex Mono (self-hosted 400/500, with ui-monospace fallback)

**Character:** A calm research report with instrument labels. Inter carries sentences and titles; IBM Plex Mono marks the things that were looked up, measured, or timed.

### Hierarchy
- **Instrument Display** (600, clamp 36px to 58px, 1.02, −0.038em): The Explore title, the largest reading voice on the primary surface.
- **Display** (600, clamp 30px to 42px, 1.06): Inner-page titles such as "About Earth's Pulse" and "Data sources and provenance."
- **Headline** (600, clamp 26px to 34px, 1.12): Section titles.
- **Title** (600, 20px, 1.25): Article section headings and the top level of long-form content.
- **Body** (400, 14px, 1.6): Ledes, player notes, and interface copy. Measures stop around 61–68ch.
- **Reading** (400, 13.5px, 1.72): Article prose at a maximum of 68ch.
- **Nav** (500, 12px, 1.4): Top navigation and compact interface labels that must stay in the sans face.
- **Label** (500, 9.5px, 1.2, 0.12em, uppercase): Panel titles, field labels, table headers, and status tags.
- **Meta** (400, 10.5px, 1.45): Record values, dates, identifiers, and transport metrics.
- **Value** (400, 16px, 1.2, tabular): The three current readings; 16px on mobile as well.

### Named Rules
**The Measurement Mono Rule.** IBM Plex Mono is reserved for identifiers, coordinates, timestamps, units, machine status, audio values, and compact data values. Prose stays in Inter.

**The Quiet Heading Rule.** Headings gain emphasis through size and weight, never through gradient fills, shadows, or all-caps display type.

**The Reading Size Rule.** The values that drive the sound never drop below 16px, even at 390px.

## Layout

The page uses a 1440px shell with 32px side gutters and 18px gutters below 760px. The header is a 64px sticky band with a single 1px bottom rule; below 980px it wraps the navigation onto a second row and grows to roughly 92px. Explore opens with a title block and a field bar, then a two-column instrument bay: a flexible field column and a 368px rail with a 26px gap. Below 1180px the rail moves under the plate, first as two columns with the reading panel full width, then as one column below 760px.

The plate holds a fixed 2:1 aspect ratio and precedes the transport. The rail order is **Current reading → Data record → Nonvisual path**, because the values and their provenance should be read before the secondary guide. The full transect table sits below the instrument, full width, because it is a reference rather than a control.

Inner pages use a 760px article column and a 220px sticky aside with a 64px gap; under 1180px the aside narrows to 200px, and under 980px the table of contents moves above the article.

Spacing is grouped tightly inside a record, then separated generously between systems: 6–12px within rows, 14–18px between panels, 22–42px between major sections. Headings carry more space above than below. The page ends on a 62px footer band with a top hairline, never a call-to-action block.

## Elevation & Depth

The system is flat by default. Depth is tonal: Abyss sits behind Raised Navy, which sits behind the Deep Panel transport shell and the Plate Void field. A 1px border does the work that a shadow would do elsewhere. The only ambient shadow in the product is the deep, soft lift under the field plate.

### Shadow Vocabulary
- **Plate Lift** (`box-shadow: 0 30px 70px -44px rgba(0, 0, 0, 0.95)`): The field frame only. It keeps the plate feeling mounted above the page without turning panels into floating cards.

### Named Rules
**The Single Lift Rule.** Only the field plate casts a shadow. Header, rail panels, transport, tables, and callouts stay flat on their tonal layer.

## Shapes

The form language is rectilinear and instrument-like. Corners are square (0px radius); the only circles are 4px status dots, the position thumb, and the 4px bullets in marker lists. Frames are 1px, controls are 32–44px tall, and the signature plate is a strict 2:1 rectangle with 9px L-shaped corner ticks at its four corners. There are no pills, no nested rounded cards, and no decorative clipping.

## Components

### Navigation
- **Style:** 12px Inter links in muted blue-grey, spaced 27px apart on a 64px sticky header.
- **States:** Hover lifts to ink; the current page uses ink plus a 1px cyan underline. Focus is a 1px cyan outline with 3px offset.
- **Stage link:** Separated by a 1px left rule and set in 10px mono uppercase, with a cyan dot and "Stage 02 / Audio active". On mobile it collapses to "Stage 02" plus the dot.

### Buttons and Links
- **Primary button:** A square, filled cyan control with a dark label, 10px mono uppercase, used for Play and Retry. Hover lightens; focus uses the global cyan outline.
- **Secondary button:** A square, transparent control with a 1px strong hairline, used for Stop and "Read this aloud".
- **Segmented control:** Square 32px buttons (40px on mobile) for 0.5×, 1×, 2×. The selected segment uses a cyan border, a 10% cyan wash, and cyan text.
- **Text links:** Cyan, no underline at rest, underline on hover with 3px offset. Arrow icons are 13–14px Lucide strokes.
- **Never fake a control:** if Web Audio is unavailable, transport controls are disabled and a visible note explains why. The field and readings remain live.

### Status Marks
- **Style:** A 4px dot plus a 9.5px mono uppercase label. Available/running is cyan; ready/paused is muted; complete is neutral; an actual failure is amber.
- **Rule:** Color is never the only channel. Every dot has a word next to it, and error states carry a reason nearby.

### Cards and Panels
- **Corner style:** Square (0px).
- **Background:** Raised Navy for the reading, record, and guide panels; Deep Panel for the transport; Abyss for the page.
- **Shadow:** None. Panels rely on a 1px hairline and surface tone.
- **Internal padding:** 12px × 14px for rail panels; 13px × 16px for the transport.

### Field Plate
- **Shape:** A 2:1 rectangle with a 34px metadata bar, a Plate Void field, a 5px SST legend, and a caption band.
- **Frame:** 1px strong hairline with the Plate Lift shadow and four 9px cyan corner ticks at 50% opacity.
- **Content:** SST raster, advected current particles, Natural Earth land outlines, graticule, highlighted transect band, playhead. The raster is computed from the bundled Int16 field, not from the NASA still.
- **Labels:** At narrow widths, latitude labels are omitted, longitude labels reduce to −120°/0°/120°, and the route text is omitted. The route remains in the field bar and reading.
- **States:** Loading shows a centered "Loading twelve monthly composites" message and a thin scanning rule; a request failure replaces it with a plain alert, the error reason, and a Retry button.
- **Corner tag:** "Computed from OSCAR + OISST" in the bar; "Field preview" or "Sonification running" at the top right of the field.
- **Caption:** Names the raster, particles, and band, and says the motion is accelerated. The month and source credit never disappear.

### Sonification Transport
- **Shape:** Deep Panel shell with a 4-part header (Play, Stop, copy, metrics), a position slider, a control row (speed, layers, volume), and a fineprint line.
- **States:** Ready, Running, Paused, Complete. Play becomes Pause in place; the icon and accessible name change together.
- **Position:** The slider is a sample index (0–47). Each arrow key moves one sample; `aria-valuetext` names step, longitude, and latitude. The fill is cyan.
- **Layers:** Three labelled checkboxes: Temperature tone, Current pulse, Flow texture. All three are independently switchable while playing.
- **Volume:** A native range with a percentage output, disabled if audio is unavailable.
- **Error:** A visible inline alert, not a silent failure.
- **Fineprint:** States that the same data and settings produce the same sound and that speed changes listening time only.

### Current Reading
- **Shape:** Raised Navy panel with a three-column value row, a position line, a plain-language sentence, and speech actions.
- **Type:** 8.5px mono labels; 16px tabular values; 12px description.
- **Values:** Sea surface temperature, current speed, and the compass direction the current flows toward. Missing values read "Missing", not a dash or zero.
- **Speech:** "Read this aloud" uses the browser voice. The "Announce every fourth step" checkbox swaps the polite live region for speech synthesis, so the two paths never duplicate.
- **Status:** Preview, Live, Paused, or Final sample. The status is always text.

### Data Record
- **Shape:** Raised Navy panel with a 90px label column and a flexible value column.
- **Type:** Values use 11.5px Inter; record IDs, dates, grid dimensions, and variables switch to mono.
- **Content:** Products, providers, period, sampling, grid, variables and depth, access. A footnote distinguishes the OSCAR/OISST field from the NASA SVS/ECCO2 reference.
- **Footer:** Source links and a link to full provenance.

### Transect Table
- **Shape:** A native `<details>` with a summary (route, sampled steps, summary statistics) and a real table.
- **Rows:** 48, thinned on narrow screens without changing the reading order. Columns: step, longitude, latitude, SST, speed, bearing, and a missing-data marker.
- **Rule:** The table carries the same numbers as the sound. It is not a decorative appendix.

## Do's and Don'ts

### Do:
- **Do** keep the computed field plate as the largest, first-read object on Explore.
- **Do** use 1px hairlines and tonal surfaces to separate regions before reaching for any shadow.
- **Do** pair every status color with a text label and a nearby reason.
- **Do** reserve IBM Plex Mono for identifiers, coordinates, timestamps, units, measurements, and machine status.
- **Do** keep reading measure between 61ch and 68ch and preserve the 2:1 plate ratio.
- **Do** make silence mean missing data, and say "Missing" in the reading.
- **Do** name the depth of each product: currents at 15 m, temperature at 0 m.
- **Do** keep the page background at Abyss and the plate frame on Deep Panel so the field remains the brightest surface.

### Don't:
- **Don't** introduce gradients, glassmorphism, neon glows, or decorative blur.
- **Don't** wrap panels in rounded cards or add shadows to rail panels, the header, or the transport.
- **Don't** communicate availability with color alone.
- **Don't** sample rendered pixel colors as measurements or imply that the NASA plate is numerical data.
- **Don't** map a missing value to zero, to the coldest temperature, or to slack water.
- **Don't** call the data live, current, or a forecast.
- **Don't** describe particle displacement as real-time or to scale.
- **Don't** use marketing hero metrics, card grids, oversized slogans, or chart-like ornament that implies data we do not have.
- **Don't** make a disabled control look active or hide the reason it cannot be used.
- **Don't** use the mono face for prose.
