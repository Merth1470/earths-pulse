import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { SignalPath } from "@/components/player/SignalPath";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Earth's Pulse turns ocean observations into sound, how the sampling and sonification pipeline works, what is real, and what remains a deliberate limitation.",
};

const contents = [
  { href: "#why-sound", label: "Why sound" },
  { href: "#pipeline", label: "From field to sound" },
  { href: "#how", label: "How to listen" },
  { href: "#scope", label: "What is real" },
  { href: "#access", label: "Access" },
  { href: "#credits", label: "Credits" },
];

export default function AboutPage() {
  return (
    <div className="shell page">
      <PageIntro
        aside={
          <>
            <span>Stage 02</span>
            <span>Ocean sonification</span>
            <span>Validated {NASA_SVS_RECORD.validatedOn}</span>
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
              The first subject is global ocean circulation and sea surface
              temperature. The interactive field is built from public OSCAR
              near-surface currents and NOAA OISST temperature, reduced to a
              documented twelve-month subset. NASA Scientific Visualization
              Studio record 3912 and its ECCO2 model remain the historical
              reference that inspired the experience, but they are not the
              numerical source for the sound.
            </p>
          </section>

          <section className="prose-section" id="why-sound">
            <h2>Why sound</h2>
            <div className="prose">
              <p>
                A global ocean visualization is extraordinarily dense. A sighted
                visitor can see swirling filaments, but a blind visitor receives
                nothing from the image. Even with sight, a still frame cannot
                tell you how fast a current moves or how warm the water is under
                a color.
              </p>
              <p>
                Sonification adds a second interpretive channel. Temperature can
                drive pitch, speed can drive rhythm, and direction can move
                across the stereo field. The listener hears structure that the
                eye has to infer, and the same values always produce the same
                sound.
              </p>
              <p>
                The mapping is part of the science interface, not a hidden
                aesthetic choice. It is printed in the rail, repeated in the
                documentation, and derived from published data ranges. If a cell
                is missing, the instrument is silent rather than inventing a
                value.
              </p>
            </div>
            <p className="principle">
              A sound is only meaningful if the mapping can be inspected.
            </p>
          </section>

          <section className="prose-section" id="pipeline">
            <h2>From field to sound</h2>
            <p className="prose">
              Acquisition, reduction, normalization, mapping, and synthesis stay
              separate. The browser receives a 1.75 MB subset, not a raw
              scientific archive. Each stage below is live in this build.
            </p>
            <SignalPath id="about-signal-path" level={3} />
            <div className="prose">
              <p>
                OSCAR provides the zonal and meridional velocity at 15 m depth
                components. NOAA OISST provides sea surface temperature. The
                fetch script selects one representative composite per month,
                resamples both onto a shared 1.5° grid, and leaves coastal or
                ice-covered gaps missing.
              </p>
              <p>
                The audio layer never sees a rendered pixel. It receives
                numerical samples in physical units, normalizes them with ranges
                computed from the bundled dataset, and maps them to a small Web
                Audio graph with a compressor.
              </p>
            </div>
          </section>

          <section className="prose-section" id="how">
            <h2>How to listen</h2>
            <div className="scope-columns">
              <div>
                <h3>A route, not a globe</h3>
                <ul className="marker-list">
                  <li>Choose a region; the route is a straight line at one latitude.</li>
                  <li>The instrument samples west to east, one step at a time.</li>
                  <li>The playhead and reading name the exact longitude.</li>
                  <li>Land or missing data produces a silent step, not a guess.</li>
                </ul>
              </div>
              <div>
                <h3>What changes the sound</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Warmer water raises pitch and opens the filter.</li>
                  <li>Faster flow pulses more quickly and strongly.</li>
                  <li>Eastward flow moves right; westward moves left.</li>
                  <li>Northward flow lifts the pulse by up to three semitones.</li>
                </ul>
              </div>
            </div>
            <p className="fine-print">
              Playback speed changes listening time only. It never changes the
              sampled values or the mapping.
            </p>
          </section>

          <section className="prose-section" id="scope">
            <h2>What is real, and what is not</h2>
            <div className="scope-columns">
              <div>
                <h3>Working now</h3>
                <ul className="marker-list">
                  <li>Twelve monthly OSCAR and OISST composites from 2012.</li>
                  <li>A shared 1.5° global grid with missing cells preserved.</li>
                  <li>A functional three-voice Web Audio sonification engine.</li>
                  <li>Region, month, speed, volume, seek, and layer controls.</li>
                  <li>Visible readings, a traceable table, and on-demand speech.</li>
                  <li>Keyboard operation, reduced motion, and nonvisual instructions.</li>
                </ul>
              </div>
              <div>
                <h3>Deliberately not claimed</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Live or current ocean conditions.</li>
                  <li>Numerical ECCO2 fields behind the 2012 NASA render.</li>
                  <li>Full-resolution or global daily coverage.</li>
                  <li>Direct measurement at every grid cell.</li>
                  <li>Subsurface circulation, uncertainty, or causal attribution.</li>
                  <li>AI-generated music or an unverified sonification.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="prose-section" id="access">
            <h2>Designed for access</h2>
            <div className="prose">
              <p>
                Visual-only science excludes people, and an audio layer that
                cannot be inspected excludes them differently. The Explore
                instrument exposes every value in text, supports complete
                keyboard operation, and offers browser speech for the current
                reading. Motion can be reduced without losing the field.
              </p>
              <p>
                The audio is never the only source of truth: the reading panel,
                traceable table, and current-value description carry the same
                information. A screen-reader user can explore the transect
                without hearing a single tone.
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
              not endorse it. The numerical field is built from public products
              by Earth &amp; Space Research and NOAA NCEI, accessed through NOAA
              CoastWatch ERDDAP.
            </p>
            <dl className="credits-list">
              <div>
                <dt>Currents</dt>
                <dd>
                  OSCAR near-surface (15 m) velocity, Earth &amp; Space Research. Bonjean
                  &amp; Lagerloef (2002).
                </dd>
              </div>
              <div>
                <dt>Temperature</dt>
                <dd>
                  NOAA OISST v2.1. Huang et al. (2021), NOAA National Centers for
                  Environmental Information.
                </dd>
              </div>
              <div>
                <dt>NASA reference</dt>
                <dd>
                  {NASA_SVS_RECORD.title}, NASA Scientific Visualization Studio
                  record {NASA_SVS_RECORD.id}.
                </dd>
              </div>
              <div>
                <dt>Visualization credit</dt>
                <dd>
                  Greg Shirah, Horace Mitchell, Eric Sokolowsky; producer{" "}
                  {NASA_SVS_RECORD.credits.producer}.
                </dd>
              </div>
              <div>
                <dt>Scientists</dt>
                <dd>Hong Zhang (UCLA), Dimitris Menemenlis (NASA/JPL CalTech)</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>
                  <a
                    className="text-link"
                    href={NASA_SVS_RECORD.pageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    NASA SVS record 3912
                  </a>
                </dd>
              </div>
            </dl>
            <p className="fine-print">
              Fonts: Inter and IBM Plex Mono, licensed under the SIL Open Font
              License. Coastline geometry: Natural Earth, public domain. NASA
              imagery is public domain unless NASA notes otherwise.
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
            <p className="aside-label">Current stage</p>
            <p>
              Ocean sonification is live on a verified 2012 subset. The field is
              historical; nothing is live or forecast.
            </p>
            <Link className="text-link" href="/data-sources">
              Read the data status
              <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
