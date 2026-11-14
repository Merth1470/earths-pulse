# Science and Sonification

**Project:** Earth's Pulse
**Purpose:** explain exactly what is measured, what is derived, how it becomes sound, and what the sound cannot tell you.
**Status:** implemented in the browser; historical 2012 fields; not live.

---

## 1. What is being sonified

Two different ocean products are combined on one grid.

| Layer | Product | Depth | Nature | Native resolution |
| --- | --- | --- | --- | --- |
| Currents | OSCAR Sea Surface Velocity | **15 m** | Satellite-derived near-surface current analysis | 1/3°, 5-day composite |
| Temperature | NOAA OISST v2.1 | **0 m** | Blended satellite + in-situ sea surface temperature | 0.25°, daily |

The current is stored as two components, `u` (eastward) and `v` (northward), in metres per second. Speed and bearing are **derived** from them:

```text
speed   = √(u² + v²)
bearing = atan2(u, v) in degrees clockwise from north
```

Neither product is a direct reading at every grid point. OSCAR is an analysis combining geostrophic, Ekman, and buoyancy components. OISST is a gridded blend. "OSCAR current" never means a single buoy or a single satellite pixel.

The two layers are not at the same depth. A temperature reading at 0 m and a current at 15 m describe related but distinct parts of the upper ocean. The interface keeps both depths visible rather than implying one measurement.

## 2. The bundled subset

The browser does not download raw NetCDF collections. A Node preprocessing script selects **one OSCAR composite near the 15th of each month** and the **nearest daily OISST field**, then bilinearly resamples both to a shared grid.

- 12 frames: January–December 2012.
- Grid: 240 longitudes × 106 latitudes, 1.5° equirectangular, north-to-south rows.
- 254,400 cells across the 12 frames; 226,464 valid SST cells; 196,404 valid current vectors.
- SST range: −1.80 to 34.14 °C. Current speed 98th percentile: 0.536 m/s; maximum sampled speed 3.34 m/s.
- Missing source corners are excluded, not zeroed, and not smoothed across land. Fill sentinel in the binary is `-32768`.
- Normalization for sound: SST 2nd–98th percentile (−1.77 to 29.61 °C); speed 0 to the 98th percentile (0.536 m/s).

The stored sample times are listed in `public/data/ocean-2012.json`. They are not all the 15th: OSCAR composites fall on different days, and OISST is the nearest daily field. The visible month label is the month, not a claim that every value was observed on one day.

**Sampling is a choice.** A listening route is a straight zonal line at one latitude, divided into 48 equal steps. It is not a drifter track, a front, a boundary, or a water parcel. The step spacing differs by route because the routes have different lengths: about 1° per step for the Gulf Stream (48° span), 2.5° for the equatorial Pacific (120°), 0.9° for the Agulhas (42°), and 7.5° for the Southern Ocean (360°).

Four routes are provided:

- Gulf Stream, 38°N, 78°W → 30°W
- Equatorial Pacific, 0°, 160°E → 80°W
- Agulhas, 34°S, 18°E → 60°E
- Southern Ocean, 55°S, 180°W → 180°E

Each is a deliberate listening path. None is a claim about the full current system.

## 3. The mapping

The mapping is pure and deterministic (`src/lib/audio/mapping.ts`). Continuous physical values drive continuous audio parameters. There is no musical scale, no random note choice, and no invented value for missing data.

### Temperature → tone

```text
sstNorm = clamp((sst − (−1.773)) / (29.610 − (−1.773)), 0, 1)
toneHz  = 130.81 × 2^(2 × sstNorm)          // C3 … C5
cutoff  = 380 + 2600 × sstNorm              // Hz
```

Colder water is lower and duller; warmer water is higher and brighter. The two-octave span is a perceptual choice, not a physical unit. Values below −1.773 °C and above 29.610 °C saturate in pitch while remaining exact in the readings.

### Speed → pulse

```text
speedNorm = clamp(speed / 0.536066, 0, 1)
pulseRate = 0.65 + 5.35 × speedNorm          // Hz
pulseDepth = 0.05 + 0.23 × speedNorm
textureGain = 0.008 + 0.070 × speedNorm
textureCutoff = 260 + 1200 × speedNorm       // Hz
```

Faster flow pulses more often and with more accent. Slack water becomes a slow, quiet pulse. The pulse is an amplitude modulation of a low tone, not a metronome tied to wall-clock seconds; its rate is the data.

### Direction → stereo and pulse pitch

```text
uNorm = clamp(u / 0.536066, −1, 1)
vNorm = clamp(v / 0.536066, −1, 1)
pan   = 0.9 × uNorm                          // −0.9 … +0.9
pulseHz = (toneHz / 2) × 2^(3 × vNorm / 12)  // ±3 semitones
```

Eastward flow moves right; westward flow moves left; northward flow lifts the pulse; southward flow lowers it. Stereo is not a map bearing: it carries only the east–west component. The spoken and visible reading names the full compass bearing from `atan2(u, v)`.

### Position → time

The route is heard west to east, one sample at a time. At 1× each sample lasts 0.8 s, so a 48-step route lasts about 38 s. Playback speed changes listening time only.

### Layer mixing

Three voices can be switched independently:

1. **Temperature tone** — sine plus a slightly detuned triangle through a low-pass filter.
2. **Current pulse** — triangle oscillator whose amplitude is modulated by a sine LFO; a waveshaper makes the pulse asymmetric (a beat, not a symmetric tremolo).
3. **Flow texture** — deterministic band-passed noise, quiet, following speed and stereo position.

All three pass through a compressor and a master gain (`0.9 × volume`). The master starts at zero and fades in only after a user gesture.

## 4. Signal path

```text
OSCAR u, v ──► speed, bearing ──► pulse rate, pan, pitch ──► pulse voice
OSCAR u, v ──► speed ───────────► texture gain/cutoff ─────► noise voice
OISST sst  ──► normalized ──────► tone pitch, filter ──────► tone voice
                                                    │
                                              compressor
                                                    │
                                              master gain
                                                    │
                                              speakers
```

The engine (`src/lib/audio/sonifier.ts`) owns one `AudioContext` per mounted instrument. Oscillators and the noise source start once and are stopped and disconnected in `dispose()`; the context is closed. Navigating away closes it. Play does not create a new context on every press.

## 5. Missing data is silent, not zero

A cell can have valid temperature and missing velocity, or the reverse. The mapping returns a `null` only when both are missing; otherwise it marks each layer:

- `hasTemperature` is false when SST is missing → the temperature tone is silenced.
- `hasFlow` is false when `u`, `v`, or derived speed is missing → the pulse and texture are silenced.

This matters scientifically. Mapping a missing SST to 0 °C would sound like cold water; mapping a missing velocity to 0 m/s would sound like slack water. Neither is true. The reading panel says "Missing", the spoken description says the value is missing, and the transect table shows a dash.

## 6. What the sound supports — and what it does not

**Supported**

- Comparing relative temperature, speed, and direction **along one route** in one month.
- Hearing where a route crosses land or a data gap.
- Hearing seasonal differences across the 12 monthly samples.
- Hearing the difference between a warm, fast western boundary current and a colder, slower region.

**Not supported**

- Absolute measurement by ear. Pitch and loudness are perceptual, not calibrated instruments.
- Volume transport, subsurface structure, or vertical circulation. OSCAR is a 15 m analysis; the app has no depth dimension.
- Causal attribution, trends, or climate conclusions from 12 monthly snapshots.
- Continuity between months. One composite per month is a sample, not a time series; the app does not interpolate between frames.
- Live or current conditions. The period is 2012 and the interface says so.
- Equality with the NASA SVS 3912 render. That visualization uses ECCO2 for 2007–2008 and is a separate reference.

**Perceptual caveats**

- Stereo direction depends on speaker placement and headphones. A mono speaker collapses the pan cue; the reading still gives the full bearing.
- Hearing ranges and device equalization differ. The tone stays within C3–C5 and the compressor limits peaks, but the experience is not identical for every listener.
- The 2nd–98th percentile normalization is shared across the year, so months are comparable to each other, but the most extreme cells saturate in pitch and pulse rate.
- Particle motion in the map is deliberately accelerated. It shows direction and relative speed, **not** real-time displacement.

## 7. Verification

```bash
npm run verify:data
npm run verify:mapping
```

`verify:data` decodes the binary and asserts the frame count, grid size, byte length, valid counts, physical ranges, statistics, and normalization. `verify:mapping` asserts monotonic pitch/rate/pan, deterministic output, and per-voice silence for missing variables.

Manual browser checks used in this build:

- One audio context is created and reused; pause suspends it; stop suspends it; route change closes it.
- The step index advances while playing and follows the position slider.
- Loading, request failure, and retry states are real, not simulated.
- No console errors at desktop, tablet, or mobile widths.

## 8. Citations

- Bonjean, F. and G.S.E. Lagerloef (2002). Diagnostic model and analysis of the surface currents in the tropical Pacific Ocean. *Journal of Physical Oceanography*, 32, 2938–2954.
- Huang, B., et al. (2021). Improvements of the Daily Optimum Interpolation Sea Surface Temperature (DOISST) Version 2.1. *Journal of Climate*, 34, 2923–2939.
- NASA Scientific Visualization Studio record 3912, “Global Sea Surface Currents and Temperature” (reference visualization only).
- Natural Earth 110m land (coastlines).

Full access log and unresolved provenance questions: [`DATA_SOURCE_REPORT.md`](DATA_SOURCE_REPORT.md).
