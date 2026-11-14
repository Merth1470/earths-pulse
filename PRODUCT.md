# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Greenfield build specified by the project brief: Next.js (App Router), React, TypeScript in strict mode, Tailwind CSS, and the browser Web Audio API. Canvas or SVG only when a visual overlay needs it; no Three.js or 3D globe in Stage 1. Scientific preprocessing will be Python/NumPy/xarray later, so the TypeScript data model stays independent of UI and serializable.

## Users

- **Primary:** people exploring NASA Earth observations who want an audio-first or audio-augmented interpretation, including blind and low-vision users who cannot rely on visual information alone.
- **Secondary:** educators, students, and NASA Space Apps Challenge evaluators who need to understand both the science and the provenance of the experience.

They arrive at a desktop browser, often with headphones, to understand global ocean circulation rather than to admire a render. Mobile and tablet are supported for the same task, not as a separate product.

## Product Purpose

Earth's Pulse makes Earth scientifically understandable through sound. It translates Earth observation and scientific model data into interactive, interpretable audio experiences.

The first subject is global ocean circulation and sea surface temperature, using NASA Scientific Visualization Studio record 3912 and its underlying ECCO2 model context. Success means a visitor can say what is shown, where it came from, what is real versus rendered, and what the audio would represent — without being misled by an unavailable subsystem.

## Positioning

Audio is generated from scientific variables through an explicit, inspectable mapping and synchronized to a NASA visualization. It is not background music, not a decorative soundtrack, and not an AI interpretation. Provenance stays visible at every step: original scientific data, NASA's rendered visualization, and any derived or normalized data are named as different things.

## Operating Context

- Runs in a modern browser as a public, unauthenticated web application.
- Desktop is the primary composition; tablet and mobile preserve the same reading order and control meanings.
- The NASA visualization covers **25 March 2007 12:00 UTC through 3 March 2008 12:00 UTC**. It is historical model output, never live conditions.
- The hackathon context rewards a reliable, legible demonstration over infrastructure. There is no database, authentication, payment, chatbot, or LLM integration.
- Headphones are recommended for the eventual audio experience; Stage 1 has no audio output.

## Capabilities and Constraints

**Implemented in Stage 1**

- Application shell with Explore, About, and Data Sources routes.
- A verified NASA SVS still (2048 × 1024 JPEG) presented as a rendered visualization, with source attribution.
- Scientific information panel with verified title, publisher, record ID, model, period, credits, and data-availability status.
- Disabled transport, speed, and layer controls that state why they are unavailable.
- Typed scientific data, NASA API, and audio interfaces; no fabricated measurements.
- Documented data-source validation and architecture.

**Explicitly not implemented in Stage 1**

- Numerical ECCO2 field acquisition or ingestion.
- Sonification engine, audio playback, time synchronization, region selection, or live NASA feeds.
- Any claim that the rendered image's pixel colors are measurements.

**Constraints**

- The SVS API exposes rendered media and metadata, not the underlying numerical ECCO2 fields.
- Numerical ECCO2 access requires a separate scientific data path and, for PO.DAAC, NASA Earthdata Login. Credentials must never reach the browser.
- The exact ECCO2 release behind the 2012 render may not be reproducible from the current ECCO product line; this is an open data-provenance question.
- TypeScript `any` is avoided unless a documented boundary requires it.
- External NASA links and attribution stay traceable in source.

## Brand Commitments

- Product name: **Earth's Pulse**. Tagline: **Listen to what you cannot see.**
- NASA attribution is mandatory and must distinguish NASA's visualization from this independent project.
- This is a NASA Space Apps Challenge project; it is not an official NASA product and NASA does not endorse it.
- The brief pins the visual world: deep near-black/navy ground, restrained cyan/blue accents, Inter for reading, monospaced type for coordinates and measurements, generous negative space, precise alignment, no generic SaaS dashboard, no glassmorphism, no neon cyberpunk, no emoji, no fabricated scientific imagery.
- Lucide is the icon system where an icon is genuinely needed.

## Evidence on Hand

- NASA SVS record 3912 API response, validated 14 November 2026: <https://svs.gsfc.nasa.gov/api/3912>
- NASA SVS visualization page: <https://svs.gsfc.nasa.gov/3912/>
- Local NASA still, 2048 × 1024 JPEG, 1,026,047 bytes: `public/assets/nasa/ecco2-global-currents-sst-2048.jpg`
- Verified credits: Greg Shirah, Horace Mitchell, Eric Sokolowsky (animation); Michael Starobin (producer); Hong Zhang (UCLA) and Dimitris Menemenlis (NASA/JPL) (scientists).
- ECCO2 model context: <https://ecco-group.org/products.htm> (ECCO2 legacy product, ECCO Cube92).
- **Absent:** numerical ECCO2 fields, any audio examples, user research, and a confirmed exact data release for the 2007–2008 render. None may be invented.

## Product Principles

1. **Science before spectacle.** A beautiful interface that blurs provenance is a failure.
2. **Provenance is part of the interface.** The visitor can always tell what is measured, modeled, rendered, or derived.
3. **Never fake a measurement or a control.** Unavailable systems are labeled, not simulated.
4. **Audio is an equal access path.** Sonification is designed as an interpretation of data, not an atmosphere.
5. **Build the smallest trustworthy system that can grow.** Stage 1 earns the right to add data and sound.

## Accessibility & Inclusion

The product exists because visual-only science excludes people. Stage 1 must already be keyboard-operable, screen-reader legible, reduced-motion aware, and free of color-only status communication. Disabled controls expose their reason through visible text and `aria-describedby`. Future audio must be accompanied by equivalent textual state, never by sound alone.

## Record Notes

This product record is derived from the supplied Stage 1 brief. No separate interview round was run because the brief resolves product truth, stack, scope, and visual direction and instructs implementation to proceed. Inferred audience details are marked as primary/secondary above rather than presented as research findings.
