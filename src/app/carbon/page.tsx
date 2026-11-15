import type { Metadata } from "next";

import { CarbonInstrument } from "@/components/carbon/CarbonInstrument";

export const metadata: Metadata = {
  title: "The Invisible Breath — carbon cycle",
  description:
    "Hear the global carbon cycle: NOAA Mauna Loa CO₂ concentration and the Global Carbon Budget 2025 emissions, ocean and land sinks, and accounting residual, as five independent sonification layers.",
};

export default function CarbonPage() {
  return (
    <div className="shell explore carbon-page">
      <header className="explore-head pulse-head">
        <div className="explore-head-main">
          <h1>The Invisible Breath</h1>
          <p className="explore-lede">
            Carbon is always moving between the air, the ocean, land, and fossil
            stores. This instrument gives each part of the global carbon budget
            its own voice, so concentration, emissions, sinks, and the
            accounting residual cannot be confused with one another.
          </p>
          <p className="explore-status">
            <span aria-hidden="true" className="status-dot status-dot--available" />
            Annual records · 1959–2024 · not live
          </p>
          <p className="listen-cue">
            Start with the atmosphere. Then add the fossil pulse, the ocean
            tide, the land band, and the quiet balance anchor.
          </p>
        </div>

        <dl className="explore-facts" aria-label="Carbon dataset facts">
          <div>
            <dt>Period</dt>
            <dd>1959–2024</dd>
          </div>
          <div>
            <dt>Sources</dt>
            <dd>NOAA · GCB</dd>
          </div>
          <div>
            <dt>Voices</dt>
            <dd>Five</dd>
          </div>
        </dl>
      </header>

      <CarbonInstrument />

      <section aria-labelledby="carbon-scope-title" className="pulse-section field-section">
        <div className="section-intro">
          <h2 id="carbon-scope-title">What the carbon record is, and is not</h2>
          <p>
            The atmosphere is represented by a measured annual concentration at
            one benchmark station. The flows are global annual budget estimates
            from models and data products. They are not the same kind of number.
          </p>
        </div>

        <div className="field-notes">
          <div className="field-note">
            <h3>Concentration</h3>
            <p>
              NOAA GML&apos;s Mauna Loa annual mean is a mixing ratio in ppm. It
              tells us how much CO₂ is in the air at that station, not where the
              carbon came from or how much was emitted that year.
            </p>
          </div>
          <div className="field-note">
            <h3>Emissions</h3>
            <p>
              Fossil and industrial emissions and land-use change emissions are
              flows into the atmosphere in GtC/yr. They are reported separately
              because they have different sources, methods, and uncertainties.
            </p>
          </div>
          <div className="field-note">
            <h3>Sinks</h3>
            <p>
              Positive ocean and land sinks mean carbon moves from the
              atmosphere into the reservoir. They are global estimates from
              model ensembles and data products, not local flux measurements.
            </p>
          </div>
          <div className="field-note">
            <h3>Residual</h3>
            <p>
              The budget imbalance is emissions minus atmospheric growth and the
              sinks. It is a measure of imperfect accounting, not a discovered
              physical flux. The quiet anchor keeps it audibly separate.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="carbon-listen-title" className="pulse-section">
        <div className="section-intro">
          <h2 id="carbon-listen-title">How to listen across sixty-six years</h2>
          <p>
            Each year is one step. The year select jumps to a state; Play runs
            from that year to 2024; the slider scrubs the same annual sequence.
            The five voices change together, but each can be muted independently.
          </p>
        </div>
        <div className="scope-columns">
          <div>
            <h3>What changes the sound</h3>
            <ul className="marker-list">
              <li>Higher CO₂ concentration raises the atmosphere drone.</li>
              <li>A larger annual change quickens its slow tremolo.</li>
              <li>More fossil emissions quicken the regular pulse.</li>
              <li>More land-use emissions quicken the darker low pulse.</li>
              <li>Larger ocean and land sinks raise their tide and band.</li>
              <li>A larger residual lifts the quiet balance anchor.</li>
            </ul>
          </div>
          <div>
            <h3>What the sound does not prove</h3>
            <ul className="marker-list marker-list--muted">
              <li>That a concentration increase was caused by one emitter.</li>
              <li>That a global sink operates the same way locally.</li>
              <li>That the residual is missing carbon.</li>
              <li>That an annual global budget is a forecast or a live measurement.</li>
              <li>That a louder layer is more important or more dangerous.</li>
            </ul>
          </div>
        </div>
        <p className="fine-print">
          Muting a layer removes its voice only. The selected year, values, units,
          and source remain in the reading panel and the data record.
        </p>
      </section>
    </div>
  );
}
