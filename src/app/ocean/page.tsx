import type { Metadata } from "next";

import { OceanInstrument } from "@/components/explore/ocean/OceanInstrument";
import { VisualizationPlate } from "@/components/visualization/VisualizationPlate";
import { MAPPING_ROWS } from "@/lib/audio/mapping";
import { TRANSECTS } from "@/lib/ocean/regions";

export const metadata: Metadata = {
  title: { absolute: "Ocean — Earth's Pulse" },
  description:
    "Earth's Pulse ocean experience: real 2012 OSCAR near-surface currents and NOAA OISST temperature, translated into an accessible sonified transect.",
};

export default function ExplorePage() {
  return (
    <div className="shell explore">
      <header className="explore-head pulse-head">
        <div className="explore-head-main">
          <h1>Listen to what you cannot see.</h1>
          <p className="explore-lede">
            A sonified atlas of the ocean. Real near-surface currents and sea surface
            temperature, sampled along a transect you can hear. Temperature
            becomes pitch, current speed becomes rhythm, and east–west flow
            moves across the stereo field.
          </p>
          <p className="explore-status">
            <span aria-hidden="true" className="status-dot status-dot--available" />
            Historical fields · 2012 · Not live
          </p>
          <p className="listen-cue">
            Press play, then follow the cyan band. Warm water sounds higher;
            faster water pulses faster; eastward flow moves right.
          </p>
        </div>

        <dl className="explore-facts" aria-label="Dataset facts">
          <div>
            <dt>Field</dt>
            <dd>Currents + SST</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>OSCAR · OISST</dd>
          </div>
          <div>
            <dt>Engine</dt>
            <dd>Web Audio</dd>
          </div>
        </dl>
      </header>

      <OceanInstrument />

      <section aria-labelledby="encoding-title" className="pulse-section encoding-section">
        <div className="section-intro">
          <h2 id="encoding-title">The encoding is the argument</h2>
          <p>
            Every sound is derived from a measured or modeled value. Nothing is
            generated as music and then matched to the data. The mapping is
            fixed, inspectable, and reproducible.
          </p>
        </div>
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
      </section>

      <section aria-labelledby="field-title" className="pulse-section field-section">
        <div className="section-intro">
          <h2 id="field-title">What the field is, and is not</h2>
          <p>
            The interactive field is a reduced, documented subset of two public
            ocean products. It is not the NASA visualization, and its colors are
            computed from numbers rather than sampled from a video frame.
          </p>
        </div>

        <div className="field-notes">
          <div className="field-note">
            <h3>Currents</h3>
            <p>
              OSCAR near-surface velocities (15 m) from Earth &amp; Space Research, a
              NASA-funded satellite-derived analysis. The product combines
              geostrophic, Ekman, and buoyancy components at 15 m depth; it is
              not a direct current meter at every point.
            </p>
          </div>
          <div className="field-note">
            <h3>Temperature</h3>
            <p>
              NOAA OISST v2.1 daily sea surface temperature, a blended satellite
              and in-situ analysis. The browser receives one representative
              composite per month in 2012, resampled to 1.5°.
            </p>
          </div>
          <div className="field-note">
            <h3>Missing values</h3>
            <p>
              Land, ice, and gaps in the source fields stay missing. They are
              never filled with zero or interpolated across a coastline. A
              silent step can therefore mean land or absent data, and the
              reading states which values are missing.
            </p>
          </div>
          <div className="field-note">
            <h3>What this is not</h3>
            <p>
              Not live, not a forecast, and not ECCO2. NASA&apos;s 2007–2008
              ECCO2 render remains a separate reference. The numerical ECCO2
              fields behind it were not reachable from this build environment,
              so an authoritative public alternative was used and labeled.
            </p>
          </div>
        </div>

        <div className="transect-index">
          <h3>Available transects</h3>
          <dl>
            {TRANSECTS.map((transect) => (
              <div key={transect.id}>
                <dt>{transect.label}</dt>
                <dd>
                  {transect.description} <span>{transect.whyItMatters}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <details className="nasa-reference">
        <summary>
          <span>NASA reference render</span>
          <span>SVS 3912 · 2007–2008 ECCO2</span>
        </summary>
        <p>
          The visualization that inspired this project. It is shown as
          evidence and context, not as the numerical source for the
          sonification. The bundled still is a single rendered frame from 19
          June 2007, not a data product.
        </p>
        <VisualizationPlate />
      </details>

      <p className="explore-endnote">
        The dataset period ends in December 2012. Nothing on this screen is a
        live ocean observation. Values are traceable to the published OSCAR and
        OISST products through the data record.
      </p>
    </div>
  );
}
