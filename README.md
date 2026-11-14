# Earth's Pulse

**Listen to what you cannot see.**

Earth's Pulse is an independent NASA Space Apps Challenge project: a browser-based sonification instrument that turns real ocean fields into sound. It is built for blind and low-vision listeners first, and for anyone who wants a second way to read the ocean.

The subject is the global ocean in **2012**. Twelve monthly samples combine NASA-funded **OSCAR** near-surface currents with NOAA **OISST v2.1** sea surface temperature. Nothing here is live, forecast, or a direct instrument reading at every grid cell.

## What works

| Capability | Implementation |
| --- | --- |
| Real numerical field | 12 monthly composites, Jan–Dec 2012, on a shared 1.5° grid (240 × 106) |
| Playback | Play, pause, resume, stop, seek by sample, 0.5× / 1× / 2× speed, volume |
| Sonification | Temperature → pitch and brightness; current speed → pulse rate and accent; east–west flow → stereo; north–south flow → pulse pitch |
| Layers | Temperature tone, current pulse, flow texture — independently switchable |
| Visualization | Canvas SST raster, advected current particles, highlighted transect, playhead |
| Listening routes | Gulf Stream, Equatorial Pacific, Agulhas, Southern Ocean |
| Nonvisual path | Keyboard transport, readable values, browser speech, polite live region, full transect table |
| Provenance | Source links, sampling record, per-frame statistics, documented limits |

The map is a rendering of the numerical field, not the source of the values. The bundled NASA SVS 3912 ECCO2 still is a **separate reference visualization** from 2007–2008; it is not the numerical source for this dataset.

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
```

## Verify the data and mapping

```bash
npm run verify
```

- `verify:data` decodes the bundled binary and checks frame count, grid size, valid-cell counts, ranges, statistics, and normalization values.
- `verify:mapping` checks that the sonification mapping is deterministic and monotonic, and that missing variables stay silent. It uses Node's TypeScript type stripping (Node 22.6 or newer).

## Data

**Source fields**

- **OSCAR Sea Surface Velocity** (Earth & Space Research, NASA-funded), 5-day composites, 1/3°, **15 m depth**. Accessed through NOAA CoastWatch ERDDAP `jplOscar`. The product is an analysis, not a direct measurement at every point.
- **NOAA OISST v2.1** (NOAA NCEI), daily, 0.25°, 0 m. Accessed through NOAA CoastWatch ERDDAP `ncdcOisst21Agg`. A blended satellite/in-situ product.

**Bundled subset**

- One OSCAR composite nearest the 15th of each month and the nearest daily OISST field, resampled bilinearly to a 1.5° equirectangular grid.
- `public/data/ocean-2012.bin`: 1.75 MB, Int16 little-endian, frame-major (`sst`, `u`, `v`), north-to-south rows. Fill = `-32768`.
- `public/data/ocean-2012.json`: provenance, per-frame sample times, statistics, normalization, processing, limitations.
- 226,464 valid SST cells and 196,404 valid current vectors across the 12 frames. SST spans −1.80 to 34.14 °C; the 98th-percentile current speed is 0.536 m/s.
- Coastal cells with a missing source corner are left missing. Nothing is filled, smoothed across land, or treated as zero.

The preprocessing is reproducible with `node scripts/fetch-ocean-data.mjs` (requires network access to NOAA ERDDAP; responses are cached in `scripts/.cache/`).

**Normalization for sound**: SST uses the 2nd–98th percentile (−1.77 to 29.61 °C); speed uses the 98th percentile (0 to 0.536 m/s). The extremes remain visible in the readings and the map even when the sound mapping saturates.

**Why not ECCO2?** The original NASA SVS 3912 visualization is built from ECCO2 model output for 2007–2008, but the numerical ECCO2 endpoints were unreachable from this environment (connection refused / gateway errors). The project does not pretend the OSCAR/OISST fields are ECCO2. The SVS record remains a cited reference and visual inspiration only. See [`docs/DATA_SOURCE_REPORT.md`](docs/DATA_SOURCE_REPORT.md) for the access log.

## Accessibility

The interface is designed so the field remains usable without seeing the canvas:

- One `<h1>`, one `<main>`, labelled controls, visible focus, and a skip link.
- The position slider moves **one sample per arrow key**; its value text names the step, longitude, and latitude.
- The reading panel announces every fourth step through a polite live region by default. Turning on “Speak every fourth step” switches to browser speech synthesis instead, avoiding duplicate announcements.
- “Read this aloud” speaks the current values on demand.
- The full transect table is available below the instrument, with the same numbers as the sound.
- Missing values are announced as missing; they are never sonified as zero or as the coldest/slowest value.
- `prefers-reduced-motion` stops particle motion and uses static current vectors.

See [`ACCESSIBILITY.md`](ACCESSIBILITY.md) and the in-app `/accessibility` guide.

## Sound mapping

| Data | Sound |
| --- | --- |
| Sea surface temperature | Pitch across C3–C5 (two octaves) and low-pass brightness |
| Current speed | Pulse rate (0.65–6 Hz) and pulse accent |
| East–west current | Stereo position, limited to ±0.9 |
| North–south current | Pulse pitch, ±3 semitones |
| Position on the transect | Time, west to east |

The same sample and settings always produce the same sound. Playback speed changes listening time only; it does not change the values. Continuous values drive continuous audio parameters; there is no musical scale and no invented note for missing data.

## Routes

- `/` — the instrument
- `/about` — purpose, method, and scope
- `/data-sources` — provenance, sampling record, claims, and limits
- `/accessibility` — the nonvisual path, step by step

## Documentation

- [`docs/SCIENCE_AND_SONIFICATION.md`](docs/SCIENCE_AND_SONIFICATION.md) — the data product, mapping, signal path, and scientific limits.
- [`docs/DATA_SOURCE_REPORT.md`](docs/DATA_SOURCE_REPORT.md) — verification log, source citations, processing, and unresolved questions.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — runtime shape, modules, data contracts, audio graph, accessibility, and build.
- [`ACCESSIBILITY.md`](ACCESSIBILITY.md) — keyboard, screen reader, speech, and reduced-motion behavior.
- [`PRODUCT.md`](PRODUCT.md) — product truth, audience, and scope.
- [`DESIGN.md`](DESIGN.md) — visual system and component behavior.

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS 4 · Canvas 2D · Web Audio API · Lucide icons · self-hosted Inter and IBM Plex Mono.

No database, authentication, payments, analytics, AI, or runtime NASA API calls.

## Credits

**Ocean data**

- OSCAR: Bonjean, F. and G.S.E. Lagerloef (2002). *Diagnostic model and analysis of the surface currents in the tropical Pacific Ocean.* Journal of Physical Oceanography, 32, 2938–2954. Earth & Space Research; distributed by NOAA CoastWatch ERDDAP.
- OISST v2.1: Huang, B., et al. (2021). *Improvements of the Daily Optimum Interpolation Sea Surface Temperature (DOISST) Version 2.1.* Journal of Climate, 34, 2923–2939. NOAA NCEI; distributed by NOAA CoastWatch ERDDAP.
- Coastlines: Natural Earth 110m land, public domain.

**Reference visualization**

NASA Scientific Visualization Studio, record 3912, “Global Sea Surface Currents and Temperature.” Visualization by Greg Shirah, NASA/GSFC. Animation by Greg Shirah, Horace Mitchell, and Eric Sokolowsky. Producer: Michael Starobin, HTSI. Scientists: Hong Zhang (UCLA) and Dimitris Menemenlis (NASA/JPL CalTech). Topography and bathymetry: GTOPO30, USGS.

NASA SVS content is public domain unless noted. Earth's Pulse is independent and is **not** an official NASA product; NASA does not endorse it.
