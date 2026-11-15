# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, React 19, TypeScript strict, Tailwind CSS 4, Canvas 2D, and the browser Web Audio API. No Three.js, no 3D globe, no database, no authentication, no payment, no LLM. Scientific preprocessing is a set of Node scripts (`fetch-ocean-data.mjs`, `build-carbon-data.mjs`, `build-air-quality-data.mjs`) that reduce public records to small local bundles with provenance sidecars. The TypeScript data models are independent of UI and serializable.

## Users

- **Primary:** people exploring NASA Earth observations who want an audio-first or audio-augmented interpretation, including blind and low-vision users who cannot rely on visual information alone.
- **Secondary:** educators, students, and NASA Space Apps Challenge evaluators who need to understand both the science and the provenance of the experience.

They arrive at a desktop browser, often with headphones, to understand a scientific system rather than to admire a render. Mobile and tablet support the same task, not a separate product.

## Product Purpose

Earth's Pulse makes Earth scientifically understandable through sound. It translates verified public measurements into three interactive, interpretable audio experiences.

The subjects are the global ocean in **2012** (OSCAR near-surface currents and NOAA OISST), the global carbon cycle in **1959–2024** (NOAA Mauna Loa CO₂ and the Global Carbon Budget 2025), and city air quality in **2023** (US EPA ground monitors). Success means a visitor can hear a scientific distinction, read the same values as text, and say where the data came from, what is measured versus modeled or derived, and what the sound does not prove.

The NASA SVS 3912 render remains a cited reference visualization, not the numerical source.

## Positioning

Audio is generated from scientific variables through an explicit, inspectable mapping and synchronized to a rendered field. It is not background music, not a decorative soundtrack, and not an AI interpretation. Provenance stays visible: source products, the processed subset, derived speed/bearing, and the reference render are named as different things.

## Operating Context

- Runs in a modern browser as a public, unauthenticated web application.
- Desktop is the primary composition; tablet and mobile preserve reading order and control meanings.
- The numerical periods are **2012 monthly** (ocean), **1959–2024 annual** (carbon), and **2023 hourly** (air). All are historical, not live, and not forecasts.
- Ocean: one OSCAR 5-day composite and one daily OISST field per month; 12 frames total. Carbon: 66 annual budget records. Air: eight monitors × 8,760 hourly records.
- Ocean currents are at **15 m depth**; ocean temperature is at **0 m**. Carbon concentration is at one benchmark station; sinks are global model-based estimates. Air values are ground-monitor measurements, not satellite columns.
- The hackathon context rewards a reliable, legible demonstration over infrastructure. Headphones are recommended for the stereo cue.

## Capabilities and Constraints

**Implemented**

- Landing page with three experience cards, plus `/ocean`, `/carbon`, and `/air-quality` instruments.
- Ocean route with four zonal listening routes: Gulf Stream, Equatorial Pacific, Agulhas, Southern Ocean.
- Month selection across 12 frames; route and month changes reset playback honestly.
- Play, pause, resume, stop, seek by sample, 0.5×/1×/2× playback speed, volume, and three independent sound layers.
- Deterministic Web Audio mapping: SST → pitch/brightness; speed → pulse rate/accent; `u` → stereo; `v` → pulse pitch.
- Canvas field: SST raster from the Int16 data, advected current particles, land outlines, graticule, highlighted transect, playhead.
- Reading panel with exact values, plain-language descriptions, browser speech on demand, and an optional automatic speech mode.
- Polite live region for screen readers; full transect table with the same values.
- Loading, error, and retry states for the local data request.
- Carbon instrument: 66-year sequence, five independent voices, conceptual reservoir/flow diagram, flow definitions, and year comparison.
- City instrument: geographic monitor control, hourly timeline, three pollutant voices, spatial stereo, and same-hour city comparison.
- One `AudioContext` per mounted instrument, with pause/stop suspension and close on unmount; route change unmounts and closes it.
- About, Data Sources, and Accessibility routes that state the provenance and limits.
- Independent data and mapping verification scripts.

**Explicitly not implemented**

- Numerical ECCO2 fields. The endpoints were unreachable; the project does not pretend OSCAR/OISST are ECCO2.
- Continuous daily playback, interpolation between months, or a time-series claim from 12 samples.
- Subsurface circulation, volume transport, uncertainty propagation, or causal attribution.
- Live or forecast conditions of any kind.
- Carbon stocks, national inventories, or a full spatial carbon field.
- City-wide pollution averages, satellite columns, health effects, or regulatory compliance findings.
- A calibrated perceptual scale. The mappings are aids, not measurement instruments.

**Constraints**

- OSCAR is a satellite-derived analysis, not a direct measurement at every point.
- OISST is a blended gridded product, not a single instrument reading.
- Missing cells and hours are preserved; they are never filled with zero or a default value.
- Normalizations are dataset-specific: ocean SST 2nd–98th percentile and speed 98th percentile; carbon 2nd–98th percentiles per series; city pollutants 2nd–98th percentiles. Extremes saturate in sound but remain exact in text.
- TypeScript `any` is avoided unless a documented boundary requires it.
- External source links and attribution stay traceable in source.

## Brand Commitments

- Product name: **Earth's Pulse**. Tagline: **Listen to what you cannot see.**
- NASA attribution is mandatory and must distinguish NASA's visualization from this independent project.
- This is a NASA Space Apps Challenge project; it is not an official NASA product and NASA does not endorse it.
- Deep near-black/navy ground, restrained cyan/blue accents, Inter for reading, monospaced type for coordinates and measurements, generous negative space, precise alignment. No generic SaaS dashboard, glassmorphism, neon cyberpunk, emoji, or fabricated scientific imagery.
- Lucide is the icon system where an icon is genuinely needed.

## Evidence on Hand

- NASA SVS record 3912 API response, validated 14 November 2026: <https://svs.gsfc.nasa.gov/api/3912>
- NASA SVS visualization page: <https://svs.gsfc.nasa.gov/3912/>
- Local NASA still, 2048 × 1024 JPEG, 1,026,047 bytes: `public/assets/nasa/ecco2-global-currents-sst-2048.jpg`
- OSCAR ERDDAP dataset: <https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar>
- OISST ERDDAP dataset: <https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg>
- Bundled numerical subset: `public/data/ocean-2012.bin` (1.75 MB) and `public/data/ocean-2012.json` (provenance, sample times, statistics, limitations).
- Validation: 226,464 valid SST cells, 196,404 valid current vectors, SST −1.80…34.14 °C, speed 98th percentile 0.536 m/s.
- Carbon bundle: `public/data/carbon-1959-2024.json` (10.2 KB, 66 records, 1959–2024).
- Air bundle: `public/data/air-quality-2023.json` (0.93 MB, 8 monitors, 8,760 hours).
- Verification commands: `npm run verify` (data and mappings for all three experiences).
- **Absent:** numerical ECCO2 fields, uncertainty fields, a continuous 2012 series, user research, and a confirmed exact ECCO2 release for the 2007–2008 render. None may be invented.

## Product Principles

1. **Science before spectacle.** A beautiful interface that blurs provenance is a failure.
2. **Provenance is part of the interface.** The visitor can always tell what is observed, modeled, rendered, derived, or missing.
3. **Never fake a measurement or a control.** Unavailable systems are labeled; missing values are silent, not zero.
4. **Audio is an equal access path.** Sonification is an interpretation of data, accompanied by equivalent text, not an atmosphere.
5. **Build the smallest trustworthy system that can grow.** The data contract supports more routes, months, or variables without rewriting the engine.

## Accessibility & Inclusion

The product exists because visual-only science excludes people. The instrument is keyboard-operable, screen-reader legible, reduced-motion aware, and free of color-only status communication. The reading panel and full table carry every sounding value. Missing values are announced as missing. Audio begins only after a user gesture, and the interface explains that. The map is an additional representation, never the only one.

See [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for the implemented behavior and limitations.

## Record Notes

This product record was updated for Stage 3 after the carbon and air-quality experiences were implemented. The Stage 1 brief resolved product truth, stack, scope, and visual direction; no separate interview round was run. Audience statements are product intent, not research findings. ECCO2 access failures and the ocean dataset substitution are documented in [`docs/DATA_SOURCE_REPORT.md`](docs/DATA_SOURCE_REPORT.md).
