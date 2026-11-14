import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { SignalPath } from "@/components/player/SignalPath";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Earth's Pulse turns NASA Earth observations into sound, how the sonification pipeline is structured, and what Stage 1 does and does not implement.",
};

const contents = [
  { href: "#why-sound", label: "Why sound" },
  { href: "#pipeline", label: "From field to sound" },
  { href: "#stage", label: "Stage 1 scope" },
  { href: "#access", label: "Access" },
  { href: "#credits", label: "Credits" },
];

export default function AboutPage() {
  return (
    <div className="shell page">
      <PageIntro
        aside={
          <>
            <span>Stage 01</span>
            <span>Visual foundation</span>
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
              temperature, seen through NASA Scientific Visualization Studio
              record 3912 and the ECCO2 ocean model behind it. The long-term
              subject is larger: a platform where any verified Earth variable
              can be explored through sound without losing the provenance that
              makes it science.
            </p>
          </section>

          <section className="prose-section" id="why-sound">
            <h2>Why sound</h2>
            <div className="prose">
              <p>
                NASA&apos;s ocean visualization is extraordinarily dense. A
                sighted visitor can see swirling filaments, but a blind visitor
                receives nothing from it. Even with sight, a still image cannot
                tell you the velocity of a current or the temperature under a
                color. The visual carries pattern; it does not carry the numbers.
              </p>
              <p>
                Sonification adds a second interpretive channel. A verified
                variable can drive pitch, timbre, amplitude, or stereo position,
                letting a listener hear structure that the eye has to infer. That
                is an interpretation of data, not a replacement for it, and not
                background music.
              </p>
              <p>
                The mapping is therefore part of the science interface. Every
                range will come from dataset metadata. Every parameter choice
                will be named. If a field is unavailable, the interface says so
                instead of producing a plausible sound.
              </p>
            </div>
            <p className="principle">
              A sound is only meaningful if the mapping can be inspected.
            </p>
          </section>

          <section className="prose-section" id="pipeline">
            <h2>From field to sound</h2>
            <p className="prose">
              The application separates acquisition, scientific processing,
              visualization, and audio synthesis. Stage 1 implements the
              contracts between them and stops honestly at the first missing
              input: the numerical ECCO2 field.
            </p>
            <SignalPath id="about-signal-path" level={3} />
          </section>

          <section className="prose-section" id="stage">
            <h2>What Stage 1 is</h2>
            <div className="scope-columns">
              <div>
                <h3>Working now</h3>
                <ul className="marker-list">
                  <li>A verified 2048 × 1024 NASA SVS still and its source record.</li>
                  <li>Period, model, credits, and data limitations stated in the interface.</li>
                  <li>Typed scientific, NASA, and audio boundaries with no fabricated values.</li>
                  <li>Keyboard-operable navigation and controls that expose their disabled state.</li>
                  <li>Responsive Explore, About, and Data Sources routes.</li>
                </ul>
              </div>
              <div>
                <h3>Not yet connected</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Numerical ECCO2 surface fields.</li>
                  <li>Verified normalization ranges and sonification mappings.</li>
                  <li>Web Audio synthesis and playback.</li>
                  <li>Timeline synchronization and geographic region selection.</li>
                  <li>Any claim that the rendered plate is live or measurable.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="prose-section" id="access">
            <h2>Designed for access</h2>
            <div className="prose">
              <p>
                Visual-only science excludes people, and an audio layer that
                cannot be inspected excludes them differently. Stage 1 is
                keyboard-operable, screen-reader legible, and built without
                color-only status. Motion respects reduced-motion preferences.
                Future audio must ship with equivalent textual state, never sound
                alone.
              </p>
            </div>
          </section>

          <section className="prose-section" id="credits">
            <h2>Credits and independence</h2>
            <p className="prose">
              The visualization is NASA&apos;s work. Earth&apos;s Pulse is an
              independent challenge project built on top of it; NASA does not
              endorse it.
            </p>
            <dl className="credits-list">
              <div>
                <dt>Visualization</dt>
                <dd>Greg Shirah, NASA/GSFC</dd>
              </div>
              <div>
                <dt>Animation</dt>
                <dd>Greg Shirah, Horace Mitchell, Eric Sokolowsky</dd>
              </div>
              <div>
                <dt>Producer</dt>
                <dd>{NASA_SVS_RECORD.credits.producer}</dd>
              </div>
              <div>
                <dt>Scientists</dt>
                <dd>Hong Zhang (UCLA), Dimitris Menemenlis (NASA/JPL CalTech)</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>ECCO2, using the MIT general circulation model (MITgcm)</dd>
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
              License. Imagery is public domain unless NASA notes otherwise.
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
              Visual foundation only. The sonification engine and numerical
              fields are not connected.
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
