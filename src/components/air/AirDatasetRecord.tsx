import Link from "next/link";

import type { AirDatasetMeta } from "@/lib/air/types";

export function AirDatasetRecord({ meta }: { meta: AirDatasetMeta }) {
  return (
    <section aria-labelledby="air-record-title" className="rail-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="air-record-title">
          Air record
        </h2>
        <span className="panel-count">Eight monitors</span>
      </div>
      <dl className="record-list">
        <div className="record-row">
          <dt>Period</dt>
          <dd className="record-mono">{meta.period.label} · hourly UTC</dd>
        </div>
        <div className="record-row">
          <dt>Source</dt>
          <dd>US EPA AirData · AQS</dd>
        </div>
        <div className="record-row">
          <dt>Type</dt>
          <dd>Ground-level monitoring stations; one co-located site per city.</dd>
        </div>
        <div className="record-row">
          <dt>Variables</dt>
          <dd className="record-mono">PM2.5 · NO₂ · O₃</dd>
        </div>
        <div className="record-row">
          <dt>Not</dt>
          <dd>
            A satellite column, a city-wide average, live data, or a health
            warning.
          </dd>
        </div>
      </dl>
      <div className="panel-actions">
        <Link className="panel-link" href="/data-sources#air">
          Provenance
        </Link>
        <span className="panel-verified">Sourced · hourly</span>
      </div>
    </section>
  );
}
