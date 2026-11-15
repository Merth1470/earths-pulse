# Data Source Report

**Project:** Earth's Pulse — NASA Space Apps Challenge
**Stage:** 03, three working sonification instruments
**Validation date:** 14 November 2026
**Author:** Earth's Pulse project
**Status:** Numerical ocean, carbon, and air-quality records are connected. Three Web Audio instruments are implemented. ECCO2 numerical fields were not obtained; the NASA SVS 3912 render remains a separate reference.

This report records what was actually verified, how it was verified, what the project can claim, and what remains unresolved. A fact appears here only if it was read from a named publisher, measured from a file in this repository, or computed from the bundled dataset.

---

## 1. Bottom line

| Question | Answer |
| --- | --- |
| Is there a real numerical ocean field in the app? | **Yes.** 12 monthly composites for 2012 from OSCAR and OISST. |
| Are the currents direct measurements? | **No.** OSCAR is a satellite-derived near-surface current analysis at 15 m. |
| Is the temperature a direct measurement? | **No.** OISST v2.1 is a blended satellite/in-situ gridded product at 0 m. |
| Is the data live or current? | **No.** The period is January–December 2012. The interface says “not live”. |
| Is the sonification real? | **Yes.** Web Audio; three data-driven voices; user-initiated playback. |
| Are numerical ECCO2 fields connected? | **No.** ECCO2 endpoints were unreachable during validation. |
| Is the NASA SVS 3912 image a data source? | **No.** It is a rendered visualization from ECCO2 2007–2008 and a reference only. |
| Is the exact ECCO2 release behind the 2012 render known? | **No.** This remains open. |
| Is the project an official NASA product? | **No.** It is an independent challenge project. |

---

## 2. Verification method

Verification was performed on **14 November 2026** from the project environment. A source counted as verified only when at least one of the following was true:

1. Its publisher returned the record or page directly over HTTPS during validation.
2. Its file was downloaded, measured, and inspected.
3. Its metadata was read from the publisher's machine-readable endpoint.

The following were **not** accepted as evidence:

- Search-engine snippets or reposts.
- Memory of NASA visuals.
- Inferred values, plausible ranges, or color-picked pixels.
- Filenames that imply a date or variable without publisher metadata.
- The appearance of the NASA render as a substitute for numerical fields.

### Validation log

| Source | Method | Result |
| --- | --- | --- |
| `https://svs.gsfc.nasa.gov/api/3912` | Direct HTTPS GET, JSON parsed | Pass. Title, dates, credits, datasets, media inventory read. |
| `https://svs.gsfc.nasa.gov/3912/` | Direct HTTPS GET | Pass. Public record page available. |
| NASA main still | Downloaded and measured | Pass. 2048 × 1024 JPEG, 1,026,047 bytes. |
| `.../flat_ecco2_dates.txt` | Direct HTTPS GET | Pass. Frame-to-timestamp mapping read. |
| `https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar` | Dataset info + CSV fetch | Pass. OSCAR u/v, 15 m depth, 5-day composites. |
| `https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg` | Dataset info + CSV fetch | Pass. OISST v2.1, 0 m, daily, 0.25°. |
| `https://ecco.jpl.nasa.gov/` | Direct HTTPS request | **Fail.** Connection refused from the validation environment. |
| `https://opendap.jpl.nasa.gov/` / `podaac-opendap` | Direct HTTPS request | **Fail.** No connection. |
| `https://data.nas.nasa.gov/ecco/` | Direct HTTPS request | **Fail.** HTTP 502. |
| Numerical ECCO2 field | Any access path | **Not obtained.** See §7. |

No attempt was made to bypass authentication, scrape restricted data, or use unofficial mirrors.

---

## 3. Three distinct layers

The interface and code keep these layers separate. They must not be collapsed into one “NASA data” label.

### Layer 1 — Source scientific products

**OSCAR Sea Surface Velocity**

- Producer: Earth & Space Research (ESR), a NASA-funded effort.
- Product: global near-surface velocity, `u` and `v`, 5-day composites.
- Native resolution: 1/3°.
- Depth: **15 m**. This is not the 0 m sea surface.
- Nature: a satellite-derived analysis combining geostrophic, Ekman, and buoyancy components. It is not a direct measurement at every point.
- Citation: Bonjean, F. and G.S.E. Lagerloef (2002), *Journal of Physical Oceanography*, 32, 2938–2954.
- Access: NOAA CoastWatch ERDDAP dataset `jplOscar`.

**NOAA OISST v2.1**

- Producer: NOAA National Centers for Environmental Information.
- Product: Optimum Interpolation Sea Surface Temperature, daily.
- Native resolution: 0.25°.
- Depth: **0 m**.
- Nature: a blended satellite + in-situ gridded product, not a single instrument reading.
- Citation: Huang, B., et al. (2021), *Journal of Climate*, 34, 2923–2939.
- Access: NOAA CoastWatch ERDDAP dataset `ncdcOisst21Agg`.

**What is derived:** current speed (`√(u² + v²)`) and compass bearing (`atan2(u, v)`). These are computed by the app from the two source components. They are not separate published variables.

### Layer 2 — Processed subset in this repository

The browser receives a compact, documented reduction, not raw NetCDF.

| Property | Value |
| --- | --- |
| Period | January–December 2012 |
| Frames | 12, one per month |
| Grid | 240 longitudes × 106 latitudes, 1.5° equirectangular |
| Row order | North to south |
| Variables | `sst` (°C), `u` (m/s), `v` (m/s) |
| Binary | `public/data/ocean-2012.bin`, 1,831,680 bytes, Int16 little-endian |
| Layout | Frame-major → variable-major (`sst`, `u`, `v`) → row-major |
| Fill | `-32768`; never treated as a value |
| Metadata | `public/data/ocean-2012.json` |

**Sampling times.** One OSCAR composite nearest the 15th of each month and the nearest daily OISST field. The stored OSCAR times are 11 Jan, 20 Feb, 17 Mar, 16 Apr, 17 May, 16 Jun, 17 Jul, 16 Aug, 1 Sep, 16 Oct, 16 Nov, and 16 Dec 2012. OISST is the 15th at 12:00 UTC for every month. These are **samples**, not a continuous daily series, and the month label does not mean every value was observed on one day.

**Processing.**

1. Fetch the OSCAR `u` and `v` subsets and the OISST `sst` subset from ERDDAP as CSV.
2. Skip the ERDDAP units row; reject non-finite coordinates.
3. Bilinearly resample each source onto the shared 1.5° grid.
4. Where a source corner is missing, leave the target cell missing. Do not fill, bridge land, or smooth across a gap.
5. Quantize to Int16 with documented scales: SST 0.01 °C, velocity 0.001 m/s. Missing remains `-32768`.
6. Compute per-frame and global statistics and the normalization percentiles; write the JSON sidecar.

The script is `scripts/fetch-ocean-data.mjs`; responses are cached in `scripts/.cache/` (gitignored). Running it again without network access can reuse the cache.

### Layer 3 — NASA rendered reference

**Record:** NASA Scientific Visualization Studio 3912, “Global Sea Surface Currents and Temperature.”
**Visualization:** Greg Shirah, NASA/GSFC.
**Release:** 16 March 2012.
**Record update:** 18 February 2025.
**Underlying model:** ECCO2, period 2007-03-25 to 2008-03-03.
**This build:** one bundled 2048 × 1024 still (`public/assets/nasa/ecco2-global-currents-sst-2048.jpg`) and cited metadata. It is **not** the numerical source for the 2012 field and is not sonified. Pixel colors are never read as data.

The SVS render and the OSCAR/OISST subset are different products, different periods, and different processing chains. The interface says so on `/data-sources` and in the data record panel.

---

## 4. Validation results

The bundled binary was decoded independently of the browser.

| Check | Result |
| --- | --- |
| Frames | 12 |
| Grid | 240 × 106 = 25,440 cells per frame |
| Binary length | 12 × 3 × 25,440 × 2 = 1,831,680 bytes |
| Valid SST cells | 226,464 |
| Valid current vectors | 196,404 |
| SST range | −1.80 … 34.14 °C |
| SST mean | 14.85 °C |
| SST 2nd/98th percentile | −1.77 / 29.61 °C |
| Speed range | 0.00018 … 3.34 m/s |
| Speed mean | 0.127 m/s |
| Speed 98th percentile | 0.536 m/s |
| Per-frame SST cells | 18,872 in every month |
| Out-of-range SST | None outside the product's valid −3…45 °C envelope |
| Non-finite sources | Filtered before gridding |

Run `npm run verify:data` to repeat these checks from the committed files. Run `npm run verify:mapping` to check the audio mapping's monotonicity, determinism, and missing-data behavior.

The fact that each month has exactly 18,872 valid SST cells is a property of the fixed OISST land mask after regridding, not a claim that every month has identical coverage.

---

## 5. Normalization

Sound needs bounded ranges. The app uses values computed from the whole 2012 subset, not from a single route:

- **SST:** 2nd percentile −1.773 °C, 98th percentile 29.610 °C.
- **Speed:** 0 to the 98th percentile, 0.536066 m/s.

The normalization method is stored in the JSON and shown in the interface. Values outside the normalization range remain exact in the readout and visually present; only the audio parameter saturates. This avoids letting a few extreme coastal or high-latitude cells compress the entire audible range.

The choice is documented because it affects perception: a 29.6 °C sample and a 34.1 °C sample sound the same pitch, while the readings differ. The mapping is a perceptual aid, not a measurement instrument.

---

## 6. Claims this build supports

**Supported**

- “This instrument sonifies real, historical, gridded ocean fields from 2012.”
- “Currents are OSCAR 15 m near-surface velocities; temperature is OISST 0 m sea surface temperature.”
- “The values are resampled to a shared 1.5° grid with missing cells preserved.”
- “Temperature drives pitch, speed drives pulse rate, east–west flow drives stereo, north–south flow shifts pulse pitch.”
- “The interface and readings are usable without seeing the map.”
- “The NASA SVS 3912 render is a separate ECCO2 reference.”

**Not supported**

- “Live ocean conditions.”
- “Direct measurements at every point.”
- “ECCO2 data.”
- “A continuous 2012 time series.” There are 12 monthly samples.
- “Volume transport, subsurface circulation, or climate trends.”
- “The sound is a calibrated measurement.”
- “NASA endorses this project.”

---

## 7. Blocked ECCO2 access and why the dataset changed

The original concept pointed at ECCO2 because the NASA SVS 3912 animation is built from ECCO2. The numerical ECCO2 endpoints were not reachable from the validation environment:

- `https://ecco.jpl.nasa.gov/` — connection refused.
- `https://opendap.jpl.nasa.gov/` and `podaac-opendap` — no connection.
- `https://data.nas.nasa.gov/ecco/` — HTTP 502.
- No `python` runtime was available for an alternative client stack.

Rather than invent ECCO2 values, color-pick the render, or present the render as data, the project substituted two authoritative, public, NASA-relevant products that could actually be downloaded: OSCAR and OISST. The substitution is stated in the UI, the README, and this report. It is a scope change, not a silent swap.

The SVS record's ECCO2 period (2007–2008) is **not** the period of the numerical field (2012). No claim connects them beyond “the SVS render is a reference visualization.”

---

## 8. Licensing and attribution

- **OSCAR:** publicly redistributed by NOAA CoastWatch ERDDAP. ESR and NOAA provide no warranty of accuracy for legal use. Citation: Bonjean & Lagerloef (2002).
- **OISST v2.1:** U.S. Government work; public domain. Citation: Huang et al. (2021).
- **Natural Earth 110m land:** public domain.
- **NASA SVS 3912:** public domain unless noted. Credits: Greg Shirah (visualization), Greg Shirah, Horace Mitchell, Eric Sokolowsky (animation), Michael Starobin/HTSI (producer), Hong Zhang (UCLA) and Dimitris Menemenlis (NASA/JPL CalTech) (scientists), GTOPO30/USGS (topography and bathymetry).

Earth's Pulse is independent. NASA does not endorse it.

---

## 9. Open questions

1. Which exact ECCO2 release and variable set produced the SVS render released in 2012? The record gives the period and model family, not a citable granule list in the material read.
2. What is the full uncertainty envelope of OSCAR's 15 m analysis at 1.5° after regridding? The product documentation describes the analysis method but this build does not propagate uncertainty into the audio.
3. How sensitive is the perceptual result to the percentile normalization? A future version could expose alternate ranges or a calibration mode.
4. Should a future version use a co-located 15 m temperature field rather than 0 m OISST, so both sonified variables share a depth? That would require a different, verified product.
5. Can ECCO2 be obtained through an authenticated PO.DAAC route or a local mirror in a future environment? If so, the ECCO2 layer could return without changing the app's data contracts.

None of these gaps is hidden by the current interface.

---

## 10. Reproduction

```bash
node scripts/fetch-ocean-data.mjs   # network fetch + regrid; writes public/data/*
npm run verify:data                 # independent decode and assertions
npm run verify:mapping              # mapping determinism and missing-data checks
```

The fetch script targets the 15th of each month in 2012. If a month lacks a nearby OSCAR composite, it logs and continues rather than inventing one. The exact source timestamps used are recorded per frame in the JSON.

---

## 11. Carbon record verification

### Sources

| Source | Product | Period | Unit | Nature |
| --- | --- | --- | --- | --- |
| NOAA Global Monitoring Laboratory | Mauna Loa annual mean CO₂ | 1959–2024 | ppm | Measured atmospheric concentration at one benchmark station |
| Global Carbon Project | Global Carbon Budget 2025, global summary | 1959–2024 | GtC/yr | Annual global budget estimates |
| openclimatedata mirror | CSV mirror of the GCB summary | 1959–2024 | GtC/yr | Reproducible build input; DOI 10.18160/gcp-2025 |

The bundled record is the intersection of the two series. The build verifies that each year has both a concentration and a complete budget before writing it. No value is interpolated.

### Verified contents

- **66 annual records, 1959–2024.**
- CO₂: **315.98–424.61 ppm** (2024: 424.61).
- Total emissions (`fossil + landUse`): **4.61–11.79 GtC/yr** (2024: 11.79).
- Fossil emissions: **2.42–10.53 GtC/yr**.
- Land-use emissions: **1.26–2.16 GtC/yr**.
- Ocean sink: **1.02–3.39 GtC/yr**, positive in every year.
- Land sink: **0.21–3.29 GtC/yr**.
- Budget residual: **−1.91 to +1.91 GtC/yr**.
- Annual CO₂ change is derived from consecutive annual means; 1959 has no prior year and is reported as unavailable, not zero.
- The atmospheric growth, cement carbonation, and sink sum are retained so the budget identity can be checked.
- Bundle: `public/data/carbon-1959-2024.json`, 10.2 KB.

### What is not in the record

- Ocean, land, or geological carbon **stocks**.
- A global spatial field or national inventory.
- Monthly, daily, or gridded values.
- A forecast, a live concentration, or a causal attribution.
- Uncertainty propagation into the audio.

### Verification

`npm run verify:carbon` checks the year count, period, units, non-null values, the emissions identity, monotonic plausibility of concentration, ranges, and provenance/limitation strings. `npm run verify:carbon-mapping` checks the five voice mappings, independence of concentration and annual change, sign handling for negative fluxes, and determinism.

### Limits

The concentration is measured at Mauna Loa, Hawaii. It is a benchmark station, not a global mean. The sinks are model-based global estimates with uncertainties of roughly ±0.4 GtC/yr (ocean), ±0.5 GtC/yr (land), ±0.7 GtC/yr (land-use), and ±5% (fossil). The residual measures imperfect accounting; it is not “missing carbon.”

## 12. Air-quality record verification

### Sources

| Source | Product | Period | Resolution |
| --- | --- | --- | --- |
| US EPA AirData | Hourly PM2.5 (`88101`), NO₂ (`42602`), ozone (`44201`) | 2023 | Hourly, UTC |

### City and monitor selection

Eight cities are represented by one co-located ground monitor that reports all three pollutants. The build uses a per-pollutant POC map for each city's specific site; using a single POC across all pollutants was an early bug and is now prevented by the per-pollutant `wanted` map.

| City | Monitor | Site ID |
| --- | --- | --- |
| Los Angeles, CA | Los Angeles-North Main Street | 06/037/1103 |
| Seattle, WA | Seattle - Beacon Hill | 53/033/0080 |
| Denver, CO | La Casa | 08/031/0026 |
| Houston, TX | Houston East | 48/201/1034 |
| Minneapolis, MN | Near Road I-35/I-94 | 27/053/0962 |
| New York, NY | Queens College 2 | 36/081/0124 |
| Phoenix, AZ | West Phoenix | 04/013/0019 |
| Philadelphia, PA | North East Waste (NEW) | 42/101/0048 |

Pollutant-specific POCs are stored per city and displayed in the reading panel.

### Verified contents

- **8 cities × 8,760 hours = 70,080 city-hours** before missing-value filtering.
- PM2.5: **69,074 valid city-hours**, reported range **−9 to 1,069 µg/m³**, 98th percentile **31.9**.
- NO₂: **66,135 valid city-hours**, reported range **−2.5 to 70.4 ppb**, 98th percentile **39.4**.
- Ozone: **65,043 valid city-hours**, reported range **−0.001 to 0.136 ppm**, 98th percentile **0.066**.
- Nulls are preserved. No hour is filled from a daily average, a nearby station, or a seasonal model.
- A few reported values are slightly negative. They are preserved as reported instrument noise or zero drift, not replaced with zero.
- Bundle: `public/data/air-quality-2023.json`, 0.93 MB.

### What is not in the record

- A city-wide average or a continuous pollution surface.
- A satellite-derived atmospheric column.
- Live air quality, a forecast, or a health warning.
- Source attribution, chemical composition, or compliance with any standard.
- Any value for a city-hour not reported by the selected monitor.

### Verification

`npm run verify:air` checks the eight city identities, 8,760-hour length, null preservation, units, ranges, valid counts, and source strings. `npm run verify:air-mapping` checks the three pollutant voices, west/east stereo, missing-layer silence, and deterministic output.

### Limits

A single point monitor is not a city-wide average and is not street-level precision for the whole city. Local siting and methods differ. Ozone is often measured seasonally, so winter gaps are normal and are not zero. The data do not establish health effects, pollution sources, or regulatory compliance.

## 13. Reproduction — all records

```bash
node scripts/fetch-ocean-data.mjs          # OSCAR + OISST → ocean-2012.*
node scripts/build-carbon-data.mjs         # NOAA GML + GCB → carbon-1959-2024.json
node scripts/build-air-quality-data.mjs    # EPA AirData → air-quality-2023.json
npm run verify                             # all data and mapping checks
```

The ocean and air scripts use cached downloads in `scripts/.cache/`; carbon reads the cached source files. Rebuilding does not call any API from the browser.
