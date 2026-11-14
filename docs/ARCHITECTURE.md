# Architecture

**Project:** Earth's Pulse
**Stage:** 02, working sonification instrument
**Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, Canvas 2D, Web Audio API
**Status:** Static routes, client-side data load, real audio, no database, no authentication, no runtime NASA API calls.

---

## 1. Purpose

The app turns a reduced, verified ocean dataset into two synchronized outputs:

1. **Sound** — a deterministic three-voice mapping of temperature and current.
2. **A visual field** — an SST raster, advected current particles, a transect band, and a playhead.

A text reading panel and a full transect table carry the same numbers, so the experience does not depend on seeing the canvas or hearing the audio.

The architecture keeps four things separate:

```text
source products (OSCAR, OISST)
        │
        ▼
build-time reduction → static binary + JSON
        │
        ▼
client sampling → transect samples
        │
        ├──► sonification mapping → Web Audio
        ├──► canvas rendering
        └──► reading panel, speech, table
```

The NASA SVS 3912 still is outside this path. It is a reference image, not a data input.

---

## 2. Runtime shape

| Concern | Implementation |
| --- | --- |
| Rendering | Next.js App Router; pages prerendered; the instrument is a client component |
| Routes | `/`, `/about`, `/data-sources`, `/accessibility`, plus `error` and `not-found` |
| Data source | `public/data/ocean-2012.bin` and `.json` fetched by the browser |
| External calls at runtime | None (the ocean data is local; source links open in a new tab) |
| Database | None |
| Authentication | None |
| API routes | None |
| Audio | Web Audio API; one `AudioContext` per mounted instrument |
| Visualization | Canvas 2D with DPR capped at 2; three offscreen layers (raster, trails, land) |
| Styling | One global stylesheet with CSS design tokens |
| Fonts | Self-hosted `next/font/local` |
| Images | One local NASA JPEG used as a reference plate on About/Data Sources |
| Deployment | Any Node host that supports Next.js static output; all four routes prerender |

The app does not call NASA or NOAA at runtime. A demo should not fail because a government server is slow, and the browser should not download raw NetCDF collections.

---

## 3. Routes and responsibilities

| Route | Role |
| --- | --- |
| `/` | The instrument: field controls, map, transport, reading, data record, transect table |
| `/about` | Purpose, method, what the project is and is not |
| `/data-sources` | Provenance, sample times, claims, limitations, source links |
| `/accessibility` | The nonvisual path, keyboard map, speech behavior |
| `error.tsx` | Route error boundary |
| `not-found.tsx` | 404 |

`SiteHeader`, `SiteNav`, `SiteFooter`, `LogoMark`, and `PageIntro` are shared layout components. The header marks the current route and shows the stage/status chip.

---

## 4. Directory map

```text
earths-pulse/
├── ACCESSIBILITY.md
├── PRODUCT.md
├── README.md
├── DESIGN.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_SOURCE_REPORT.md
│   └── SCIENCE_AND_SONIFICATION.md
├── public/
│   ├── assets/nasa/
│   │   └── ecco2-global-currents-sst-2048.jpg
│   └── data/
│       ├── ocean-2012.bin
│       ├── ocean-2012.json
│       └── ne_110m_land.geojson
├── scripts/
│   ├── fetch-ocean-data.mjs
│   ├── verify-ocean-data.mjs
│   └── verify-sonification.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 Explore
│   │   ├── about/page.tsx
│   │   ├── data-sources/page.tsx
│   │   ├── accessibility/page.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── icon.svg
│   │   ├── globals.css
│   │   └── fonts/
│   ├── components/
│   │   ├── explore/ocean/
│   │   │   ├── OceanInstrument.tsx  orchestrator
│   │   │   ├── FieldBar.tsx         region, month, route
│   │   │   ├── OceanCanvas.tsx      raster, particles, land, band, playhead
│   │   │   ├── TransportControls.tsx play/pause/stop/seek/speed/volume/layers
│   │   │   ├── ReadingPanel.tsx     values, description, speech, live region
│   │   │   ├── DatasetRecord.tsx    source and sampling record
│   │   │   └── TransectDetails.tsx  summary + full table
│   │   ├── layout/                  header, nav, footer, logo, page intro
│   │   ├── player/SignalPath.tsx    five-stage signal explanation
│   │   ├── ui/StatusTag.tsx
│   │   └── visualization/VisualizationPlate.tsx  NASA reference still
│   ├── config/project.ts            identity, links, status labels
│   └── lib/
│       ├── accessibility/speech.ts  speakText / cancelSpeech
│       ├── audio/
│       │   ├── mapping.ts           pure data → sound parameters
│       │   └── sonifier.ts          Web Audio graph and transport clock
│       ├── browser/useMediaQuery.ts
│       ├── nasa/sources.ts          verified SVS metadata (reference)
│       ├── ocean/
│       │   ├── types.ts             dataset and sample contracts
│       │   ├── dataset.ts           load, decode, sample, transect, format
│       │   └── regions.ts           four listening routes
│       └── science/types.ts         provenance contracts used by NASA metadata
```

---

## 5. Data contracts

`src/lib/ocean/types.ts` is the boundary between the file format and the UI.

- `OceanGrid` describes the equirectangular grid: longitude start/step/count, latitude start/step/count, and row order.
- `OceanVariableMeta` carries the unit, scale, fill sentinel, and product name for `sst`, `u`, `v`.
- `OceanFrameMeta` carries the month label, the exact OSCAR and OISST sample times, and per-frame statistics.
- `OceanDataset` holds the parsed JSON metadata and a single `Int16Array`.
- `OceanSample` uses `number | null` for temperature, velocity components, derived speed, and bearing. There is no sentinel in the UI layer.
- `TransectSample` adds `index`, `progress`, and `displayLon` (which may exceed 180° for a Pacific crossing).
- `TransectDefinition` names a route: latitude, start/end longitude, description, and why it matters.

`loadOceanDataset()` fetches the JSON and binary in parallel, validates the schema, checks that the byte length matches `frames × 3 × cells × 2`, and returns an `Int16Array`. Non-`OceanDataError` failures (network rejection, JSON parse) are wrapped in a user-facing message.

The binary layout is:

```text
frame 0:  sst[25440]  u[25440]  v[25440]
frame 1:  sst[...]    u[...]    v[...]
...
```

Values are Int16 little-endian, multiplied by the declared scale (`0.01` for SST, `0.001` for velocity). `-32768` is missing. The browser never sees a raw NetCDF file or a runtime ERDDAP query.

---

## 6. Sampling and route construction

`sampleOcean(dataset, frame, lon, lat)` performs bilinear sampling:

- Longitude is normalized to `[-180, 180)` and wraps at the dateline.
- Latitude is clamped to the grid.
- The four surrounding cells are weighted. A corner whose value is missing is **excluded** from the weighted mean, not replaced by zero. If all contributing corners are missing, the result is `null`.
- `speed` and `bearing` are derived only when both `u` and `v` are present.

`buildTransect()` samples 48 evenly spaced points from `lonStart` to `lonEnd` at the route latitude and attaches `index`, `progress`, and `displayLon`. The route is a straight zonal sampling line, not a drifter track or a front.

`regions.ts` defines four routes: Gulf Stream, Equatorial Pacific, Agulhas, Southern Ocean. `transectById()` falls back to the default route for an unknown ID.

---

## 7. Sonification architecture

`mapping.ts` is pure:

```text
OceanSample + normalization ranges → SoundParameters | null
```

It has no browser or audio dependency. Unit tests import it directly under Node's type stripping. The limits are constants (`AUDIO_LIMITS`), so the mapping can be audited without listening.

`sonifier.ts` owns the graph and clock:

- One `AudioContext` created lazily on the first Play gesture.
- Three voices: temperature tone, pulse, texture.
- A compressor and master gain.
- A 45 ms interval tick converts elapsed audio-context time into a fractional step position, applies samples, and fires `onStep`, `onEnd`, and `onError`.
- `pause()` stores the fractional step, silences the master, and suspends the context.
- `play()` resumes the context, restores the anchor, and schedules the current step.
- `seek()` updates the anchor and, if paused, emits the target sample so the reading follows.
- `setRate()` preserves the current fractional position while changing step duration.
- `setLayers()` and `setVolume()` change gains without rebuilding the graph.
- `dispose()` stops oscillators and the noise source, disconnects the compressor and master, closes the context, and clears the timer.

The graph is intentionally small. There is no reverb, no ConvolverNode, no per-sample scheduling, and no audio worklet. This keeps cleanup and reproducibility manageable.

See [`SCIENCE_AND_SONIFICATION.md`](SCIENCE_AND_SONIFICATION.md) for the exact mapping formulas and the scientific limits.

---

## 8. Orchestration and state

`OceanInstrument.tsx` is the only client component that owns playback state. It holds:

- dataset, load error, retry attempt;
- month index and route ID;
- layers, volume, speed;
- playing, ended, progress, step index, current sample;
- audio error;
- speech enabled, announcement text.

It creates the engine lazily through `getEngine()`, registers callbacks once, and stores a `contextRef` with the active route, frame, and samples so callbacks always describe the current field rather than the field captured at mount.

Changing the month or route calls `resetPlayback()` before updating state: stop the engine, clear the progress, and clear the current sample. This prevents a reading from the old month being announced under the new label.

The UI derives a readout sample from `currentSample` or the progress index. That is what the reading panel, canvas playhead, and speech use.

---

## 9. Canvas rendering

`OceanCanvas` keeps four layers:

1. **Raster** — a 240 × 106 offscreen `ImageData` built once per month from the SST values. Missing cells are transparent; the plate background shows through.
2. **Trail** — a persistent offscreen canvas. Each frame is faded with `destination-out`, then particle segments are drawn with `lighter`.
3. **Land** — Natural Earth 110m rings are fetched once and filled/stroked on an offscreen canvas at the current size.
4. **Main** — background, raster, trails (or static vectors), land, graticule, route band, playhead, labels.

Particles spawn only in cells where SST, `u`, and `v` are all valid. Their initial directions come from `u`/`v`; motion is deliberately accelerated for legibility. The particle count scales with area (`width × height / 700`, clamped to 640–2400) and is capped by DPR 2.

At narrow widths the canvas drops latitude labels, reduces longitude labels to −120°/0°/120°, and omits the route text. The route is still visible in the field bar and the reading. The region text is not the only source of that information.

`prefers-reduced-motion` switches to static current vectors and stops the animation loop's state changes (the loop still handles resizes and new months).

The canvas has `role="img"` and a text alternative naming the month, transect, and current SST at the playhead. It is not focusable; the controls and table are the interactive path.

---

## 10. Accessibility architecture

- Native controls, visible labels, one `<h1>`, one `<main>`, skip link, visible focus.
- The position slider is a sample index with an `aria-valuetext` that includes step, longitude, and latitude.
- The live region and browser speech are mutually exclusive; see [`ACCESSIBILITY.md`](../ACCESSIBILITY.md).
- Missing values are first-class in the UI: the reading says “Missing”, speech says the value is missing, and the table shows a dash.
- The table is a `<details>` with a real `<table>`, `<caption>`, `<thead>`, and row headers.
- Decorative marks (status dots, plate ticks, graticule labels, legend) are `aria-hidden` or non-focusable.
- External links use `rel="noreferrer"`.

No component relies on hover to reveal information. The one disclosure is a native `<details>`.

---

## 11. Performance and failure behavior

- The bundle downloads 1.75 MB once; the JSON is small. There is no per-frame network request.
- The binary is decoded into one `Int16Array`; no per-cell objects are allocated.
- The raster is rebuilt only when the month changes.
- Particles are re-seeded on resize and month change, not on every frame.
- The canvas DPR is capped at 2 to bound fill cost on high-density screens.
- Loading shows a real progress message, not a fake percentage.
- A failed binary request shows an alert with a Retry button. Retry resets the dataset and increments the effect dependency.
- If Web Audio is unavailable, the transport controls are disabled and the field/readings remain usable.
- If speech synthesis is unavailable, the speak button and auto-announce checkbox are disabled and the live region remains.

---

## 12. Build and verification

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run verify
```

All four routes prerender. The app has no server-side data fetching and no secrets.

Manual browser checks used in this build:

- Play creates one context; pause suspends; resume restarts; stop suspends; route change closes.
- Seek, speed, volume, and layer toggles work while playing and paused.
- Loading, network failure, and retry states.
- Desktop (1440), tablet (834), and mobile (390) with no horizontal overflow.
- Keyboard tab order, skip link, arrow-key sample stepping, live region / speech exclusivity.
- No console errors.

The `verify` scripts are independent of the UI: they decode the committed binary and import the pure mapping module.

---

## 13. Extension points

- **More routes:** add a `TransectDefinition` in `regions.ts`. The UI, table, canvas, and speech derive from it.
- **More months or years:** extend the fetch script and metadata; the binary layout supports any frame count.
- **More variables:** add a variable to the binary and metadata, then extend `sampleOcean`, the mapping, and the reading. Do not add a variable that cannot be sampled honestly.
- **Calibration mode:** expose alternate normalization ranges from the JSON rather than hard-coding them in the UI.
- **Transcript export:** the transect samples and descriptions are already pure data; a CSV or text export would not need audio.
- **ECCO2 layer:** if a future environment can reach ECCO2, it can be a new dataset with the same contracts, clearly labeled as a different product.

---

## 14. Constraints

- The two source variables are not at the same depth: currents at 15 m, temperature at 0 m.
- One composite per month is a sample, not a continuous series.
- There is no uncertainty field, no subsurface dimension, and no volume transport.
- The project is not an official NASA product.
- The ECCO2 numerical fields behind the SVS reference were not obtained.
