import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import { ExperienceCard } from "@/components/landing/ExperienceCard";

export const metadata: Metadata = {
  title: { absolute: "Earth's Pulse — three scientific instruments" },
  description:
    "Three ways to hear the planet: ocean circulation, the global carbon cycle, and atmospheric pollution. Real public data, explicit sonification, and a nonvisual path through every experience.",
};

const EXPERIENCES = [
  {
    index: "01",
    title: "Earth’s Pulse",
    subtitle: "An Auditory Ocean Simulator",
    description:
      "Hear the movement of the ocean through a transect of temperature and current. Warm water becomes pitch, faster water becomes pulse, and east–west flow moves across the stereo field.",
    hears: [
      "Temperature as pitch and brightness",
      "Current speed as rhythmic pulse",
      "Direction as stereo position",
    ],
    facts: [
      { label: "Period", value: "2012" },
      { label: "Fields", value: "OSCAR + OISST" },
      { label: "Routes", value: "4 transects" },
    ],
    href: "/ocean",
    visual: "ocean" as const,
    accent: "ocean" as const,
  },
  {
    index: "02",
    title: "The Invisible Breath",
    subtitle: "Earth’s Carbon Cycle",
    description:
      "Hear the movement of carbon between the atmosphere, the ocean, land, and fossil stores. Five voices keep concentration, emissions, two sinks, and the accounting residual distinct.",
    hears: [
      "CO₂ concentration as a harmonic drone",
      "Fossil and land-use emissions as separate pulses",
      "Ocean and land sinks as tides and bands",
    ],
    facts: [
      { label: "Period", value: "1959–2024" },
      { label: "Budget", value: "NOAA + GCB" },
      { label: "Voices", value: "5 layers" },
    ],
    href: "/carbon",
    visual: "carbon" as const,
    accent: "carbon" as const,
  },
  {
    index: "03",
    title: "The Sound of a City",
    subtitle: "Atmospheric Pollution",
    description:
      "Select a place, choose an hour, and hear how ground-level pollution differs across cities. The map is the control; the measurements come from named monitors, not a rendered surface.",
    hears: [
      "PM2.5 as a low filtered haze",
      "NO₂ as a reedy pulse",
      "Ozone as a bright high band",
    ],
    facts: [
      { label: "Period", value: "2023 · hourly" },
      { label: "Source", value: "EPA AQS" },
      { label: "Cities", value: "8 US monitors" },
    ],
    href: "/air-quality",
    visual: "air" as const,
    accent: "air" as const,
  },
];

const PRINCIPLES = [
  {
    kicker: "Values first",
    title: "No pixel becomes a measurement.",
    body: "The field, the diagram, and the map are renderings of numbers that were fetched, validated, and bundled with source records. The audio receives the same values as the text.",
  },
  {
    kicker: "Missing stays missing",
    title: "A gap is not a zero.",
    body: "Land, ice, seasonal monitors, and absent hours stay silent and are named. Nothing is filled across a coastline, a city, or a missing timestamp.",
  },
  {
    kicker: "Three access paths",
    title: "Sound is never the only way in.",
    body: "Every experience has readable values, keyboard controls, a nonvisual exploration path, and browser speech. The audio is an additional channel, not a replacement for the data.",
  },
];

export default function HomePage() {
  return (
    <div className="shell landing">
      <header className="landing-hero">
        <div className="landing-hero-copy">
          <h1>Listen to what you cannot see.</h1>
          <p className="landing-lede">
            The ocean, the carbon cycle, and the air above a city are too large
            to see whole and too important to leave to a single sense. These
            three instruments turn public scientific measurements into sound,
            with a readable value for every tone.
          </p>
          <p className="landing-status">
            <span aria-hidden="true" className="status-dot status-dot--available" />
            Historical data · explicit mappings · no live feeds
          </p>
          <div className="landing-actions">
            <a className="button-primary" href="#experiences">
              Choose an experience
              <ArrowDown aria-hidden="true" size={13} strokeWidth={1.7} />
            </a>
            <Link className="text-link" href="/about">
              Read the method
              <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
        <dl className="landing-facts" aria-label="Platform facts">
          <div>
            <dt>Experiences</dt>
            <dd>03</dd>
          </div>
          <div>
            <dt>Scientific sources</dt>
            <dd>05</dd>
          </div>
          <div>
            <dt>Data mode</dt>
            <dd>Historical</dd>
          </div>
          <div>
            <dt>Access paths</dt>
            <dd>Visual · audio · text</dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="experiences-title" className="landing-experiences" id="experiences">
        <div className="section-intro landing-section-intro">
          <h2 id="experiences-title">Three ways into the same planet</h2>
          <p>
            Each experience has its own scientific question, data product, and
            visual language. They share one product identity and one rule: the
            sound must be traceable to a value.
          </p>
        </div>

        <div className="experience-grid">
          {EXPERIENCES.map((experience) => (
            <ExperienceCard key={experience.href} {...experience} />
          ))}
        </div>
      </section>

      <section aria-labelledby="principles-title" className="landing-principles">
        <div className="section-intro">
          <h2 id="principles-title">One contract across three instruments</h2>
          <p>
            The experiences are different on purpose. Their scientific honesty
            is not optional.
          </p>
        </div>
        <div className="principle-grid">
          {PRINCIPLES.map((principle) => (
            <article className="principle-card" key={principle.kicker}>
              <p className="aside-label">{principle.kicker}</p>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sources-title" className="landing-sources">
        <div>
          <h2 id="sources-title">Real records, kept in view.</h2>
          <p>
            OSCAR near-surface currents and NOAA OISST; NOAA Mauna Loa CO₂ and
            the Global Carbon Budget 2025; US EPA AirData ground monitors. Each
            experience has its own period, resolution, units, and limits.
          </p>
        </div>
        <div className="landing-source-actions">
          <Link className="button-secondary" href="/data-sources">
            Inspect data sources
          </Link>
          <Link className="text-link" href="/accessibility">
            Nonvisual guide
            <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
          </Link>
        </div>
      </section>
    </div>
  );
}
