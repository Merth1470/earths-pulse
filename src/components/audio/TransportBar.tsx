"use client";

import { AlertTriangle, Pause, Play, Square } from "lucide-react";

export interface TransportMetric {
  label: string;
  value: string;
  blocked?: boolean;
}

interface TransportBarProps {
  title: string;
  note: string;
  playLabel: string;
  stateLabel: string;
  metrics: TransportMetric[];
  playing: boolean;
  supported: boolean;
  canStop: boolean;
  progress: number;
  stepCount: number;
  stepIndex: number;
  stepLabel: string;
  stepText: string;
  startLabel: string;
  endLabel: string;
  speed: number;
  volume: number;
  audioError: string | null;
  fineprint?: string;
  onToggle: () => void;
  onStop: () => void;
  onSeek: (progress: number) => void;
  onSpeed: (speed: number) => void;
  onVolume: (volume: number) => void;
}

const SPEEDS = [0.5, 1, 2];

/**
 * Shared transport used by the carbon and air-quality instruments. It owns no
 * audio itself; it only presents state and emits intent to the page engine.
 */
export function TransportBar({
  title,
  note,
  playLabel,
  stateLabel,
  metrics,
  playing,
  supported,
  canStop,
  progress,
  stepCount,
  stepIndex,
  stepLabel,
  stepText,
  startLabel,
  endLabel,
  speed,
  volume,
  audioError,
  fineprint,
  onToggle,
  onStop,
  onSeek,
  onSpeed,
  onVolume,
}: TransportBarProps) {
  const max = Math.max(0, stepCount - 1);
  const safeIndex = Math.max(0, Math.min(max, stepIndex));
  const seekPercent = max === 0 ? 0 : (safeIndex / max) * 100;
  const atEnd = safeIndex >= max;
  const resumable = progress > 0 && !atEnd;
  const toggleLabel = !supported
    ? `${playLabel} (audio unavailable)`
    : playing
      ? "Pause sonification"
      : resumable
        ? "Resume sonification"
        : playLabel;

  return (
    <section aria-label={`${title} transport`} className="sonification-transport transport-shell">
      {audioError ? (
        <p className="transport-error" role="alert">
          <AlertTriangle aria-hidden="true" size={13} strokeWidth={1.6} />
          {audioError}
        </p>
      ) : null}

      <div className="transport">
        <button
          aria-label={toggleLabel}
          className="transport-play"
          disabled={!supported}
          onClick={onToggle}
          type="button"
        >
          {playing ? (
            <Pause aria-hidden="true" size={14} strokeWidth={1.8} />
          ) : (
            <Play aria-hidden="true" size={14} strokeWidth={1.8} />
          )}
          <span aria-hidden="true">
            {playing ? "Pause" : resumable ? "Resume" : "Play"}
          </span>
        </button>
        <button
          aria-label="Stop sonification and return to the start"
          className="transport-stop"
          disabled={!canStop}
          onClick={onStop}
          type="button"
        >
          <Square aria-hidden="true" size={11} strokeWidth={1.8} />
          <span aria-hidden="true">Stop</span>
        </button>

        <div className="transport-copy">
          <div className="transport-heading-row">
            <h2 className="transport-title">{title}</h2>
            <span className="transport-state">{stateLabel}</span>
          </div>
          <p className="transport-note">{note}</p>
        </div>

        <dl className="transport-metrics">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd className={metric.blocked ? "metric-blocked" : undefined}>
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="seek-row">
        <input
          aria-label={stepLabel}
          aria-valuetext={stepText}
          className="seek"
          max={max}
          min={0}
          onChange={(event) => {
            const value = Number(event.currentTarget.value);
            onSeek(max === 0 ? 0 : value / max);
          }}
          step={1}
          style={{ "--seek": `${seekPercent}%` } as React.CSSProperties}
          type="range"
          value={safeIndex}
        />
        <div className="seek-labels" aria-hidden="true">
          <span>{startLabel}</span>
          <span>{stepText}</span>
          <span>{endLabel}</span>
        </div>
      </div>

      <div className="transport-controls">
        <fieldset className="control-set">
          <legend>Playback speed</legend>
          <div className="segmented">
            {SPEEDS.map((value) => (
              <button
                aria-label={`Playback speed ${value} times`}
                aria-pressed={speed === value}
                className="segment"
                key={value}
                onClick={() => onSpeed(value)}
                type="button"
              >
                {value}×
              </button>
            ))}
          </div>
        </fieldset>

        <div className="volume-control">
          <label htmlFor="shared-volume">Volume</label>
          <div className="volume-row">
            <input
              disabled={!supported}
              id="shared-volume"
              max={1}
              min={0}
              onChange={(event) => onVolume(Number(event.currentTarget.value))}
              step={0.05}
              type="range"
              value={volume}
            />
            <output htmlFor="shared-volume">{Math.round(volume * 100)}%</output>
          </div>
        </div>

        {fineprint ? <p className="transport-fineprint">{fineprint}</p> : null}
      </div>
    </section>
  );
}
