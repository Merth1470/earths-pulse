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

A site-wide **voice guide** speaks the instructions on the first visit and can be replayed at any time from the keyboard. Section 4 covers it.

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

## 4. The voice guide

The site speaks for itself. On the first visit an introduction plays without any interaction: what Earth's Pulse is, that every control works from the keyboard, and the one key that brings the instructions back. A listener who misses it needs nothing but `H`.

| Key | Effect |
| --- | --- |
| `H` | Replay the guide for the current page, then the essential keys |
| `?` | Open and speak the complete shortcut list |
| `M` | Silence or restore the voice |
| `Escape` | Stop the voice mid-sentence |
| `0`–`6` | Jump to home, ocean, carbon, city, about, data sources, accessibility |

Inside an instrument, `P` plays or pauses, `S` stops, `R` reads the current sample, and `J`, `V`, `L`, `C` move focus to the sample slider, volume, layer switches, and the first selector. These work even while a slider has focus, so a listener never has to tab away from the sample they are hearing.

Each page shortcut also carries `aria-keyshortcuts` on its nav link, so assistive technology can discover the binding on the element itself.

Design decisions behind it:

- **One speech path.** The guide and the per-instrument “read this aloud” buttons share a single queue and a single mute switch. Two voices never talk over each other, and `M` silences the whole site rather than one component.
- **Keys follow the control.** A text field keeps every character. Inside a `<select>`, a letter is only treated as a shortcut when no option starts with that letter, so native type-ahead still moves the list. `?` and `Escape` are handled everywhere, because the shortcut list must always be reachable.
- **A failed autoplay is visible, not silent.** Browsers may accept a speech request and never speak it. If no sound has started shortly after the request, the guide stops claiming to speak and shows a **Start the guide** button that does the same thing on a real gesture.
- **Speech is optional, never load-bearing.** The same instructions are printed in the `?` dialog and on `/accessibility`. Nothing is spoken that is not also readable, and the guide never describes a control that does not exist — the key table, the narration, and `aria-keyshortcuts` all read from `src/lib/accessibility/guide.ts`.
- **Preferences are remembered.** The mute state persists in `localStorage`; the introduction repeats once per tab session, and each client-side navigation announces where the visitor arrived.
- **No visual change for sighted users.** The guide adds one header button, one dismissible first-visit prompt, and one modal that only opens on request. Existing controls, layout, and styling are untouched.

## 5. Screen reader and speech behavior

There are two automatic announcement paths, and they are deliberately exclusive:

1. **Live region (default).** A visually hidden `aria-live="polite"` paragraph updates on the experience's interval. This lets a screen reader announce progress without a second voice.
2. **Browser speech (optional).** Turning on the speech checkbox removes the live region and sends the same text to `speechSynthesis`. This avoids hearing the same sentence twice.

“Read this aloud” always speaks the current sample and is independent of the automatic mode. It is disabled when the browser does not expose `speechSynthesis`.

Spoken text is generated from the same function as the visible description:

- Ocean: month, longitude, latitude, SST, current speed, and bearing.
- Carbon: year, concentration, annual change, emissions, sinks, and residual, with definitions.
- City: monitor, UTC timestamp, all three pollutants and units, and missing values.

The speech is the browser's voice, not a recorded narration. Voice availability, language, and pronunciation vary by operating system. The text is the source of truth.

## 6. Missing data, gaps, and silence

Missing data is preserved, not imputed:

- **Ocean:** a route can cross land or a source gap. The reading says “Missing”; temperature or current voices are silenced if their layer is missing; the table shows an em dash.
- **Carbon:** the annual records are complete for 1959–2024. The first year has no prior-year CO₂ change; the reading says the change is not available rather than inventing zero, and its tremolo depth is zero.
- **City:** an absent hour or pollutant is `null`. Its voice is silent and the reading says “Missing.” Ozone is often monitored seasonally, so winter silence is expected. No hour is filled from a daily average.

Missing data is never converted to 0 °C, 0 m/s, 0 ppm, or a default direction. This is both a scientific and an accessibility decision: a false value is worse than an honest silence.

## 7. Motion, color, and touch

- `prefers-reduced-motion: reduce` disables ocean particle advection and draws static current vectors instead. The carbon diagram and city map do not animate.
- The ocean canvas, carbon diagram, and city map have accessible names and text equivalents. No meaning depends on color alone.
- Text and controls use the site's high-contrast palette. Focus is a visible cyan outline, not a color-only change.
- Mobile touch targets for play, stop, sliders, volume, layer checkboxes, and speech buttons are enlarged at narrow widths. The layout has no horizontal overflow at 390, 834, or 1440 CSS pixels.
- The carbon diagram scrolls horizontally at narrow widths; it is keyboard-focusable and accompanied by a visible scroll hint.
- The interface uses one column at narrow widths; controls are not hidden behind hover-only menus.

## 8. Audio lifecycle

Each mounted instrument owns one `AudioContext`. Playback starts only after a gesture. Pause and Stop suspend the context; Stop also silences every voice. Navigating to another experience unmounts the previous instrument, disposes its audio graph, and closes its context. There is no shared global player that can continue the previous experience's sound.

## 9. Known limitations

- **Audio needs a gesture.** Browsers block autoplay. Each instrument explains this and starts only after Play.
- **Stereo needs two channels.** A mono speaker collapses the ocean east–west cue and the city's west–east position. The bearing or longitude is still in the reading.
- **Hearing differs.** The mappings stay within limited ranges and use a compressor, but they are not calibrated perceptual scales.
- **Speech synthesis is not guaranteed.** Some browsers expose the API with no voices, or accept an utterance and never speak it. The guide detects a start that never happens, stops reporting “speaking”, and offers the visible start button; the same instructions stay on screen.
- **A single-letter shortcut can beat a select's type-ahead.** Inside a selector a letter is only used as a shortcut when no option begins with that letter, so a list of regions still jumps to “North Atlantic” on `N`, but `J` jumps to the sample slider even while a list of years has focus.
- **Screen reader + sonification mixing.** A screen reader may speak over the audio. Users can turn automatic speech off and use “Read this aloud” between phrases.
- **The carbon diagram is not a map.** It is a conceptual reservoir/flow diagram, not to scale; the reading panel carries the exact values.
- **One monitor is not a city.** The city map is a control for eight stations, not a continuous pollution surface.
- **No formal conformance claim.** The app was checked with automated DOM assertions, keyboard traversal, and manual browser review. It has not been audited by a certified accessibility professional or tested with every screen reader/browser combination.

## 10. How this was checked

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
- The intro speaks on first load and names `H` in its first lines; every spoken line originates from `src/lib/accessibility/guide.ts`.
- `H`, `?`, `M`, `Escape`, and `0`–`6` were pressed on every route and produced the documented action.
- `P`, `S`, and `R` drove all three instruments, including while the sample slider had focus.
- `J`, `V`, `L`, and `C` moved focus to the sample slider, volume, layer switches, and first selector on all three instruments, and `J` still worked when a `<select>` had focus.
- Muting with `M` persisted to `localStorage` and silenced both the guide and “Read this aloud”; unmuting restored both.
- The `?` dialog opened from inside a selector, trapped focus, and closed on `Escape`.
- The dialog has no horizontal overflow and the page has no horizontal scroll at 390 CSS pixels.

## 11. Manual test script

1. Load `/`. Use `Tab` then `Enter` on “Skip to main content”.
2. Load `/` in a fresh tab and stop touching the machine. Confirm the voice introduces the site within about a second and says the letter `H` in the first few sentences. If the browser blocks speech, confirm a **Start the guide** button appears instead, and that pressing it starts the same narration.
3. Press `H`. Confirm the guide names the current page, the essential keys, and how to repeat it. Press `Escape` mid-sentence and confirm the voice stops.
4. Press `?`. Confirm the shortcut list opens, is spoken, keeps focus inside it, and closes on `Escape`. Press it again while a `<select>` has focus; it must still open.
5. Press `M` twice. Confirm the first press silences the guide and every “read this aloud”, and that the second restores it and says so.
6. Press `1`, `2`, `3`, `4`, `5`, `6`, `0` in turn; confirm each loads the named page and the guide announces the new page.
7. On each instrument press `P`, `S`, `R` without tabbing to the transport; confirm play, stop, and a spoken reading. Repeat once with the sample slider focused; confirm `P` still plays.
8. Press `J`, `V`, `L`, `C` on each instrument and confirm focus lands on the sample slider, volume, first layer switch, and first selector. With a selector focused, press `J` again; it must still reach the slider, and pressing a letter that begins an option must still jump the list.
9. Open `/ocean`. Change Region and Month; confirm the readings reset. Play, then move the position slider one arrow key; confirm one step.
10. Open `/carbon`. Select 2024; confirm 424.6 ppm and 11.8 GtC/yr. Toggle a layer; confirm the value remains in the reading. Turn speech on and off; confirm the live region disappears and returns.
11. Open `/air-quality`. Choose Los Angeles, then NO₂; confirm the monitor name, timestamp, units, and POC update. Move the hour slider one arrow key; confirm one hour.
12. In either new instrument, play, pause, stop, and change speed/volume. Confirm no error and no stale sound after Stop.
13. Navigate directly from one experience to another while audio is playing; confirm the previous sound stops and only one `<h1>` remains.
14. Open the carbon and city comparison disclosures; confirm missing values are labelled, not ranked.
15. Enable “Reduce motion” in the OS or browser and reload `/ocean`; confirm particles stop and static vectors remain.
16. Resize to 390 px and confirm no horizontal page scrolling, that the shortcut dialog fits, and that the transport, readings, and tables remain operable.
17. Turn the screen off, or close your eyes, and complete an entire session — intro, page jump, play, one reading — using only the keyboard. Anything that required looking is a bug.
18. Test with a screen reader and, separately, with browser speech. Include the browser, assistive technology, viewport, and value shown if a step fails.
