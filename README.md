# Earth's Pulse

**Listen to what you cannot see.**

Earth's Pulse is an independent NASA Space Apps Challenge project exploring how sonification can make Earth observation legible beyond the visual channel. The first subject is global ocean circulation and sea surface temperature, using NASA Scientific Visualization Studio record 3912 and the ECCO2 model behind it.

## Stage 1 status

This repository is the **visual foundation**, not the sonification engine.

| Available | Not available |
| --- | --- |
| Verified NASA SVS 3912 metadata and credits | Numerical ECCO2 fields |
| One bundled 2048 × 1024 NASA rendered still | Verified normalization ranges |
| Explore, About, and Data Sources routes | Web Audio playback |
| Typed science, NASA, and audio contracts | Frame synchronization and layer mixing |
| Responsive, keyboard-operable interface | Live ocean conditions |

The transport is deliberately disabled. The interface explains the missing subsystem rather than simulating it.

NASA's visualization is a rendering, not a measurement. Pixel colors in the plate are never treated as data. The exact ECCO2 release behind the 2012 render remains unresolved.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Documentation

- [`docs/DATA_SOURCE_REPORT.md`](docs/DATA_SOURCE_REPORT.md) — what was verified, how, what the image can and cannot support, numerical-access blockers, licensing, citation, open questions.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — routes, data contracts, provenance model, audio boundary, design system, accessibility, Stage 2 extension points.
- [`PRODUCT.md`](PRODUCT.md) — product truth, audience, scope, and constraints.

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS 4 · Lucide icons · self-hosted Inter and IBM Plex Mono.

No database, authentication, payments, AI, analytics, or unnecessary backend.

## Credits

Visualization: NASA Scientific Visualization Studio, record 3912. Visualization by Greg Shirah, NASA/GSFC. Animation by Greg Shirah, Horace Mitchell, and Eric Sokolowsky. Producer: Michael Starobin, HTSI. Scientists: Hong Zhang (UCLA) and Dimitris Menemenlis (NASA/JPL CalTech). Topography and bathymetry: GTOPO30, USGS.

NASA SVS content is public domain unless noted. This project uses one rendered still, not the video or audio. Earth's Pulse is independent and is not an official NASA product; NASA does not endorse it.
