import Link from "next/link";

import type { CarbonDatasetMeta } from "@/lib/carbon/types";

export function CarbonDatasetRecord({ meta }: { meta: CarbonDatasetMeta }) {
  return (
    <section aria-labelledby="carbon-record-title" className="rail-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="carbon-record-title">
          Carbon record
        </h2>
        <span className="panel-count">Two sources</span>
      </div>
      <dl className="record-list">
        <div className="record-row">
          <dt>Period</dt>
          <dd className="record-mono">{meta.period.label} · annual</dd>
        </div>
        <div className="record-row">
          <dt>Concentration</dt>
          <dd>NOAA GML · Mauna Loa annual mean</dd>
        </div>
        <div className="record-row">
          <dt>Budget</dt>
          <dd>Global Carbon Budget 2025 · global annual</dd>
        </div>
        <div className="record-row">
          <dt>Units</dt>
          <dd className="record-mono">ppm · GtC/yr</dd>
        </div>
        <div className="record-row">
          <dt>Not a</dt>
          <dd>
            Map, national inventory, stock estimate, or live measurement.
          </dd>
        </div>
      </dl>
      <div className="panel-actions">
        <Link className="panel-link" href="/data-sources#carbon">
          Provenance
        </Link>
        <span className="panel-verified">Sourced · annual</span>
      </div>
    </section>
  );
}
