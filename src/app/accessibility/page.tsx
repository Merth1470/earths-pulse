import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { AIR_MAPPING_ROWS } from "@/lib/air/mapping";
import { MAPPING_ROWS } from "@/lib/audio/mapping";
import { CARBON_MAPPING_ROWS } from "@/lib/carbon/mapping";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How to use all three Earth's Pulse experiences without relying on the visual field: keyboard controls, spoken readings, text equivalents, reduced motion, and the limits of sonification.",
};

const contents = [
  { href: "#nonvisual", label: "Nonvisual path" },
  { href: "#carbon", label: "Carbon path" },
  { href: "#air", label: "City path" },
  { href: "#keyboard", label: "Keyboard" },
  { href: "#sounds", label: "Sound meanings" },
  { href: "#speech", label: "Spoken readings" },
  { href: "#motion", label: "Motion" },
  { href: "#limits", label: "Limits" },
];

export default function AccessibilityPage() {
  return (
    <div className="shell page">
      <PageIntro
        aside={
          <>
            <span>Stage 03</span>
            <span>Access guide</span>
            <span>Keyboard · speech · text</span>
          </>
        }
        lede="The ocean, the carbon cycle, and a city's air are not only pictures. This page explains how to explore each instrument with a keyboard, with sound, with speech, or with text alone — and where each path stops."
        title="Accessibility"
      />

      <div className="article-layout">
        <article className="article-body">
          <section className="prose-section">
            <p className="pull-line">
              No single sense is required to read the field.
            </p>
            <p className="prose">
              Each instrument carries the same information in three forms: a
              visual field or diagram, an audio encoding, and a text reading.
              The audio is an access path, not a replacement for the data. Every
              sampled value is printed, and every current value can be read
              aloud on demand.
            </p>
          </section>

          <section className="prose-section" id="nonvisual">
            <h2>The nonvisual path</h2>
            <ol className="layer-list">
              <li>
                <span aria-hidden="true" className="layer-index">01</span>
                <div>
                  <div className="layer-heading">
                    <h3>Choose a region and month</h3>
                  </div>
                  <p>
                    The Region and Month selects are standard form controls. They
                    set the listening transect and the monthly composite. Each
                    change resets playback so the new field is not confused with
                    the old one.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">02</span>
                <div>
                  <div className="layer-heading">
                    <h3>Start the transport</h3>
                  </div>
                  <p>
                    Activate Play once. The browser requires a user gesture
                    before audio can start. The transport announces Running,
                    Paused, Complete, or Ready in text, and Stop returns to the
                    first sample.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">03</span>
                <div>
                  <div className="layer-heading">
                    <h3>Read the current value</h3>
                  </div>
                  <p>
                    The Current reading panel lists sea surface temperature,
                    current speed, compass direction, longitude, latitude, and
                    step number. The value updates as the playhead moves. It
                    never depends on seeing the map.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">04</span>
                <div>
                  <div className="layer-heading">
                    <h3>Inspect the trace</h3>
                  </div>
                  <p>
                    The traceable transect table lists every fourth step with its
                    longitude, temperature, speed, and direction. The full
                    transect has 48 steps. Missing source cells are reported as
                    missing, not as zero.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="prose-section" id="carbon">
            <h2>The carbon path</h2>
            <div className="prose">
              <p>
                The carbon instrument is a single annual sequence from 1959 to
                2024. The Year select and the Carbon year slider reach the same
                66 records; each step changes all five voices together.
              </p>
              <ul className="marker-list">
                <li>
                  Choose a year, or press Play to run the annual sequence. The
                  reading panel prints the CO₂ concentration, total emissions,
                  and ocean sink for that year.
                </li>
                <li>
                  The six flow buttons in the reading panel select a definition:
                  atmosphere, fossil emissions, land-use emissions, ocean sink,
                  land sink, and budget residual. Each button names the value and
                  explains what it is, and is not.
                </li>
                <li>
                  The visual reservoir diagram is conceptual, not a map. On a
                  narrow screen it scrolls horizontally; the same values remain in
                  the reading panel and its flow detail.
                </li>
                <li>
                  Layer switches mute the atmosphere, emissions, ocean, land, or
                  balance voice. Muting changes sound only; the value stays in
                  the reading.
                </li>
                <li>
                  “Speak each year” reads every fifth annual step through browser
                  speech. The live region is removed while speech is on, so the
                  same value is not announced twice.
                </li>
              </ul>
            </div>
          </section>

          <section className="prose-section" id="air">
            <h2>The city path</h2>
            <div className="prose">
              <p>
                The city instrument is a set of eight ground monitors at hourly
                resolution. The map is a control, not the measurement: every city
                is also available from a standard select.
              </p>
              <ul className="marker-list">
                <li>
                  Choose a City, a Highlight pollutant, a Day, and an Hour. The
                  reading panel prints the monitor, UTC timestamp, all three
                  pollutant values, units, site identifier, and POC.
                </li>
                <li>
                  The Day select jumps to a date; the Hour slider moves one hour
                  at a time and reports its value text as a time and date.
                </li>
                <li>
                  Activate Play to hear the selected day hour by hour. Pause,
                  resume, stop, seek, speed, and volume behave like the ocean
                  transport.
                </li>
                <li>
                  Each pollutant layer can be muted independently. A missing hour
                  stays silent and is named; it is never read as zero.
                </li>
                <li>
                  “Speak each hour” reads every fourth hour through browser
                  speech. The live region is removed while speech is on.
                </li>
                <li>
                  The comparison section shows two monitors at the same UTC hour.
                  It is not a ranking; each value keeps its own unit and missing
                  values are not ranked.
                </li>
              </ul>
            </div>
          </section>

          <section className="prose-section" id="keyboard">
            <h2>Keyboard operation</h2>
            <div className="table-wrap" role="region" aria-label="Keyboard controls" tabIndex={0}>
              <table className="record-table">
                <caption className="sr-only">
                  Keyboard controls for the Explore instrument.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Keys</th>
                    <th scope="col">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Skip link</th>
                    <td>Tab (first press)</td>
                    <td>Moves focus to the main content.</td>
                  </tr>
                  <tr>
                    <th scope="row">Play / pause</th>
                    <td>Enter or Space</td>
                    <td>Starts or pauses the sonification.</td>
                  </tr>
                  <tr>
                    <th scope="row">Seek</th>
                    <td>Arrow keys, Home, End</td>
                    <td>Moves along the transect; the reading updates.</td>
                  </tr>
                  <tr>
                    <th scope="row">Ocean / carbon / city selects</th>
                    <td>Arrow keys on the select</td>
                    <td>Changes the sample set and resets or seeks playback.</td>
                  </tr>
                  <tr>
                    <th scope="row">Layers, speech, volume</th>
                    <td>Space, arrow keys</td>
                    <td>Toggles layers, spoken readings, and volume.</td>
                  </tr>
                  <tr>
                    <th scope="row">Trace table</th>
                    <td>Enter on the summary</td>
                    <td>Expands the tabular readings.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="fine-print">
              Focus indicators are visible on every control. The visual field is
              not focusable; all controls and readings sit outside the canvas.
            </p>
          </section>

          <section className="prose-section" id="sounds">
            <h2>What each sound means</h2>
            <dl className="encoding-rows">
              {MAPPING_ROWS.map((row) => (
                <div className="encoding-row" key={row.variable}>
                  <dt>
                    <span>{row.variable}</span>
                    <span className="encoding-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="encoding-sound">{row.sound}</span>
                  </dt>
                  <dd>{row.explanation}</dd>
                </div>
              ))}
            </dl>
            <h3>The carbon voices</h3>
            <dl className="encoding-rows">
              {CARBON_MAPPING_ROWS.map((row) => (
                <div className="encoding-row" key={row.variable}>
                  <dt>
                    <span>{row.variable}</span>
                    <span className="encoding-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="encoding-sound">{row.sound}</span>
                  </dt>
                  <dd>{row.explanation}</dd>
                </div>
              ))}
            </dl>
            <h3>The city voices</h3>
            <dl className="encoding-rows">
              {AIR_MAPPING_ROWS.map((row) => (
                <div className="encoding-row" key={row.variable}>
                  <dt>
                    <span>{row.variable}</span>
                    <span className="encoding-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="encoding-sound">{row.sound}</span>
                  </dt>
                  <dd>{row.explanation}</dd>
                </div>
              ))}
            </dl>
            <p className="fine-print">
              The temperature voice is a continuous tone, not a scale. Warm
              water raises it across two octaves. The pulse is a repeating
              amplitude envelope whose rate follows current speed. The flow
              texture is filtered noise; it is quiet by design and can be turned
              off.
            </p>
          </section>

          <section className="prose-section" id="speech">
            <h2>Spoken readings</h2>
            <div className="prose">
              <p>
                Each instrument has its own interval: every fourth ocean sample,
                every fifth carbon year, and every fourth city hour. The live
                region is polite by default; enabling the speech checkbox
                switches to the browser speech voice and removes the live region,
                so the two paths do not duplicate. The read-aloud button speaks
                the current value on demand.
              </p>
              <p>
                A reading names the sample, its place or period, its values and
                units, and states when a value is missing. It does not describe
                the whole system or make a claim beyond that sample.
              </p>
            </div>
          </section>

          <section className="prose-section" id="motion">
            <h2>Motion</h2>
            <p className="prose">
              When the operating system requests reduced motion, the field draws
              a static vector sample instead of advecting particles. Playback,
              seeking, and the reading still work. Nothing essential is conveyed
              by animation alone; the color raster, reading, and table remain.
            </p>
          </section>

          <section className="prose-section" id="limits">
            <h2>Limits of this access path</h2>
            <div className="scope-columns">
              <div>
                <h3>What works</h3>
                <ul className="marker-list">
                  <li>Complete keyboard operation of the instrument.</li>
                  <li>Text readings and a traceable table for every sample.</li>
                  <li>On-demand and automatic browser speech.</li>
                  <li>Reduced motion without loss of data.</li>
                  <li>Text labels beside every status color and visible focus rings.</li>
                </ul>
              </div>
              <div>
                <h3>What remains limited</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Audio still requires one user interaction to start.</li>
                  <li>Speech voices differ by browser and operating system.</li>
                  <li>Sonification cannot convey full spatial structure.</li>
                  <li>Headphones are recommended for stereo direction.</li>
                  <li>“Every fourth step” is a summary, not every sample.</li>
                </ul>
              </div>
            </div>
            <p className="license-links">
              <Link className="text-link" href="/">
                Open the Explore instrument
                <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
              </Link>
              <Link className="text-link" href="/data-sources">
                Data provenance
              </Link>
            </p>
          </section>
        </article>

        <aside className="article-aside">
          <nav aria-label="On this page" className="article-toc">
            <p className="aside-label">On this page</p>
            {contents.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="aside-note">
            <p className="aside-label">Audio first</p>
            <p>
              The field is fully usable without the canvas. Start with the
              transport, then read the current sample.
            </p>
            <Link className="text-link" href="/">
              Go to Explore
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
