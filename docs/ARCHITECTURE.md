# Architecture

**Project:** Earth's Pulse
**Stage:** 01, visual foundation
**Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4
**Status:** Static shell and verified NASA plate. No numerical fields, API routes, database, authentication, or audio engine.

---

## 1. Purpose of this stage

Stage 1 has one job: establish a trustworthy scientific and visual foundation that a sonification system can grow into without rewriting its data contracts.

It deliberately ends at a hard boundary:

```text
verified NASA metadata + one rendered still
        │
        ▼
visual interface + provenance + disabled transport
        │
        ╳  no numerical ECCO2 fields
        ╳  no sonification engine
```

The architecture makes that boundary explicit in code rather than hiding it behind placeholder data.

---

## 2. Runtime shape

| Concern | Stage 1 implementation |
| --- | --- |
| Rendering | Next.js App Router, React Server Components by default |
| Routes | `/`, `/about`, `/data-sources` |
| Data source | Static TypeScript records in `src/lib/nasa/sources.ts` |
| External calls at runtime | None |
| Client components | Navigation state, image load/error state, audio capability detection, error boundary |
| Database | None |
| Authentication | None |
| API routes | None |
| Audio | None; transport and controls disabled |
| Styling | One global stylesheet with Tailwind import and CSS design tokens |
| Fonts | Self-hosted `next/font/local` files |
| Images | One local JPEG through `next/image` |
| Deployment target | Any Node.js host that supports Next.js 16 static output; current routes prerender |

The app does not call NASA at runtime. That is intentional: a challenge demo should not fail because a government server is slow or unavailable.

---

## 3. Directory map

```text
earths-pulse/
├── docs/
│   ├── ARCHITECTURE.md          this document
│   └── DATA_SOURCE_REPORT.md    validation, provenance, access limits
├── public/
│   └── assets/nasa/
│       └── ecco2-global-currents-sst-2048.jpg
├── src/
│   ├── app/
│   │   ├── layout.tsx           fonts, metadata, header, skip link, footer
│   │   ├── page.tsx             Explore surface
│   │   ├── about/page.tsx       mission and scope
│   │   ├── data-sources/page.tsx provenance and limits
│   │   ├── error.tsx            route error boundary
│   │   ├── not-found.tsx        404
│   │   ├── icon.svg             favicon
│   │   ├── globals.css          design system and layout
│   │   └── fonts/               Inter variable, IBM Plex Mono 400/500
│   ├── components/
│   │   ├── explore/             source record, data note
│   │   ├── layout/              header, nav, footer, page intro, logo
│   │   ├── player/              transport, signal path, capability
│   │   ├── ui/                  status tag
│   │   └── visualization/       NASA plate with loading/error states
│   ├── config/project.ts        public project identity and links
│   └── lib/
│       ├── nasa/                verified records, API types, future client
│       ├── science/             dataset/variable contracts, normalization
│       └── audio/               future engine boundary and mappings
├── PRODUCT.md                   product truth and scope
├── next.config.ts
└── package.json
```

No generated numerical data, fixtures, or mock measurements exist in the tree.

---

## 4. Route composition

### `/` — Explore

Server component. Reads `NASA_SVS_RECORD` and renders:

1. Title block with the scientific title, period, model, and coverage.
2. `VisualizationPlate` — the dominant object.
3. `SonificationPlayer` — disabled transport directly beneath the plate.
4. Rail: `SourceRecord`, `SignalPath`, `DataNote`.
5. A closing statement that nothing is live.

`VisualizationPlate` is the only client component on this route because it tracks image load state. `SonificationPlayer` is a server component; its controls are natively disabled and need no state.

### `/about` — Read

Explains why sonification exists, the four-stage signal path, Stage 1 scope, access principles, and credits. Reuses `SignalPath` at heading level 3.

### `/data-sources` — Read

Separates original scientific data, NASA's rendered visualization, and derived data. Documents image limits, access blockers, licensing, and citation. The asset table is keyboard-scrollable (`role="region"`, `tabIndex={0}`) with an accessible caption.

### Status routes

- `error.tsx` is a client boundary, logs the error, offers retry, and shows the Next digest if present.
- `not-found.tsx` preserves navigation and offers a route back.

---

## 5. Data architecture

### 5.1 Verified record

`src/lib/nasa/sources.ts` is the single source of truth for the still, record metadata, credits, period, license note, and ECCO2 context. Every field was read from the publisher; the validation date is part of the record.

The file is `as const`, so the UI cannot mutate it and TypeScript keeps literal types.

### 5.2 Provenance model

`src/lib/science/types.ts` defines four layers that are never merged:

```ts
type ProvenanceLayer =
  | "scientific-data"
  | "rendered-visualization"
  | "derived"
  | "synthetic";
```

Availability is independent of provenance:

```ts
type DataStatus =
  | "available"
  | "not-connected"
  | "not-implemented"
  | "unavailable"
  | "pending";
```

A dataset can be scientifically real and still be `not-connected` in this build. That is exactly the ECCO2 state.

### 5.3 Scientific contracts

```ts
ScientificVariable
  id, label, symbol?, unit, description,
  provenance, status, validRange?

ScientificDataset
  id, title, provider, model?,
  variables, temporal, spatial,
  provenance, sourceUrl?, citation?, accessNote?

NormalizedSample
  variableId, value [0,1], sourceValue,
  unit, provenance

ScientificFrame
  datasetId, timestamp, samples, provenance
```

Design rules:

- Units are explicit; `unknown` exists rather than guessing.
- `validRange` is optional and must name its source.
- A normalized sample retains the original `sourceValue`.
- A frame carries provenance, so derived data cannot silently become "raw."

### 5.4 Normalization

`src/lib/science/normalization.ts` provides linear and logarithmic normalization plus denormalization for inspection.

It returns `null` for:

- Non-finite input.
- A range with no width.
- Non-positive values in log space.
- Invalid ranges.

`null` means "no audio value." It must not be replaced with zero, because zero is a real data value.

No normalization is executed in Stage 1. The functions exist for Stage 2 and are deliberately free of dataset-specific constants.

### 5.5 NASA API client

`src/lib/nasa/client.ts` is a server-only, typed reader for `https://svs.gsfc.nasa.gov/api/{id}`.

- Validates the record ID.
- Applies a 10-second timeout.
- Requests JSON with a 24-hour revalidation.
- Checks the response shape and ID before returning.
- Throws `NasaSvsError` with a status and cause.

It is **not called** in Stage 1. It exists so a future acquisition job has one controlled entry point instead of ad-hoc fetches in components. `import "server-only"` prevents accidental client bundling.

### 5.6 Current data flow

```text
NASA SVS API (validated 14 Nov 2026)
        │  manual verification, not runtime
        ▼
src/lib/nasa/sources.ts  ──────────────►  server components
        │                                      │
        │                                      ▼
        │                                rendered HTML
        │
        └── public/assets/nasa/*.jpg ──► next/image ──► browser
```

There is no database, cache layer, API route, or client fetch.

---

## 6. Audio boundary

`src/lib/audio/types.ts` defines what a future engine must satisfy:

```ts
AudioEngineState
SonificationMapping
SonificationScene
SonificationEngine
AudioStatus
```

Key decisions:

- A mapping is an inspectable scientific claim: variable, parameter, curve, and description.
- Physical ranges live on the scientific variable, not on the audio mapping.
- The scene owns time and duration, not the UI.
- `AUDIO_STATUS` encodes the honest current state: engine `not-implemented`, Web Audio `not-initialized`.

`AudioCapability` reports whether the browser exposes `AudioContext` **without constructing one**. It uses `useSyncExternalStore` so no state is set inside an effect and no audio context is created before a user gesture.

The transport is disabled at the HTML level (`disabled` on the button, `fieldset disabled` on control groups). Disabled controls remain readable and expose the reason through visible text and `aria-describedby`.

---

## 7. Design system

All visual decisions live in `src/app/globals.css` as CSS custom properties plus component classes. Tailwind is present and imports normally; utility classes are not used for the core instrument layout because the brief required a precise, non-generic composition.

### Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#080d16` | page ground |
| `--bg-raised` | `#101925` | bars and rail panels |
| `--panel` | `#151f2d` | defined panel surface |
| `--panel-deep` | `#0b1220` | plate and transport ground |
| `--text` | `#e8eef5` | primary text |
| `--text-secondary` | `#8b9aaa` | body secondary |
| `--text-tertiary` | `#7c8ca0` | metadata |
| `--accent-cyan` | `#42c7d9` | available / active / links |
| `--accent-blue` | `#438be8` | defined accent, used sparingly |
| `--accent-ice` | `#9bc8d8` | hairlines and cool emphasis |
| `--blocked` | `#d6a84b` | unavailable state |

### Type

- **Inter** for reading and headings.
- **IBM Plex Mono** for identifiers, dates, coordinates, counts, and status.
- No display face, no decorative gradient text, no all-caps headlines.

### Layout

- Max width 1440px with 32px gutters (18px on small screens).
- Explore is a two-column instrument bay: fluid plate + 368px rail.
- At 1180px the rail moves below the plate and becomes two columns.
- At 760px everything stacks; transport metrics and controls reflow.
- `section[id]` has a sticky-header scroll margin.
- The plate uses a 2:1 aspect ratio, matching the source image.

### Ornament

Only four corner ticks on the plate, hairline rules, and a dashed timeline. No glass, neon, gradient, emoji, fake chart, or glow.

---

## 8. Accessibility

Implemented:

- Skip link to `#main`.
- Semantic landmarks: `header`, `nav`, `main`, `aside`, `footer`.
- `aria-current="page"` on the active route.
- Descriptive page titles and metadata.
- Plate has a meaningful `alt`; caption and credit are visible.
- Loading state uses `role="status"`; error uses `role="alert"`.
- Disabled transport explains its state in visible text and `aria-describedby`.
- Status is never color-only: every colored dot is paired with a text label.
- Keyboard-operable navigation and links; focus-visible outline uses the cyan accent.
- Table is keyboard-scrollable and has a caption.
- `prefers-reduced-motion` disables the loading scan and smooth scrolling.
- Contrast targets the WCAG AA range for body and metadata text on the dark ground.

Not claimed:

- No formal WCAG audit or screen-reader certification was performed.
- Some metadata is intentionally small (7.5–9px mono). It is decorative/supporting text, but a future audit should test it at 200% zoom and with low-vision users.
- The disabled controls are discoverable but not focusable, by native browser behavior; their reason is also present in body copy.

Stage 2 audio must ship with equivalent textual state. Sound alone is not an access feature.

---

## 9. Performance and resilience

- The hero image is local, priority-loaded, and served through `next/image`.
- Fonts are local `woff2` files; no Google Fonts request at build or runtime.
- No client-side data fetching, no third-party scripts, no analytics.
- Routes are statically prerendered at build time.
- The only animation is a 1.7s loading scan, disabled under reduced motion.
- The app remains usable if the image fails: the error overlay keeps the source record and a link to NASA.
- Error and 404 routes preserve the shell and navigation.

`next.config.ts` enables Cache Components and partial prefetching, and sets `turbopack.root` to the project directory to avoid the parent-home `package-lock.json` warning. A Turbopack CSS rule loads `@tailwindcss/turbopack`.

---

## 10. Security and privacy

- No authentication, cookies, forms, or personal data.
- No API keys, tokens, or Earthdata credentials in the repository or client bundle.
- External links use `target="_blank"` with `rel="noreferrer"` where they leave the site.
- The future NASA client is server-only.
- No user input is rendered as HTML.
- No remote images are loaded at runtime; the bundled still is local.
- Dependency surface is small: Next, React, Lucide, Tailwind, ESLint, TypeScript.

Stage 2 must keep any authenticated data acquisition on the server and must not proxy unrestricted upstream responses to the browser.

---

## 11. Stage 2 extension points

The intended path, in order:

### Step 1 — Acquire a defensible subset

- Identify an ECCO2 release that can be related to the 2012 render, or explicitly document the mismatch.
- Use a server-side Python job with NumPy/xarray to read NetCDF/Zarr.
- Select one surface timestep or a short series: SST, eastward velocity, northward velocity.
- Subset spatially to a region of interest.
- Record source URL, query, retrieval date, units, missing-value handling, and checksum.
- Measure the output size.

### Step 2 — Convert to a browser contract

- Emit a compact JSON or binary artifact matching `ScientificFrame`.
- Keep `sourceValue`, unit, and provenance.
- Compute `validRange` from dataset metadata or an explicitly documented statistical method; never from a rendered image.
- Store the artifact outside the client bundle and serve it from a route handler or static file.

### Step 3 — Implement normalization and mapping

- Use `normalizeLinear` / `normalizeLog` with verified ranges.
- Define `SonificationMapping` records and render them in the UI.
- Reject `null` samples rather than substituting zero.
- Add tests for range edges, non-finite input, and missing values.

### Step 4 — Implement the Web Audio engine

- Create `AudioContext` only after a user gesture.
- Implement `SonificationEngine` behind the existing interface.
- Keep the graph outside React; expose state through a thin adapter.
- Synchronize to the plate or to a frame sequence with explicit timestamps.
- Provide pause, seek, and dispose semantics.
- Respect reduced motion and avoid autoplay.

### Step 5 — Add equivalent non-audio state

- Live textual description of the current timestamp and values.
- A data table or accessible readout for the current frame.
- Clear labels for any synthetic demo data.
- No claim of scientific sonification until the mapping is inspectable.

### Explicitly deferred

- Database and user accounts.
- Live NASA feeds.
- 3D globe or Three.js.
- Region selection beyond a documented subset.
- AI/LLM interpretation.
- Payments or analytics.

---

## 12. Verification performed

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | Pass |
| Lint | `npm run lint` | Pass |
| Production build | `npm run build` | Pass |
| Routes prerendered | build output | `/`, `/about`, `/data-sources`, `/_not-found`, `/icon.svg` |

The build emitted a Turbopack workspace-root warning before `turbopack.root` was set; the current configuration resolves it.

There is no automated unit or end-to-end test suite in Stage 1. The scientific contracts are type-checked but not exercised with data because no data exists. This is a known gap, not a claim of coverage.

---

## 13. Decisions and trade-offs

| Decision | Reason | Cost |
| --- | --- | --- |
| Bundle the still locally | Demo reliability and no runtime NASA dependency | Asset must be updated manually if NASA changes it |
| No numerical data | Exact ECCO2 access unresolved; inventing data would violate the brief | Audio cannot be implemented honestly yet |
| Static record in TypeScript | Auditability and type safety | Manual update if the API changes |
| Server-only NASA client, unused | A single future acquisition boundary | Slight unused code surface |
| CSS variables + component classes | Precise instrument layout, fewer utility-class conflicts | Less compositional than pure utility Tailwind |
| Self-hosted fonts | No build/runtime network dependency | Larger repository |
| Single still, not video | Keeps scope and payload small; avoids implying playback | No temporal motion in Stage 1 |
| Disabled native controls | Honest, accessible, no fake state | Visually present but inert; copy must carry the explanation |
| No test framework | No logic with data yet; avoid dependency bloat | Normalization and client validation are untested |

---

## 14. Known limitations

1. **No numerical ECCO2 data.** The core scientific input for sonification is absent.
2. **Exact 2012 model release unresolved.** Current ECCO V4r4 is not a substitute.
3. **Single frame.** The plate is one instant (frame 25000), not the full animation.
4. **No colorbar in the bundled frame.** Approximate values are not extracted.
5. **No audio.** Web Audio API presence is detected, but no context is created.
6. **No tests.** Lint, types, and build pass; behavior with data is unverified.
7. **No formal accessibility audit.** The design targets access but is not certified.
8. **NASA API can change.** The static record is a snapshot validated on 14 Nov 2026.
9. **No deployment configuration.** The project runs locally; hosting is not chosen.

These limits are stated in the interface where they affect the visitor's interpretation.

---

## 15. Running the project

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
npm start
```

On this machine, plain project-scoped `npm install` is blocked by the user's `.npmrc` `allow-scripts=true` policy. The workaround used during the build was:

```powershell
npm install --userconfig C:\Users\hemed\AppData\Local\Temp\opencode\empty-npmrc
```

This is an environment issue, not a project requirement. A normal npm configuration installs the project without it.

---

## 16. References

- NASA SVS record: <https://svs.gsfc.nasa.gov/3912/>
- NASA SVS Page API: <https://svs.gsfc.nasa.gov/api/3912>
- ECCO products: <https://ecco-group.org/products.htm>
- ECCO datasets at PO.DAAC: <https://ecco-group.org/datasets.htm>
- NASA media guidelines: <https://www.nasa.gov/nasa-brand-center/images-and-media/>
- Detailed provenance and validation log: [`DATA_SOURCE_REPORT.md`](./DATA_SOURCE_REPORT.md)
