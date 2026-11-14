import type { Metadata } from "next";

import { DataNote } from "@/components/explore/DataNote";
import { SourceRecord } from "@/components/explore/SourceRecord";
import { SonificationPlayer } from "@/components/player/SonificationPlayer";
import { SignalPath } from "@/components/player/SignalPath";
import { VisualizationPlate } from "@/components/visualization/VisualizationPlate";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: { absolute: "Explore — Earth's Pulse" },
  description:
    "Explore NASA's ECCO2 global sea surface currents and temperature visualization, the verified source record, and the Stage 1 sonification foundation.",
};

export default function ExplorePage() {
  const record = NASA_SVS_RECORD;

  return (
    <div className="shell explore">
      <header className="explore-head">
        <div className="explore-head-main">
          <h1>{record.title}</h1>
          <p className="explore-lede">
            One verified frame from a year of ECCO2 ocean model output, rendered
            by NASA&apos;s Scientific Visualization Studio. Currents appear as
            fine filaments; color follows sea surface temperature.
          </p>
          <p className="explore-status">
            <span aria-hidden="true" className="status-dot status-dot--neutral" />
            Historical model output · {record.period.label} · Not live
          </p>
        </div>

        <dl className="explore-facts" aria-label="Visualization facts">
          <div>
            <dt>Model</dt>
            <dd>ECCO2</dd>
          </div>
          <div>
            <dt>Period</dt>
            <dd>2007—2008</dd>
          </div>
          <div>
            <dt>Coverage</dt>
            <dd>Global ocean</dd>
          </div>
        </dl>
      </header>

      <div className="instrument-grid">
        <div className="instrument-main">
          <VisualizationPlate />
          <SonificationPlayer />
        </div>

        <aside
          aria-label="Source record and sonification status"
          className="instrument-rail"
        >
          <SourceRecord />
          <SignalPath />
          <DataNote />
        </aside>
      </div>

      <p className="explore-endnote">
        The visualization period ends on 3 March 2008. Nothing on this screen is
        a live ocean observation.
      </p>
    </div>
  );
}
