import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { MAPPING_ROWS } from "@/lib/audio/mapping";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How to use Earth's Pulse without relying on the visual field: keyboard controls, spoken readings, text equivalents, reduced motion, and the limits of the sonification.",
};

const contents = [
  { href: "#nonvisual", label: "Nonvisual path" },
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
            <span>Stage 02</span>
            <span>Access guide</span>
            <span>Keyboard · speech · text</span>
          </>
        }
        lede="The ocean is not only a picture. This page explains how to explore the field with a keyboard, with sound, with speech, or with text alone — and where each path stops."
        title="Accessibility"
      />

      <div className="article-layout">
        <article className="article-body">
          <section className="prose-section">
            <p className="pull-line">
              No single sense is required to read the field.
            </p>
            <p className="prose">
              The Explore instrument carries the same information in three
              forms: a visual field, an audio encoding, and a text reading. The
              audio is an access path, not a replacement for the data. Every
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
                    <th scope="row">Region / month</th>
                    <td>Arrow keys on the select</td>
                    <td>Changes the field and resets playback.</td>
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
                A polite live region announces every fourth sample by default.
                Enabling “Announce every fourth step” switches to the browser
                speech voice and removes the live region, so the two paths do not
                duplicate. “Read this aloud” speaks the current sample on demand.
              </p>
              <p>
                A reading names longitude, latitude, sea surface temperature,
                current speed, and compass direction, and states when a value is
                missing. It does not describe the whole ocean or make a claim
                beyond the sample.
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
