import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: "About the science",
  description:
    "The three Earth's Pulse experiences, the shared evidence contract, how public measurements become sound, and the limits that remain visible in every instrument.",
};

const contents = [
  { href: "#why-sound", label: "Why sound" },
  { href: "#experiences", label: "Three experiences" },
  { href: "#pipeline", label: "From data to sound" },
  { href: "#scope", label: "What is real" },
  { href: "#access", label: "Access" },
  { href: "#credits", label: "Credits" },
];

const EXPERIENCES = [
  {
    number: "01",
    title: "The ocean",
    question: "How do temperature and current change across a route?",
    data: "OSCAR near-surface currents and NOAA OISST, 2012.",
    sound:
      "Temperature becomes pitch, current speed becomes pulse, and east–west flow becomes stereo position.",
    limit:
      "Twelve monthly composites on a 1.5° grid, not a live ocean or a direct measurement at every cell.",
  },
  {
    number: "02",
    title: "The carbon cycle",
    question: "How do concentration, emissions, sinks, and the residual differ?",
    data: "NOAA GML Mauna Loa annual CO₂ and Global Carbon Budget 2025.",
    sound:
      "Five voices separate the atmosphere, emissions, ocean sink, land sink, and accounting residual.",
    limit:
      "Global annual values with model-based sinks, not a map, a national inventory, or a stock estimate.",
  },
  {
    number: "03",
    title: "A city's air",
    question: "How does one monitor's pollution change by hour and place?",
    data: "US EPA AirData 2023 hourly PM2.5, NO₂, and ozone at eight monitors.",
    sound:
      "Each pollutant has its own voice; longitude moves the city across the stereo field.",
    limit:
      "One ground monitor per city, not a city-wide average, a satellite column, or live air quality.",
  },
];

export default function AboutPage() {
  return (
    <div className="shell page">
      <PageIntro
        aside={
          <>
            <span>Stage 03</span>
            <span>Three experiences</span>
            <span>Validated 14 Nov 2026</span>
          </>
        }
        lede="Earth's Pulse is an independent NASA Space Apps Challenge project exploring how scientifically grounded sonification can make Earth observation legible beyond the visual channel."
        title="About Earth’s Pulse"
      />

      <div className="article-layout">
        <article className="article-body">
          <section className="prose-section">
            <p className="pull-line">Listen to what you cannot see.</p>
            <p className="prose">
              The platform contains three instruments with different scientific
              questions: the ocean, the global carbon cycle, and the air above a
              city. They share a design language and an evidence contract, not a
              single dataset. Each instrument names its period, resolution,
              units, source, and limits beside the values it sonifies.
            </p>
          </section>

          <section className="prose-section" id="why-sound">
            <h2>Why sound</h2>
            <div className="prose">
              <p>
                A global visualization is extraordinarily dense. A sighted
                visitor can see swirling filaments or a color field, but a blind
                visitor receives nothing from the image. Even with sight, a
                still frame cannot tell you how fast a current moves, how a
                carbon flux differs from a concentration, or how one monitor
                changes hour by hour.
              </p>
              <p>
                Sonification adds a second interpretive channel. The listener
                hears structure that the eye has to infer, and the same values
                always produce the same sound. The mapping is part of the
                science interface, not a hidden aesthetic choice: it is printed
                in the instrument, repeated in the documentation, and derived
                from published data ranges.
              </p>
              <p>
                Missing data is never turned into a musical zero. A land cell, a
                winter ozone gap, or an absent concentration-change value stays
                silent and is named in text.
              </p>
            </div>
            <p className="principle">
              A sound is only meaningful if the mapping can be inspected.
            </p>
          </section>

          <section className="prose-section" id="experiences">
            <h2>Three experiences, three questions</h2>
            <div className="prose">
              <p>
                The experiences are deliberately different. Their data products,
                periods, and resolutions do not line up, and the interface does
                not pretend that they do.
              </p>
            </div>
            <div className="about-experience-list">
              {EXPERIENCES.map((experience) => (
                <article className="about-experience" key={experience.number}>
                  <p className="aside-label">Experience {experience.number}</p>
                  <h3>{experience.title}</h3>
                  <p className="about-experience-question">{experience.question}</p>
                  <dl>
                    <div>
                      <dt>Data</dt>
                      <dd>{experience.data}</dd>
                    </div>
                    <div>
                      <dt>Sound</dt>
                      <dd>{experience.sound}</dd>
                    </div>
                    <div>
                      <dt>Limit</dt>
                      <dd>{experience.limit}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <p className="license-links">
              <Link className="text-link" href="/">
                Choose an experience
                <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
              </Link>
            </p>
          </section>

          <section className="prose-section" id="pipeline">
            <h2>From data to sound</h2>
            <p className="prose">
              Acquisition, reduction, normalization, mapping, and synthesis stay
              separate. The browser receives three small bundled products, not
              raw scientific archives. No NASA or NOAA server is called at
              runtime.
            </p>
            <ol className="layer-list">
              <li>
                <span aria-hidden="true" className="layer-index">01</span>
                <div>
                  <div className="layer-heading">
                    <h3>Source and subset</h3>
                  </div>
                  <p>
                    A reproducible script selects the documented period,
                    intersects the records that actually overlap, and writes a
                    compact binary or JSON bundle with a provenance sidecar.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">02</span>
                <div>
                  <div className="layer-heading">
                    <h3>Validate and preserve gaps</h3>
                  </div>
                  <p>
                    Counts, ranges, units, and identities are checked before the
                    bundle is accepted. Missing hours and cells are stored as
                    missing, never filled from an average or a neighbour.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">03</span>
                <div>
                  <div className="layer-heading">
                    <h3>Sample in physical units</h3>
                  </div>
                  <p>
                    The audio engine receives numbers in °C, m/s, ppm, GtC/yr,
                    µg/m³, ppb, and ppm. It never receives rendered pixels or an
                    image-derived color.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">04</span>
                <div>
                  <div className="layer-heading">
                    <h3>Map and synthesize</h3>
                  </div>
                  <p>
                    A deterministic mapping turns each variable into a bounded
                    audio parameter. Each experience has its own Web Audio graph,
                    compressor, and independent layer switches.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">05</span>
                <div>
                  <div className="layer-heading">
                    <h3>Carry the same values in text</h3>
                  </div>
                  <p>
                    The reading panel, table, live region, and browser speech
                    report the original value and unit. The audio is an
                    additional channel, not the only record.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="prose-section" id="scope">
            <h2>What is real, and what is not</h2>
            <div className="scope-columns">
              <div>
                <h3>Working now</h3>
                <ul className="marker-list">
                  <li>Twelve monthly OSCAR and OISST composites from 2012.</li>
                  <li>Sixty-six annual carbon-budget records from 1959–2024.</li>
                  <li>8,760 hourly records from eight EPA ground monitors in 2023.</li>
                  <li>Three functional Web Audio engines with independent layers.</li>
                  <li>Keyboard operation, visible readings, speech, and reduced motion.</li>
                  <li>Source links, verification scripts, and documented limits.</li>
                </ul>
              </div>
              <div>
                <h3>Deliberately not claimed</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Live, forecast, or real-time conditions.</li>
                  <li>Numerical ECCO2 fields behind the 2012 NASA render.</li>
                  <li>City-wide pollution averages from one monitor.</li>
                  <li>Carbon stocks, national inventories, or causal attribution.</li>
                  <li>Direct measurement at every grid cell or every hour.</li>
                  <li>Health effects, source apportionment, or compliance findings.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="prose-section" id="access">
            <h2>Designed for access</h2>
            <div className="prose">
              <p>
                Visual-only science excludes people, and an audio layer that
                cannot be inspected excludes them differently. Every instrument
                exposes its values in text, supports complete keyboard operation,
                and offers browser speech for the current reading. Motion can be
                reduced without losing the field.
              </p>
              <p>
                The audio is never the only source of truth. A screen-reader
                user can explore a transect, a carbon year, or a city hour
                without hearing a single tone. Each experience also provides a
                nonvisual path beside its transport.
              </p>
            </div>
            <p className="license-links">
              <Link className="text-link" href="/accessibility">
                Read the accessibility guide
                <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
              </Link>
            </p>
          </section>

          <section className="prose-section" id="credits">
            <h2>Credits and independence</h2>
            <p className="prose">
              Earth&apos;s Pulse is an independent challenge project. NASA does
              not endorse it. The numerical products come from public scientific
              agencies and projects; the sonification, interface, and errors are
              the project&apos;s own.
            </p>
            <dl className="credits-list">
              <div>
                <dt>Ocean currents</dt>
                <dd>
                  OSCAR near-surface (15 m) velocity, Earth &amp; Space Research.
                  Bonjean &amp; Lagerloef (2002).
                </dd>
              </div>
              <div>
                <dt>Ocean temperature</dt>
                <dd>
                  NOAA OISST v2.1. Huang et al. (2021), NOAA National Centers for
                  Environmental Information.
                </dd>
              </div>
              <div>
                <dt>Carbon concentration</dt>
                <dd>
                  NOAA Global Monitoring Laboratory, Mauna Loa annual mean CO₂.
                </dd>
              </div>
              <div>
                <dt>Carbon budget</dt>
                <dd>
                  Global Carbon Project, Global Carbon Budget 2025. DOI
                  10.18160/gcp-2025.
                </dd>
              </div>
              <div>
                <dt>Air quality</dt>
                <dd>
                  US Environmental Protection Agency, AirData / Air Quality
                  System hourly files, 2023.
                </dd>
              </div>
              <div>
                <dt>Geography</dt>
                <dd>Natural Earth 110m land, public domain.</dd>
              </div>
              <div>
                <dt>NASA reference</dt>
                <dd>
                  {NASA_SVS_RECORD.title}, NASA Scientific Visualization Studio
                  record {NASA_SVS_RECORD.id}; reference only.
                </dd>
              </div>
            </dl>
            <p className="fine-print">
              The NASA ECCO2 render and the OSCAR/OISST fields are different
              products from different periods. The render inspires the ocean
              experience; it is not its numerical source.
            </p>
          </section>
        </article>

        <aside className="article-aside">
          <p className="aside-label">On this page</p>
          <nav aria-label="About page contents" className="article-toc">
            {contents.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
