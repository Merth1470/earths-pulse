"use client";

import { Volume2 } from "lucide-react";

import type { CarbonFlowSelection } from "@/components/carbon/CarbonDiagram";
import type {
  CarbonDatasetMeta,
  CarbonYear,
} from "@/lib/carbon/types";
import {
  describeFlow,
  formatGtC,
  formatPpm,
  formatPpmChange,
} from "@/lib/carbon/dataset";

interface CarbonReadingPanelProps {
  sample: CarbonYear;
  meta: CarbonDatasetMeta;
  selectedFlow: CarbonFlowSelection;
  onFlow: (flow: CarbonFlowSelection) => void;
  announcement: string;
  live: boolean;
  spoken: boolean;
  speechReady: boolean;
  onSpoken: (value: boolean) => void;
  onSpeak: () => void;
}

const FLOWS: Array<{ id: CarbonFlowSelection; label: string }> = [
  { id: "atmosphere", label: "Atmospheric CO₂" },
  { id: "fossil", label: "Fossil emissions" },
  { id: "landUse", label: "Land-use emissions" },
  { id: "ocean", label: "Ocean sink" },
  { id: "land", label: "Land sink" },
  { id: "imbalance", label: "Budget residual" },
];

export function CarbonReadingPanel({
  sample,
  meta,
  selectedFlow,
  onFlow,
  announcement,
  live,
  spoken,
  speechReady,
  onSpoken,
  onSpeak,
}: CarbonReadingPanelProps) {
  const detail = describeFlow(selectedFlow, sample);
  const source =
    selectedFlow === "atmosphere"
      ? meta.sources.find((item) => item.id === "noaa-mlo-co2")
      : meta.sources.find((item) => item.id === "gcb-2025");

  return (
    <section aria-labelledby="carbon-reading-title" className="rail-panel reading-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="carbon-reading-title">
          Carbon reading
        </h2>
        <span className="panel-count">{sample.year}</span>
      </div>

      <dl className="reading-values carbon-reading-values">
        <div>
          <dt>Atmospheric CO₂</dt>
          <dd>{formatPpm(sample.co2Ppm)}</dd>
        </div>
        <div>
          <dt>Total emissions</dt>
          <dd>{formatGtC(sample.emissionsGtC, 1)}</dd>
        </div>
        <div>
          <dt>Ocean sink</dt>
          <dd>{formatGtC(sample.oceanSinkGtC, 1)}</dd>
        </div>
      </dl>

      <p className="reading-position">
        <span>{sample.year}</span>
        <span>annual mean · global budget</span>
        <span>CO₂ change {formatPpmChange(sample.co2AnnualChangePpm)}</span>
      </p>

      <div className="carbon-flow-list" role="group" aria-label="Carbon reservoirs and flows">
        {FLOWS.map((flow) => {
          const item = describeFlow(flow.id, sample);
          return (
            <button
              aria-pressed={selectedFlow === flow.id}
              className="carbon-flow-button"
              key={flow.id}
              onClick={() => onFlow(flow.id)}
              type="button"
            >
              <span>{flow.label}</span>
              <span className="carbon-flow-button-value">
                {flow.id === "atmosphere" ? formatPpm(sample.co2Ppm) : item.value}
              </span>
            </button>
          );
        })}
      </div>

      <div className="carbon-flow-detail">
        <p className="aside-label">{detail.title}</p>
        <p className="carbon-flow-detail-value">{detail.value}</p>
        <p>{detail.definition}</p>
        {source ? (
          <p className="carbon-source-note">
            {source.provider} · {source.unit}
          </p>
        ) : null}
      </div>

      {live ? (
        <p aria-atomic="true" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      ) : null}

      <div className="reading-actions">
        <button
          className="reading-speak"
          disabled={!speechReady}
          onClick={onSpeak}
          type="button"
        >
          <Volume2 aria-hidden="true" size={13} strokeWidth={1.7} />
          Read this year aloud
        </button>
        <label className="reading-toggle">
          <input
            checked={spoken}
            onChange={(event) => onSpoken(event.currentTarget.checked)}
            type="checkbox"
          />
          <span>Speak each year</span>
        </label>
        <p className="reading-note">
          The live region and browser speech never run together. Lower the
          volume or mute individual layers at any time.
        </p>
      </div>
    </section>
  );
}
