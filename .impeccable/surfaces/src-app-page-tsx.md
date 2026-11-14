---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

## Scope

Explore surface (`/`) for Stage 1. Mode: **Operate**. The visitor's job is to understand a real NASA ocean visualization, its provenance, and the current state of the sonification system. Not a marketing landing page.

## Audience and job

Curious public and blind/low-vision visitors, plus educators and Space Apps evaluators. They need to see the plate, read what it is and when it is from, and understand exactly which parts of the audio pipeline are unavailable. Secondary routes `/about` (Read) and `/data-sources` (Read) carry mission and provenance depth.

## Constraints

- Brief-pinned world: near-black navy, cyan/blue accents, Inter, mono metadata, restrained hairlines, no generic SaaS dashboard, no glass, no neon, no emoji.
- Only verified NASA SVS 3912 metadata and one verified 2048 × 1024 NASA still are available.
- No numerical ECCO2 fields, no audio engine, no frame timeline. Disabled controls must say why.
- Desktop primary; mobile keeps the same hierarchy rather than shrinking it.

## Direction contract

**THESIS:** A NASA Earth-observation plate treated as a working scientific instrument, not a marketing hero. The visualization is the largest object on screen; every number is attributable, every disabled control explains its missing subsystem. It refuses the category's hero-metric, card-grid, and glowing-dashboard arrangement.

**OWN-WORLD:** Near-black navy fields (#080D16, #101925, #151F2D), 1px instrument hairlines, cyan #42C7D9 for available/live, desaturated amber for blocked, Inter for reading, IBM Plex Mono only for identifiers, coordinates, timestamps, and measurements. Two-pixel corners, no gradients, no glass, no shadows except one deep soft lift under the plate. Corner ticks are the only ornament.

**STORY:** The visitor sees the real ECCO2 plate, reads its verified source record, follows the signal path from field to audio, and understands that Stage 1 is deliberately visual-only. They leave knowing what the colors represent, what the image cannot tell them, and where the numerical data would have to come from.

**FIRST VIEWPORT:** 64px top navigation; a title block carrying the scientific title and period; a two-column instrument bay with the 2:1 NASA plate on the left and a source/availability/signal-path rail on the right; the disabled sonification transport directly beneath the plate; a thin attribution footer. The plate dominates; the rail explains. No decorative content competes with it.

**FORM:** Brief-pinned scientific-instrument world, code-led. Position on ordered list: the brief pins the world, so no concept roll was run; the nearest rut (dark neon dashboard) is explicitly refused. Seed: `brief-pinned/operate`.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
