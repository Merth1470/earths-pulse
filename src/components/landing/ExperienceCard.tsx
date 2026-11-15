import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  ExperienceVisual,
  type ExperienceVisualProps,
} from "./ExperienceVisuals";

interface ExperienceCardProps {
  index: string;
  title: string;
  subtitle: string;
  description: string;
  hears: string[];
  facts: Array<{ label: string; value: string }>;
  href: string;
  visual: ExperienceVisualProps["kind"];
  accent: "ocean" | "carbon" | "air";
}

export function ExperienceCard({
  index,
  title,
  subtitle,
  description,
  hears,
  facts,
  href,
  visual,
  accent,
}: ExperienceCardProps) {
  return (
    <Link
      aria-label={`${title}: ${subtitle}. Open the experience.`}
      className={`experience-card experience-card--${accent}`}
      href={href}
    >
      <div className="experience-card-visual">
        <ExperienceVisual kind={visual} />
        <span className="experience-card-index">{index}</span>
      </div>
      <div className="experience-card-body">
        <p className="experience-card-kicker">{title}</p>
        <h2>{subtitle}</h2>
        <p className="experience-card-description">{description}</p>
        <div className="experience-card-hears">
          <p className="aside-label">What you will hear</p>
          <ul>
            {hears.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <dl className="experience-card-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <span className="experience-card-cta">
          Enter experience
          <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
        </span>
      </div>
    </Link>
  );
}
