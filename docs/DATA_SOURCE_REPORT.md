# Data Source Report

**Project:** Earth's Pulse — NASA Space Apps Challenge
**Stage:** 01, visual foundation
**Validation date:** 14 November 2026
**Author:** Earth's Pulse project
**Status:** One NASA rendered still verified and bundled. No numerical ECCO2 field has been obtained. No audio is produced.

This report records what was actually verified, how it was verified, what the project is allowed to claim, and what remains unresolved. It is deliberately narrower than a general description of ECCO2. A fact appears here only if it was read from a named publisher or measured from a file in this repository.

---

## 1. Bottom line

| Question | Answer |
| --- | --- |
| Is the NASA visualization real and verified? | Yes. NASA SVS record 3912 is live and its Page API was read directly. |
| Is the bundled image the NASA image? | Yes. It is the 2048 × 1024 main still published by the record. |
| Does the image contain measurements? | No. It is a rendered visualization. Pixel colors are not treated as data. |
| Are numerical ECCO2 fields connected? | No. No NetCDF, Zarr, CSV, or API field data exists in this build. |
| Is the sonification engine implemented? | No. Audio controls are disabled and say why. |
| Is the exact ECCO2 release behind the 2012 render known? | No. This remains an open provenance question. |
| Is the project an official NASA product? | No. It is an independent challenge project. |

---

## 2. Verification method

Verification was performed on **14 November 2026** from the project environment. A source counted as verified only when at least one of the following was true:

1. Its publisher returned the record or page directly over HTTPS during validation.
2. Its file was downloaded, measured, and visually inspected.
3. Its metadata was read from the publisher's machine-readable API.

The following were **not** accepted as evidence:

- Search-engine snippets.
- Reposts, aggregators, Wikipedia, or social media.
- Memory of NASA visuals.
- Inferred values, plausible ranges, or color-picked pixels.
- Filenames that imply a date or variable without publisher metadata to confirm it.

### Validation log

| Source | Method | Result |
| --- | --- | --- |
| `https://svs.gsfc.nasa.gov/api/3912` | Direct HTTPS GET, JSON parsed | Pass. Title, dates, credits, datasets, and media inventory read. |
| `https://svs.gsfc.nasa.gov/3912/` | Direct HTTPS GET | Pass. Public record page available. |
| NASA main still URL | Downloaded and measured | Pass. 2048 × 1024 JPEG, 1,026,047 bytes. Visually inspected. |
| `https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/flat_ecco2_dates.txt` | Direct HTTPS GET | Pass. Frame-to-timestamp mapping read. |
| `https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/frames/2048x1024_1x1_30p/with_colorbar/` | Direct HTTPS GET | Pass. Colorbar frame inventory exists; not bundled. |
| `https://ecco-group.org/products.htm` | Direct HTTPS GET | Pass. ECCO2 legacy product description and ECCO V4r4 figures read. |
| `https://ecco-group.org/datasets.htm` | Direct HTTPS GET | Pass. V4r4 scale, period, and PO.DAAC framing read. |
| `https://ecco.jpl.nasa.gov/` | Direct HTTPS request | **Fail.** Connection refused from the validation environment. |
| Numerical ECCO2 field | Any access path | **Not obtained.** See §7. |

No attempt was made to bypass authentication, scrape restricted data, or use unofficial mirrors.

---

## 3. Three distinct layers

The interface and the code keep these layers separate. They must not be collapsed into a single "NASA data" label.

### Layer 1 — Original scientific data

**Product:** ECCO2 ocean and sea-ice state estimate, a legacy ECCO product.
**Producer:** ECCO consortium, joint MIT/JPL project; NASA JPL participation.
**Model:** MIT general circulation model (MITgcm).
**Nature:** A model–observation synthesis, not a direct measurement at every grid point. ECCO describes its state estimates as free-running numerical ocean model solutions fitted to heterogeneous satellite and in-situ observations in a least-squares sense.
**Native grid:** Cube-sphere, 18–30 km horizontal resolution, 50 vertical levels (ECCO product page).
**Product line:** ECCO Cube92, estimation period 1992–2023 (ECCO product page, accessed 14 Nov 2026).
**This build:** **Not connected.** There are no numerical fields in the repository.

### Layer 2 — NASA rendered visualization

**Record:** NASA Scientific Visualization Studio 3912, "Global Sea Surface Currents and Temperature."
**Visualization:** Greg Shirah, NASA/GSFC.
**Release:** 16 March 2012 (API timestamp `2012-03-16T10:00:00-04:00`).
**Record update:** 18 February 2025.
**Temporal coverage:** 25 March 2007 12:00 UTC through 3 March 2008 12:00 UTC.
**Content:** Surface current flow colored by corresponding sea surface temperature. NASA's description states that the model simulates all depths but **only surface flows are used** in this visualization.
**Bundled asset:** The record's 2048 × 1024 JPEG main image, one frame from the animation.
**This build:** **Available.** It is presented as a rendered visualization, not as measured data.

### Layer 3 — Derived or processed data

**This build:** **None.** No normalization, resampling, color extraction, interpolation, mapping, or synthetic test series has been created. The scientific types and normalization functions define contracts only; no data passes through them.

If derived data is added later, it must carry the source dataset, processing steps, units, and a provenance label. Synthetic fixtures must be labeled synthetic in the interface, not only in code.

---

## 4. NASA SVS record 3912: verified fields

Read from `https://svs.gsfc.nasa.gov/api/3912` on 14 November 2026.

| Field | Verified value |
| --- | --- |
| ID | 3912 |
| Page type | Visualization |
| Title | Global Sea Surface Currents and Temperature |
| Release date | 16 March 2012 |
| Update date | 18 February 2025 |
| Progress | Complete |
| Main image | `flat_global_ecco2_2028x1024.25000.jpg` |
| Main image dimensions | 2048 × 1024 (2,097,152 pixels) |
| Main image type | Image / JPEG |
| Main video | `null` in the API record |
| Visualization credit | Greg Shirah, NASA/GSFC |
| Datasets | ECCO2 High Resolution Ocean and Sea Ice Model (Model, NASA/JPL); GTOPO30 Topography and Bathymetry (Data compilation, USGS) |
| Period | `2007-03-25T12:00:00Z` to `2008-03-03T12:00:00Z` |

### Credits

| Role | Person / organization |
| --- | --- |
| Visualization | Greg Shirah, NASA/GSFC |
| Animation | Greg Shirah, Horace Mitchell, Eric Sokolowsky |
| Producer | Michael Starobin, HTSI |
| Scientists | Hong Zhang, UCLA; Dimitris Menemenlis, NASA/JPL CalTech |
| Topography / bathymetry | GTOPO30, USGS |

The interface does not use the NASA insignia or logo. NASA does not endorse this project.

### The bundled still is a single frame

The main image filename ends in `.25000`. NASA's own frame-timestamp file maps frame **25000** to **2007-06-19T12:00:00Z**. Therefore the still is one instant from the animation, not a temporal composite of the full year.

This distinction is part of the interface. The plate caption reads "Single frame from the animation, 19 June 2007 12:00 UTC," and the source record shows frame 25000.

> Validation note: the API filename says `2028x1024`, but the API width field, the publisher's asset metadata, and the downloaded file all describe **2048 × 1024**. The filename is treated as a publisher typo; dimensions are taken from measured pixels and structured metadata.

### Media inventory observed

The record exposes rendered media, not numerical fields. Observed items include:

- 2048 × 1024 assembled still (the bundled frame).
- 6840 × 3420 full-resolution stills and frame sequences.
- 2048 × 1024 frame sequences, with and without colorbar.
- 960 × 540 and 2048 × 1024 movie files.
- Hyperwall crops and presentation files.

The existence of a **colorbar frame variant** was verified. It was not bundled for three reasons:

1. The colorbar frames are TIFF files, not web-ready stills.
2. A rendered colorbar permits approximate color matching, not validated field values.
3. The project's rule is that a rendered image is not a measurement source.

No numeric legend from the colorbar was read, transcribed, or used. The claim in the interface is therefore narrower and correct: the *bundled* frame has no embedded colorbar, and a rendered color scale would still not yield validated ECCO2 values.

---

## 5. What the image can and cannot support

### Supported visual readings

- Spatial pattern of modeled surface current flow.
- Relative warm and cool bands through color.
- Where narrow currents and eddies appear.
- That the view is global and historical.
- That the visualization covers one model year, 2007–2008.

### Not supported

| Claim | Why it is unsupported |
| --- | --- |
| Exact sea surface temperature at a pixel | No numerical field, no validated per-pixel legend, and compositing/antialiasing alter color. |
| Exact current velocity or direction | Flow curves are a visualization treatment; vector values are not published in the record. |
| Uncertainty or error bounds | Not present in the rendered media. |
| Subsurface structure | Only surface flows are used. |
| Live or current ocean conditions | The data ends on 3 March 2008. |
| Causal explanation of a pattern | The image shows a model state, not a controlled experiment. |

The project does **not** sample pixel colors as measurements. Doing so would convert a rendering choice into invented data.

---

## 6. ECCO2 context and the release question

### What ECCO states

From `https://ecco-group.org/products.htm` (accessed 14 Nov 2026):

- ECCO2 is listed as a **legacy product**.
- ECCO2 state estimates are eddy-permitting simulations at **18–30 km** horizontal resolution on a **cube-sphere** grid.
- The listed ECCO2 product, **ECCO Cube92**, has an estimation period of **1992–2023** and **50 vertical levels**.
- ECCO2 products were fitted to observations using a combination of Green's functions and the adjoint method.
- Fields from ECCO Version 4 and later are available on regular latitude–longitude grids and on the native model grid. ECCO2's native grid is the cube-sphere.

### What the SVS record does not state

The SVS record names ECCO2 and MITgcm. It does **not** publish:

- The exact ECCO2 run identifier or release name.
- The model build date.
- The forcing product or assimilation window used for this specific render.
- A checksum or manifest for the numerical fields.
- The numerical field files themselves.

Because the render was released in 2012, the ECCO2 run behind it is likely an older run than the currently listed Cube92 product. That is a reasonable inference, not a verified fact. It is recorded here as an **open question** and is not asserted in the interface.

### Current ECCO distribution is not a substitute

From `https://ecco-group.org/datasets.htm` (accessed 14 Nov 2026):

- ECCO V4r4 spans 1992-01-01 to 2018-01-01.
- The complete product exceeds **3 TB** across more than **385,000 granules**.
- It is distributed through NASA's PO.DAAC as roughly 90 products, mostly on a 0.5° latitude–longitude grid and the native llc90 grid.
- V4r4 is a different release from the ECCO2 run used in the 2012 visualization.

Downloading V4r4 and treating it as "the data behind the image" would be a provenance error. The project does not do this.

---

## 7. Numerical access: attempts and blockers

### Attempted

- NASA SVS Page API: exposes metadata and rendered media. No numerical ECCO2 variables.
- NASA SVS media groups: images, frames, movies, presentations. No NetCDF/Zarr/CSV fields.
- ECCO product and dataset pages: describe products and link to distribution, but do not serve anonymous field subsets.
- Legacy ECCO JPL host `https://ecco.jpl.nasa.gov/`: connection refused during validation on 14 November 2026.

### Not attempted or not completed

- PO.DAAC authenticated download. No Earthdata credentials were used.
- Bulk ECCO2 Cube92 retrieval. Size and exact release are unresolved.
- Subsetting through a PO.DAAC service. No verified subset endpoint was established for this product/release.

### Blockers

1. **No anonymous numerical endpoint** was verified for the exact ECCO2 run.
2. **Authentication**: PO.DAAC distribution is delivered through NASA Earthdata; downloads require an authenticated account. Credentials must never reach the browser.
3. **Scale**: the current ECCO product is measured in terabytes and hundreds of thousands of granules.
4. **Release ambiguity**: the 2012 render's exact model run is not named in the SVS record.
5. **Grid mismatch**: ECCO2's native cube-sphere grid is not a simple latitude–longitude image; a browser cannot treat it as one.

### What would count as success

A defensible Stage 2 dataset would be:

- A named ECCO2 release or a documented subset of one.
- One surface timestep, or a small time series, containing SST and both surface velocity components.
- On a documented grid, with units, missing-value conventions, and scaling factors.
- Acquired **once** by a server-side job, then checksummed and stored with its query and retrieval date.
- Small enough to inspect; its byte size must be measured, not assumed.
- Traceable to the same model family as the SVS render, with any release mismatch stated in the interface.

Until those conditions are met, the audio layer stays offline.

---

## 8. Licensing and attribution

### NASA SVS content

NASA SVS states that its content is in the public domain unless otherwise noted. Record 3912 does not note licensed music in the fields read. This project uses only one rendered still, not the video or audio.

NASA media guidelines still apply to NASA identifiers and imply no endorsement. The project:

- Credits NASA SVS, the visualization author, and the scientists.
- States that it is independent and not an official NASA product.
- Does not use the NASA insignia or logo.
- Does not imply NASA reviewed or approved the sonification concept.

Reference: <https://www.nasa.gov/nasa-brand-center/images-and-media/>

### ECCO data

The ECCO Consortium requires users to cite the dataset and the associated journal reference or product synopsis. This build uses **no ECCO numerical data**, so no ECCO data citation is legally required for the current asset. The citation is still shown because the visualization is derived from ECCO2 and because future stages will depend on it.

Requested format:

> ECCO Consortium. [Product Release Year]. [Product Name]. Dataset accessed [YYYY-MM-DD] from [url/or ftp site of data access].

### Fonts

Inter and IBM Plex Mono are self-hosted and licensed under the SIL Open Font License. They are not NASA assets.

### Icons

Lucide icons are used under the ISC License. No custom scientific imagery is fabricated.

---

## 9. Citations used in the interface

**Visualization**

> NASA Scientific Visualization Studio. *Global Sea Surface Currents and Temperature*. Visualization by Greg Shirah. Released 16 March 2012. Accessed 14 November 2026. <https://svs.gsfc.nasa.gov/3912/>

**Model context**

> ECCO Consortium. ECCO2 / ECCO Cube92. Dataset description accessed 14 November 2026. <https://ecco-group.org/products.htm>

**Current ECCO distribution (not used as the render's source)**

> ECCO Consortium. ECCO Version 4 Release 4. Dataset description accessed 14 November 2026. <https://ecco-group.org/datasets.htm>

---

## 10. Open questions

1. Which exact ECCO2 run, build, and forcing set produced the 2007–2008 render?
2. Is that run still archived, and where?
3. Does a publisher-supplied numeric color legend exist for the render?
4. What is the smallest authoritative subset that preserves SST and both velocity components?
5. Can the 2012 render's frame timing be matched to model timestamps without interpolation assumptions?
6. Are there licensing or attribution requirements specific to the legacy ECCO2 run that differ from the current ECCO product?

These are recorded as questions, not answered by inference.

---

## 11. Rules for future data work

1. **Never infer a measurement from a rendered image.** Color picking is not data extraction.
2. **Keep provenance labels.** Scientific data, rendered visualization, derived data, and synthetic data remain distinct.
3. **Name the release.** "ECCO2" alone is not a dataset identity.
4. **Measure the asset.** Record bytes, checksum, retrieval date, and subset query.
5. **Keep credentials server-side.** No Earthdata token in client code, URLs, or logs.
6. **State the mismatch.** If the numerical release differs from the render's source, say so in the interface.
7. **Do not fill gaps with plausible values.** A missing sample is `null`, not zero.
8. **Label synthetic fixtures in the UI**, not only in comments or test names.

---

## 12. Change log

| Date | Change |
| --- | --- |
| 14 Nov 2026 | Initial validation. SVS record and still verified; ECCO2 numerical access unresolved; Stage 1 scope fixed. |
| 14 Nov 2026 | Corrected the still description to a single frame (25000, 19 June 2007 12:00 UTC) after reading NASA's frame-timestamp file. Documented the separate colorbar frame variant. |
