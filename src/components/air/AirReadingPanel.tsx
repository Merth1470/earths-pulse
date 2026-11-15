"use client";

import { Volume2 } from "lucide-react";

import type {
  AirDatasetMeta,
  AirPollutantId,
  AirSample,
} from "@/lib/air/types";
import {
  AIR_POLLUTANT_IDS,
  AIR_POLLUTANT_SHORT,
  AIR_LAYERS,
  airTimestampLabel,
  formatAirValue,
} from "@/lib/air/dataset";

interface AirReadingPanelProps {
  sample: AirSample;
  meta: AirDatasetMeta;
  pollutant: AirPollutantId;
  announcement: string;
  live: boolean;
  spoken: boolean;
  speechReady: boolean;
  onSpoken: (value: boolean) => void;
  onSpeak: () => void;
}

export function AirReadingPanel({
  sample,
  meta,
  pollutant,
  announcement,
  live,
  spoken,
  speechReady,
  onSpoken,
  onSpeak,
}: AirReadingPanelProps) {
  const selectedLayer = AIR_LAYERS.find((layer) => layer.id === pollutant)!;

  return (
    <section aria-labelledby="air-reading-title" className="rail-panel reading-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="air-reading-title">
          City reading
        </h2>
        <span className="panel-count">Hourly</span>
      </div>

      <p className="air-place-name">
        {sample.city.name}, {sample.city.state}
      </p>
      <p className="reading-position">
        <span>{sample.city.monitor.name}</span>
        <span>{airTimestampLabel(sample.timestamp)}</span>
      </p>

      <dl className="reading-values air-reading-values">
        {AIR_POLLUTANT_IDS.map((id) => (
          <div key={id} className={id === pollutant ? "is-selected" : undefined}>
            <dt>{AIR_POLLUTANT_SHORT[id]}</dt>
            <dd className={sample.values[id] === null ? "is-missing" : undefined}>
              {formatAirValue(id, sample.values[id])}
            </dd>
          </div>
        ))}
      </dl>

      <div className="air-measurement-note">
        <p>
          <strong>Ground-level monitor.</strong> These are station measurements,
          not satellite columns and not a city-wide average.
        </p>
        <p>
          {meta.temporalResolution} · {meta.timeBasis} · site{" "}
          <span className="record-mono">{sample.city.monitor.siteId}</span> · POC{" "}
          <span className="record-mono">{sample.city.pocs[pollutant]}</span>
        </p>
      </div>

      <div className="air-layer-detail">
        <p className="aside-label">
          {selectedLayer.label} · sound mapping
        </p>
        <p>{selectedLayer.sonification}</p>
        <p className="carbon-limit">{selectedLayer.limitation}</p>
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
          Read this hour aloud
        </button>
        <label className="reading-toggle">
          <input
            checked={spoken}
            onChange={(event) => onSpoken(event.currentTarget.checked)}
            type="checkbox"
          />
          <span>Speak each hour</span>
        </label>
        <p className="reading-note">
          The live region and browser speech never run together. Selecting a new
          city or hour updates the same values in text.
        </p>
      </div>
    </section>
  );
}
