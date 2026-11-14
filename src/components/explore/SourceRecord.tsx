import { ArrowUpRight } from "lucide-react";

import { StatusTag } from "@/components/ui/StatusTag";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export function SourceRecord() {
  const record = NASA_SVS_RECORD;

  return (
    <section aria-labelledby="source-record-title" className="rail-panel source-record">
      <div className="panel-head">
        <h2 className="panel-title" id="source-record-title">
          Source record
        </h2>
        <StatusTag tone="available">Verified</StatusTag>
      </div>

      <dl className="record-list">
        <div className="record-row">
          <dt>Visualization</dt>
          <dd>{record.title}</dd>
        </div>
        <div className="record-row">
          <dt>Record</dt>
          <dd className="record-mono">SVS {record.id}</dd>
        </div>
        <div className="record-row">
          <dt>Publisher</dt>
          <dd>{record.publisher}</dd>
        </div>
        <div className="record-row">
          <dt>Model</dt>
          <dd>{record.model.name} · {record.model.solver}</dd>
        </div>
        <div className="record-row">
          <dt>Period</dt>
          <dd className="record-mono">{record.period.label}</dd>
        </div>
        <div className="record-row">
          <dt>Credit</dt>
          <dd>Greg Shirah, NASA/GSFC</dd>
        </div>
        <div className="record-row">
          <dt>Plate frame</dt>
          <dd className="record-mono">
            {record.still.frame} · {record.still.timestampLabel}
          </dd>
        </div>
        <div className="record-row">
          <dt>Plate file</dt>
          <dd className="record-mono">
            {record.still.width} × {record.still.height} JPEG · 1.0 MB
          </dd>
        </div>
      </dl>

      <div className="panel-actions">
        <a
          className="panel-link"
          href={record.pageUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open NASA record
          <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.6} />
        </a>
        <span className="panel-verified">Validated {record.validatedOn}</span>
      </div>
    </section>
  );
}
