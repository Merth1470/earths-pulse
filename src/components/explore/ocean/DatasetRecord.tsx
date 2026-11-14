import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { StatusTag } from "@/components/ui/StatusTag";
import type { OceanDatasetMeta } from "@/lib/ocean/types";

interface DatasetRecordProps {
  meta: OceanDatasetMeta;
}

export function DatasetRecord({ meta }: DatasetRecordProps) {
  return (
    <section aria-labelledby="dataset-title" className="rail-panel dataset-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="dataset-title">
          Data record
        </h2>
        <StatusTag tone="available">Verified subset</StatusTag>
      </div>

      <dl className="record-list">
        <div className="record-row">
          <dt>Products</dt>
          <dd>OSCAR surface currents · NOAA OISST v2.1</dd>
        </div>
        <div className="record-row">
          <dt>Providers</dt>
          <dd>Earth &amp; Space Research · NOAA NCEI</dd>
        </div>
        <div className="record-row">
          <dt>Period</dt>
          <dd className="record-mono">Jan — Dec 2012</dd>
        </div>
        <div className="record-row">
          <dt>Sampling</dt>
          <dd>12 monthly composites, one per month</dd>
        </div>
        <div className="record-row">
          <dt>Grid</dt>
          <dd className="record-mono">
            Global · 1.5° · {meta.grid.lonCount} × {meta.grid.latCount}
          </dd>
        </div>
        <div className="record-row">
          <dt>Variables</dt>
          <dd>SST °C · u, v m/s at the surface</dd>
        </div>
        <div className="record-row">
          <dt>Access</dt>
          <dd>NOAA CoastWatch ERDDAP · public</dd>
        </div>
      </dl>

      <div className="source-links">
        {meta.sources.map((source) => (
          <a
            className="panel-link"
            href={source.url}
            key={source.id}
            rel="noreferrer"
            target="_blank"
          >
            {source.id === "oscar" ? "OSCAR dataset" : "OISST dataset"}
            <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.6} />
          </a>
        ))}
        <Link className="panel-link" href="/data-sources">
          Full provenance
          <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.6} />
        </Link>
      </div>

      <p className="panel-footnote">
        OSCAR is a satellite-derived surface current analysis; OISST blends
        satellite and in-situ observations. Neither product is a direct reading
        at every grid cell. The NASA SVS 2007–2008 ECCO2 render is a separate
        reference and is not the numerical source for this field.
      </p>
    </section>
  );
}
