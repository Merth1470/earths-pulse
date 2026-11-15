# Earth's Pulse

**Listen to what you cannot see.**

Earth's Pulse is an independent NASA Space Apps Challenge project: a browser-based sonification platform with three scientific instruments. It is built for blind and low-vision listeners first, and for anyone who wants a second way to read the planet.

| Experience | Route | Scientific question | Period |
| --- | --- | --- | --- |
| **Earth's Pulse** | `/ocean` | How do temperature and current change across a listening route? | 2012 monthly |
| **The Invisible Breath** | `/carbon` | How do concentration, emissions, sinks, and the accounting residual differ? | 1959–2024 annual |
| **The Sound of a City** | `/air-quality` | How does one ground monitor's pollution change by hour and place? | 2023 hourly |

Nothing here is live, forecast, or sampled at a resolution the source does not provide. The three datasets have different periods, units, and limits, and the interface keeps those differences visible.

## What works

| Capability | Implementation |
| --- | --- |
| Ocean field | 12 monthly OSCAR + OISST composites, 1.5° grid (240 × 106), 2012 |
| Ocean sound | Temperature → pitch and brightness; speed → pulse; east–west flow → stereo; north–south → pulse pitch |
| Ocean routes | Gulf Stream, Equatorial Pacific, Agulhas, Southern Ocean; 48-step transects |
| Carbon record | 66 annual global records, 1959–2024; NOAA Mauna Loa CO₂ + Global Carbon Budget 2025 |
| Carbon sound | Five independent voices: atmosphere, emissions, ocean sink, land sink, budget residual |
| Carbon diagram | Conceptual reservoir/flow diagram; concentration, emissions, sinks, and residual kept distinct |
| Air record | 8 co-located US EPA ground monitors, 8,760 hours each, PM2.5 + NO₂ + ozone, 2023 |
| Air sound | PM2.5 low haze, NO₂ reedy pulse, ozone high band; longitude → stereo; hourly playback |
| Air map | Geographic monitor control with a keyboard-native city select; not an interpolated surface |
| Shared transport | Play, pause, resume, stop, seek by real sample, 0.5× / 1× / 2×, volume, independent layers |
| Accessibility | Keyboard operation, visible focus, readable values, traceable tables, polite live regions, browser speech, reduced motion |
| Provenance | Source links, sample periods, units, per-series statistics, reproducibly built bundles, documented limits |
| Verification | Data and mapping checkers for all three experiences; TypeScript, lint, and build pass |

The map is a rendering of numbers, not their source. The bundled NASA SVS 3912 ECCO2 still is a **separate reference visualization** from 2007–2008; it is not the numerical source for the ocean dataset.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Audio starts only after a click on Play, as browsers require.

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run verify
```

## Verify the data and mappings

```bash
npm run verify
```

It runs six checks:

- `verify:data` decodes the ocean binary and checks frame count, grid size, valid-cell counts, ranges, statistics, and normalization.
- `verify:mapping` checks the ocean mapping for determinism, monotonic behavior, and silence for missing values.
- `verify:carbon` checks 66 annual records, units, budget identities, ranges, and provenance text.
- `verify:carbon-mapping` checks the five carbon voices, independent concentration/change parameters, sign handling, and determinism.
- `verify:air` checks eight cities, 8,760 hours, null preservation, pollutant ranges, and source text.
- `verify:air-mapping` checks pollutant voices, west/east stereo, missing-value silence, and determinism.

## Data

### Ocean

- **OSCAR near-surface currents** (Earth & Space Research, NASA-funded), 5-day composites, 1/3°, **15 m depth**, via NOAA CoastWatch ERDDAP `jplOscar`. It is an analysis, not a direct measurement at every point.
- **NOAA OISST v2.1**, daily, 0.25°, 0 m, via `ncdcOisst21Agg`. A blended satellite/in-situ product.
- One composite nearest the 15th of each month, resampled bilinearly to a shared 1.5° grid.
- `public/data/ocean-2012.bin`: 1.75 MB, Int16 little-endian, frame-major, north-to-south. Fill = `-32768`.
- 226,464 valid SST cells (−1.80 to 34.14 °C) and 196,404 valid current vectors; 98th-percentile speed 0.536 m/s.
- Coastal cells with a missing source corner are left missing. Nothing is filled across land or treated as zero.

Rebuild with `node scripts/fetch-ocean-data.mjs` (network access to NOAA ERDDAP; cached in `scripts/.cache/`).

### Carbon

- **NOAA GML Mauna Loa annual mean CO₂**, ppm. One benchmark station, not a global spatial mean.
- **Global Carbon Budget 2025**, global summary, GtC/yr. DOI [10.18160/gcp-2025](https://doi.org/10.18160/gcp-2025).
- Intersection: **1959–2024, 66 complete annual records**.
- `public/data/carbon-1959-2024.json`: 10.2 KB, with concentration, annual change, fossil emissions, land-use emissions, ocean and land sinks, atmospheric growth, cement carbonation, budget residual, statistics, definitions, and limitations.
- 2024: CO₂ **424.61 ppm**; total emissions **11.79 GtC/yr**; ocean sink **3.39 GtC/yr**; land sink **1.94 GtC/yr**.
- Sinks are model-based global estimates. Stocks are **not** estimated. No year is interpolated.

Rebuild with `node scripts/build-carbon-data.mjs`.

### Air quality

- **US EPA AirData** pre-generated hourly files for 2023: PM2.5 (88101), NO₂ (42602), ground-level ozone (44201).
- Eight cities, each represented by **one co-located ground monitor** reporting all three pollutants.
- Cities: Los Angeles, Seattle, Denver, Houston, Minneapolis, New York, Phoenix, Philadelphia.
- **8,760 hours per city in UTC**; nulls preserved, no interpolation.
- `public/data/air-quality-2023.json`: 0.93 MB. Valid city-hours: 69,074 PM2.5; 66,135 NO₂; 65,043 ozone.
- 98th percentiles: PM2.5 **31.9 µg/m³**, NO₂ **39.4 ppb**, ozone **0.066 ppm**.
- A few reported values are slightly negative (instrument noise/zero drift); they are preserved as reported, not replaced with zero.

Rebuild with `node scripts/build-air-quality-data.mjs`.

## Accessibility

Every experience has a nonvisual path:

- One `<h1>`, one `<main>`, labelled controls, visible focus, and a skip link.
- The ocean position slider moves **one sample per arrow key**; the carbon slider moves one year; the city hour slider moves one hour. Value text names the step and context.
- The reading panels print the same values the audio uses. A verification table or definition accompanies each experience.
- Missing values are announced as missing; they are never sonified as zero or as the lowest value.
- A polite live region announces every fourth ocean sample, every fifth carbon year, and every fourth city hour. Enabling browser speech removes the live region, avoiding duplicate announcements.
- “Read this aloud” speaks the current reading on demand.
- `prefers-reduced-motion` stops ocean particle motion and uses static current vectors.
- Switching experiences unmounts the previous instrument and closes its `AudioContext`.

See [`ACCESSIBILITY.md`](ACCESSIBILITY.md) and the in-app `/accessibility` guide.

## Sound mapping

### Ocean

| Data | Sound |
| --- | --- |
| Sea surface temperature | Pitch across C3–C5 (two octaves) and low-pass brightness |
| Current speed | Pulse rate (0.65–6 Hz) and pulse accent |
| East–west current | Stereo position, limited to ±0.9 |
| North–south current | Pulse pitch, ±3 semitones |
| Position on the transect | Time, west to east |

### Carbon

| Data | Sound |
| --- | --- |
| Atmospheric CO₂ concentration | Harmonic drone, 110–220 Hz across the record |
| Year-to-year CO₂ change | Tremolo rate, 0.06–0.56 Hz; no change available means no tremolo, not a zero change |
| Fossil emissions | Regular pulse, 0.8–4.2 Hz |
| Land-use emissions | Separate darker pulse, 0.25–1.35 Hz |
| Ocean sink | Filtered-noise tide; magnitude and sign change timbre and pan |
| Land sink | Higher filtered band; magnitude and sign change timbre and pan |
| Budget residual | Quiet low anchor; magnitude sets level, sign sets pan |

### City air

| Data | Sound |
| --- | --- |
| PM2.5 | Low filtered haze, cutoff 220–1500 Hz |
| NO₂ | Reedy pulse, 0.55–4.2 Hz |
| Ozone | Bright high band, cutoff 800–2600 Hz |
| Longitude | Stereo position, west left / east right, limited to ±0.9 |
| Hour | Time through the selected day |

The same sample and settings always produce the same sound. Playback speed changes listening time only; it does not change the values. There is no musical scale and no invented note for missing data.

## Routes

- `/` — landing page for the three experiences
- `/ocean` — the ocean instrument
- `/carbon` — the carbon-cycle instrument
- `/air-quality` — the city air-quality instrument
- `/about` — purpose, method, and scope
- `/data-sources` — provenance for all three records, claims, and limits
- `/accessibility` — the nonvisual path for each experience

## Documentation

- [`docs/SCIENCE_AND_SONIFICATION.md`](docs/SCIENCE_AND_SONIFICATION.md) — data products, mappings, signal paths, and scientific limits.
- [`docs/DATA_SOURCE_REPORT.md`](docs/DATA_SOURCE_REPORT.md) — verification log, source citations, processing, and unresolved questions.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — runtime shape, modules, data contracts, audio graphs, accessibility, and build.
- [`ACCESSIBILITY.md`](ACCESSIBILITY.md) — keyboard, screen reader, speech, and reduced-motion behavior.
- [`PRODUCT.md`](PRODUCT.md) — product truth, audience, and scope.
- [`DESIGN.md`](DESIGN.md) — visual system and component behavior.

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS 4 · Canvas 2D · Web Audio API · Lucide icons · self-hosted Inter and IBM Plex Mono.

No database, authentication, payments, analytics, AI, or runtime NASA/NOAA API calls.

## Credits

- OSCAR near-surface currents: Earth & Space Research; Bonjean & Lagerloef (2002).
- Ocean temperature: NOAA OISST v2.1; Huang et al. (2021), NOAA NCEI.
- Carbon concentration: NOAA Global Monitoring Laboratory, Mauna Loa.
- Carbon budget: Global Carbon Project, Global Carbon Budget 2025, DOI 10.18160/gcp-2025.
- Air quality: US EPA AirData / Air Quality System, 2023.
- Geography: Natural Earth 110m land.
- NASA reference: Scientific Visualization Studio record 3912, ECCO2 / MITgcm, 2007–2008. Reference only.

Earth's Pulse is an independent project. NASA does not endorse it. The sonification, interface, and any errors are the project's own.
