# Accessibility

**Project:** Earth's Pulse
**Scope:** the browser instrument and its four routes.
**Status:** implemented and manually tested; not a formal WCAG audit.

Earth's Pulse is built blind-first: the sound and the reading panel are the primary experience, and the map is an additional representation. This document describes what works, how to operate it without a pointer, and what remains limited.

---

## 1. What the nonvisual path contains

- A skip link to `#main`.
- One `<h1>` and one `<main>` per page.
- Native `<button>`, `<select>`, `<input type="range">`, and checkbox controls with visible labels or accessible names.
- A highlighted transect that exists as data, not only as pixels.
- A reading panel with the same values that drive the audio: sea surface temperature, current speed, and the compass direction the current flows toward.
- A plain-language description of the current sample, also used by speech synthesis.
- A polite live region that announces every fourth sample by default.
- An optional “Announce every fourth step” mode that speaks through the browser's speech synthesis.
- A “Read this aloud” button for the current sample on demand.
- A full transect table below the instrument with every sample, including missing values.
- Visible focus outlines and a `prefers-reduced-motion` path that stops particle animation.

The canvas has `role="img"` and an accessible name that summarizes the month, the transect, and the values. No value exists **only** in the canvas; everything sounding is also in text.

## 2. Keyboard operation

| Control | Keys | Result |
| --- | --- | --- |
| Skip link | `Tab`, `Enter` | Moves focus to the main content |
| Region and month | `Tab`, arrow keys, `Enter` | Changes the field; playback resets |
| Play / pause | `Tab`, `Enter` or `Space` | Starts audio after a user gesture; pauses and resumes |
| Stop | `Tab`, `Enter` or `Space` | Silences audio and returns to sample 1 |
| Position | `Tab`, arrow keys | Moves **one sample** per arrow; `Home`/`End` go to the ends |
| Speed | `Tab`, `Enter` | 0.5×, 1×, or 2× |
| Sound layers | `Tab`, `Space` | Toggles temperature tone, current pulse, flow texture |
| Volume | `Tab`, arrow keys | 0–100% |
| Read this aloud | `Tab`, `Enter` | Speaks the current reading |
| Announce every fourth step | `Tab`, `Space` | Switches automatic speech on/off |
| Transect table | `Tab` into the disclosure, then browse | Reads the same numbers as the sound |

The position slider is a sample index, not a continuous 0–1000 scale. Its `aria-valuetext` reads, for example, “Step 02 of 48, 77.0° W / 38.0° N”. This means a screen reader user can move through the route one sample at a time without needing the mouse.

The play button's accessible name changes between “Play sonification” and “Pause sonification”. It does not use `aria-pressed`, so assistive technology does not announce a confusing “pressed” state on top of the changing name. The transport status (“Ready”, “Running”, “Paused”, “Complete”) is visible text.

## 3. Screen reader and speech behavior

There are two automatic announcement paths, and they are deliberately exclusive:

1. **Live region (default).** When “Announce every fourth step” is off, a visually hidden `aria-live="polite"` paragraph updates on samples 0, 4, 8, … with the plain-language reading. This lets a screen reader announce progress without a second voice.
2. **Browser speech (optional).** When the checkbox is on, the live region is removed and the same text is sent to `speechSynthesis`. This avoids hearing the same sentence twice.

“Read this aloud” always speaks the current sample and is independent of the automatic mode. It is disabled when the browser does not expose `speechSynthesis`.

Spoken text is generated from the same function as the visible description (`describeSample`). It always names longitude, latitude, month, temperature, speed, and bearing, and it says when a value is missing.

The speech is the browser's voice, not a recorded narration. Voice availability, language, and pronunciation vary by operating system. The text is the source of truth.

## 4. Missing data, land, and silence

A route can cross land or a gap in the source fields. In that case:

- The reading says “Missing” or explains that the transect crosses land or a gap.
- The temperature tone is silenced if SST is missing.
- The current pulse and flow texture are silenced if velocity is missing.
- The table shows an em dash.

Missing data is never converted to 0 °C, 0 m/s, or a default compass direction. This is both a scientific and an accessibility decision: a false value is worse than an honest silence.

## 5. Motion, color, and touch

- `prefers-reduced-motion: reduce` disables particle advection and draws static current vectors instead. The sonification still works.
- The map is decorative in the sense that no meaning depends on it, but its colors are accompanied by a text reading and an accessible name.
- Text and controls use the site's high-contrast palette. Focus is a visible cyan outline, not a color-only change.
- Mobile touch targets for play, stop, the position slider, volume, layer checkboxes, and the speak button are enlarged at narrow widths. The layout has no horizontal overflow at 390, 834, or 1440 CSS pixels.
- The interface uses one column at narrow widths; controls are not hidden behind hover-only menus.

## 6. Known limitations

- **Audio needs a gesture.** Browsers block autoplay. The instrument explains this and starts only after Play.
- **Stereo needs two channels.** A mono speaker collapses the east–west cue. The bearing is still in the reading.
- **Hearing differs.** The mapping stays within a limited pitch range and uses a compressor, but it is not a calibrated perceptual scale.
- **Speech synthesis is not guaranteed.** Some browsers expose the API with no voices; the button is disabled and the live region remains.
- **Screen reader + sonification mixing.** A screen reader may speak over the audio. Users can turn automatic speech off and use “Read this aloud” between phrases.
- **No formal conformance claim.** The app was checked with automated DOM assertions, keyboard traversal, and manual browser review. It has not been audited by a certified accessibility professional or tested with every screen reader/browser combination.

## 7. How this was checked

Manual and scripted checks performed for this build:

- One `<h1>`, one `<main>`, `lang="en"`, no duplicate IDs, no unnamed buttons/inputs/selects.
- Skip link moves focus to `#main`.
- Tab order reaches the region, month, play, stop, position, speed, layers, volume, speech, and table.
- The position slider moves exactly one sample per arrow key.
- One polite live region by default; zero duplicate live regions when browser speech is enabled.
- Speech synthesis receives the same sentence shown in the reading panel.
- Play creates one `AudioContext`, pause suspends it, resume restarts it, stop suspends it, and navigating away closes it.
- No console errors on desktop, tablet, or mobile.
- Loading, failed-request, and retry states are operable by keyboard.

## 8. Manual test script

1. Load `/` with a keyboard only. Press `Tab`, then `Enter` on “Skip to main content”.
2. Tab to Region and Month; change each and confirm the readings reset.
3. Tab to Play; press `Enter`. Confirm the status changes to Running and the step advances.
4. Press `Tab` to the position slider; press `ArrowRight` once. Confirm the step advances by exactly one and the reading changes.
5. Press Play/Pause. Confirm the status becomes Paused and the audio stops.
6. Toggle each sound layer; confirm the label remains checked/unchecked and no error appears.
7. Turn on “Announce every fourth step”; confirm the live region is removed and speech is attempted. Turn it off; confirm the live region returns.
8. Tab to the transect table and confirm the values match the reading panel.
9. Enable “Reduce motion” in the OS or browser and reload; confirm particles stop and static vectors remain.
10. Resize to 390 px and confirm no horizontal scrolling and that the transport, readings, and table remain operable.

If a step fails, include the browser, assistive technology, viewport, and the value shown in the reading panel in the report.
