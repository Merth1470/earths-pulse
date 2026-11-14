"use client";

import { Volume2 } from "lucide-react";

import { StatusTag } from "@/components/ui/StatusTag";
import {
  describeSample,
  formatBearing,
  formatLatitude,
  formatLongitude,
  formatSpeed,
  formatSst,
} from "@/lib/ocean/dataset";
import type {
  OceanFrameMeta,
  TransectDefinition,
  TransectSample,
} from "@/lib/ocean/types";

interface ReadingPanelProps {
  sample: TransectSample | null;
  transect: TransectDefinition;
  frame: OceanFrameMeta;
  stepIndex: number;
  stepCount: number;
  playing: boolean;
  ended: boolean;
  preview: boolean;
  spoken: boolean;
  speechReady: boolean;
  announcement: string;
  onSpeak: () => void;
  onSpoken: (value: boolean) => void;
}

export function ReadingPanel({
  sample,
  transect,
  frame,
  stepIndex,
  stepCount,
  playing,
  ended,
  preview,
  spoken,
  speechReady,
  announcement,
  onSpeak,
  onSpoken,
}: ReadingPanelProps) {
  const tone = playing ? "available" : ended ? "neutral" : "pending";
  const label = playing
    ? "Live"
    : ended
      ? "Final sample"
      : preview
        ? "Preview"
        : "Paused";

  return (
    <section aria-labelledby="reading-title" className="rail-panel reading-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="reading-title">
          Current reading
        </h2>
        <StatusTag tone={tone}>{label}</StatusTag>
      </div>

      <dl className="reading-values">
        <div>
          <dt>Sea surface temperature</dt>
          <dd>
            {sample?.sst === null || sample === null
              ? "Missing"
              : formatSst(sample.sst)}
          </dd>
        </div>
        <div>
          <dt>Current speed</dt>
          <dd>
            {sample?.speed === null || sample === null
              ? "Missing"
              : formatSpeed(sample.speed)}
          </dd>
        </div>
        <div>
          <dt>Flows toward</dt>
          <dd>
            {sample?.bearing === null || sample === null
              ? "Missing"
              : formatBearing(sample.bearing)}
          </dd>
        </div>
      </dl>

      <p className="reading-position">
        <span>
          Step {String(stepIndex + 1).padStart(2, "0")} /{" "}
          {String(stepCount).padStart(2, "0")}
        </span>
        {sample ? (
          <span>
            {formatLongitude(sample.displayLon)} · {formatLatitude(sample.lat)}
          </span>
        ) : null}
        <span>{frame.label}</span>
      </p>

      <p className="reading-description">
        {describeSample(sample, transect, frame)}
      </p>

      <div className="reading-actions">
        <button
          className="reading-speak"
          disabled={!speechReady}
          onClick={onSpeak}
          title={
            speechReady
              ? "Read the current values using your browser voice"
              : "Browser speech synthesis is unavailable"
          }
          type="button"
        >
          <Volume2 aria-hidden="true" size={13} strokeWidth={1.7} />
          Read this aloud
        </button>
        <label className="reading-toggle">
          <input
            checked={spoken}
            disabled={!speechReady}
            onChange={(event) => onSpoken(event.target.checked)}
            type="checkbox"
          />
          <span>Announce every fourth step</span>
        </label>
      </div>

      <p className="reading-note">
        Spoken readings use your browser&apos;s voice and always match the
        visible values. Screen-reader users may prefer to keep this off.
      </p>

      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
