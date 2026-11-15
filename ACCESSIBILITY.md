# Accessibility

**Project:** Earth's Pulse
**Scope:** the three sonification instruments and their supporting routes.
**Status:** implemented and manually tested; not a formal WCAG audit.

Earth's Pulse is built blind-first: the sound and the reading panel are primary, and each visual (an ocean field, a carbon diagram, a city map) is an additional representation. This document describes what works, how to operate it without a pointer, and what remains limited.

---

## 1. What the nonvisual path contains

Every experience provides the same four access layers:

- A skip link to `#main`, one `<h1>`, and one `<main>` per page.
- Native `<button>`, `<select>`, `<input type="range">`, and checkbox controls with visible labels or accessible names.
- A reading panel with the same values that drive the audio, printed with units.
- A plain-language description of the current sample, also used by speech synthesis.
- A polite live region for automatic announcements, or browser speech instead of it.
- A “Read this…” button for the current sample on demand.
- A traceable table or definition list with every value and its limits.
- Visible focus outlines and a `prefers-reduced-motion` path for the ocean field.

No scientific value exists **only** in a canvas, SVG, or map. Everything that sounds is also available as text.

## 2. Per-experience controls

| Experience | Sample control | Primary values | Automatic speech interval |
| --- | --- | --- | --- |
| Ocean `/ocean` | Region, month, 48-step position slider | SST, current speed, bearing, position | Every 4th step |
| Carbon `/carbon` | Year select and 66-year slider | CO₂, annual change, emissions, sinks, residual | Every 5th year |
| City `/air-quality` | City, pollutant, day, hour slider | PM2.5, NO₂, ozone, monitor, UTC time | Every 4th hour |

Each experience also has: Play/Pause, Stop, a sample-index slider with `aria-valuetext`, speed, volume, and independent layer switches. The carbon and city instruments use a shared transport component; the ocean instrument keeps its own.

## 3. Keyboard operation

| Control | Keys | Result |
| --- | --- | --- |
| Skip link | `Tab`, `Enter` | Moves focus to the main content |
| Ocean region / month | `Tab`, arrow keys, `Enter` | Changes the field; playback resets |
| Carbon year select | `Tab`, arrow keys, `Enter` | Jumps to an annual state |
| City / pollutant / day | `Tab`, arrow keys, `Enter` | Changes the sample and reading |
| Play / pause | `Tab`, `Enter` or `Space` | Starts audio after a user gesture; pauses and resumes |
| Stop | `Tab`, `Enter` or `Space` | Silences audio and returns to the start |
| Sample slider | `Tab`, arrow keys | Moves **one real sample** per arrow; `Home`/`End` go to the ends |
| Speed | `Tab`, `Enter` | 0.5×, 1×, or 2× |
| Layers | `Tab`, `Space` | Toggles each voice independently |
| Volume | `Tab`, arrow keys | 0–100% |
| Read aloud | `Tab`, `Enter` | Speaks the current reading |
| Speech checkbox | `Tab`, `Space` | Switches automatic speech on/off |
| Comparison / table | `Tab` into the disclosure, then browse | Reads the same numbers as the sound |

The sliders are sample indexes, not continuous 0–1000 controls. Ocean value text reads, for example, “Step 02 of 48, 77.0° W / 38.0° N”; carbon reads the year and concentration; the city reads the UTC hour and pollutant value.

The play button's accessible name changes between “Play…” and “Pause sonification”. It does not use `aria-pressed`, so assistive technology does not announce a confusing “pressed” state on top of the changing name. The transport status (“Ready”, “Running”, “Paused”, “Complete”) is visible text.

## 4. Screen reader and speech behavior

There are two automatic announcement paths, and they are deliberately exclusive:

1. **Live region (default).** A visually hidden `aria-live="polite"` paragraph updates on the experience's interval. This lets a screen reader announce progress without a second voice.
2. **Browser speech (optional).** Turning on the speech checkbox removes the live region and sends the same text to `speechSynthesis`. This avoids hearing the same sentence twice.

“Read this aloud” always speaks the current sample and is independent of the automatic mode. It is disabled when the browser does not expose `speechSynthesis`.

Spoken text is generated from the same function as the visible description:

- Ocean: month, longitude, latitude, SST, current speed, and bearing.
- Carbon: year, concentration, annual change, emissions, sinks, and residual, with definitions.
- City: monitor, UTC timestamp, all three pollutants and units, and missing values.

The speech is the browser's voice, not a recorded narration. Voice availability, language, and pronunciation vary by operating system. The text is the source of truth.

## 5. Missing data, gaps, and silence

Missing data is preserved, not imputed:

- **Ocean:** a route can cross land or a source gap. The reading says “Missing”; temperature or current voices are silenced if their layer is missing; the table shows an em dash.
- **Carbon:** the annual records are complete for 1959–2024. The first year has no prior-year CO₂ change; the reading says the change is not available rather than inventing zero.
- **City:** an absent hour or pollutant is `null`. Its voice is silent and the reading says “Missing.” Ozone is often monitored seasonally, so winter silence is expected. No hour is filled from a daily average.

Missing data is never converted to 0 °C, 0 m/s, 0 ppm, or a default direction. This is both a scientific and an accessibility decision: a false value is worse than an honest silence.

## 6. Motion, color, and touch

- `prefers-reduced-motion: reduce` disables ocean particle advection and draws static current vectors instead. The carbon diagram and city map do not animate.
- The ocean canvas, carbon diagram, and city map have accessible names and text equivalents. No meaning depends on color alone.
- Text and controls use the site's high-contrast palette. Focus is a visible cyan outline, not a color-only change.
- Mobile touch targets for play, stop, sliders, volume, layer checkboxes, and speech buttons are enlarged at narrow widths. The layout has no horizontal overflow at 390, 834, or 1440 CSS pixels.
- The carbon diagram scrolls horizontally at narrow widths; it is keyboard-focusable and accompanied by a visible scroll hint.
- The interface uses one column at narrow widths; controls are not hidden behind hover-only menus.

## 7. Audio lifecycle

Each mounted instrument owns one `AudioContext`. Playback starts only after a gesture. Pause and Stop suspend the context; Stop also silences every voice. Navigating to another experience unmounts the previous instrument, disposes its audio graph, and closes its context. There is no shared global player that can continue the previous experience's sound.

## 8. Known limitations

- **Audio needs a gesture.** Browsers block autoplay. Each instrument explains this and starts only after Play.
- **Stereo needs two channels.** A mono speaker collapses the ocean east–west cue and the city's west–east position. The bearing or longitude is still in the reading.
- **Hearing differs.** The mappings stay within limited ranges and use a compressor, but they are not calibrated perceptual scales.
- **Speech synthesis is not guaranteed.** Some browsers expose the API with no voices; the button is disabled and the live region remains.
- **Screen reader + sonification mixing.** A screen reader may speak over the audio. Users can turn automatic speech off and use “Read this aloud” between phrases.
- **The carbon diagram is not a map.** It is a conceptual reservoir/flow diagram, not to scale; the reading panel carries the exact values.
- **One monitor is not a city.** The city map is a control for eight stations, not a continuous pollution surface.
- **No formal conformance claim.** The app was checked with automated DOM assertions, keyboard traversal, and manual browser review. It has not been audited by a certified accessibility professional or tested with every screen reader/browser combination.

## 9. How this was checked

Manual and scripted checks performed for this build:

- One `<h1>` and one `<main>` per route; `lang="en"`; no duplicate IDs; no unnamed buttons, inputs, or selects.
- Skip link moves focus to `#main`.
- Tab order reaches each experience's selects, transport, sliders, layers, speech, and tables.
- Ocean, carbon, and city sliders move exactly one real sample per arrow key.
- One polite live region by default; zero live regions when browser speech is enabled, on all three experiences.
- Speech receives the same sentence shown in the reading panel.
- Play creates one `AudioContext` per instrument; pause and stop suspend it; navigating to another experience closes it.
- The ocean, carbon, and city pages have no horizontal overflow at 320, 360, 390, 834, and 1440 CSS pixels.
- No console errors on desktop, tablet, or mobile.
- Loading, failed-request, and retry states are operable by keyboard.

## 10. Manual test script

1. Load `/`. Use `Tab` then `Enter` on “Skip to main content”.
2. Open `/ocean`. Change Region and Month; confirm the readings reset. Play, then move the position slider one arrow key; confirm one step.
3. Open `/carbon`. Select 2024; confirm 424.6 ppm and 11.8 GtC/yr. Toggle a layer; confirm the value remains in the reading. Turn speech on and off; confirm the live region disappears and returns.
4. Open `/air-quality`. Choose Los Angeles, then NO₂; confirm the monitor name, timestamp, units, and POC update. Move the hour slider one arrow key; confirm one hour.
5. In either new instrument, play, pause, stop, and change speed/volume. Confirm no error and no stale sound after Stop.
6. Navigate directly from one experience to another while audio is playing; confirm the previous sound stops and only one `<h1>` remains.
7. Open the carbon and city comparison disclosures; confirm missing values are labelled, not ranked.
8. Enable “Reduce motion” in the OS or browser and reload `/ocean`; confirm particles stop and static vectors remain.
9. Resize to 390 px and confirm no horizontal page scrolling and that the transport, readings, and tables remain operable.
10. Test with a screen reader and, separately, with browser speech. Include the browser, assistive technology, viewport, and value shown if a step fails.
