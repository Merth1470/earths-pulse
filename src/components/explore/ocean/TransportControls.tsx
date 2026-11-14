"use client";

import { Pause, Play, Square } from "lucide-react";
import type { CSSProperties } from "react";

import { StatusTag } from "@/components/ui/StatusTag";
import type { SonifierLayers } from "@/lib/audio/sonifier";

interface TransportControlsProps {
  playing: boolean;
  ended: boolean;
  supported: boolean;
  progress: number;
  stepIndex: number;
  stepCount: number;
  positionLabel: string;
  speed: number;
  volume: number;
  layers: SonifierLayers;
  audioError: string | null;
  onToggle: () => void;
  onStop: () => void;
  onSeek: (progress: number) => void;
  onSpeed: (speed: number) => void;
  onVolume: (volume: number) => void;
  onLayers: (layers: SonifierLayers) => void;
}

const SPEEDS = [0.5, 1, 2] as const;

function statusLabel(playing: boolean, ended: boolean, progress: number) {
  if (playing) return "Running";
  if (ended) return "Complete";
  if (progress > 0) return "Paused";
  return "Ready";
}

export function TransportControls({
  playing,
  ended,
  supported,
  progress,
  stepIndex,
  stepCount,
  positionLabel,
  speed,
  volume,
  layers,
  audioError,
  onToggle,
  onStop,
  onSeek,
  onSpeed,
  onVolume,
  onLayers,
}: TransportControlsProps) {
  const status = statusLabel(playing, ended, progress);
  const tone = playing ? "available" : ended ? "neutral" : "pending";

  return (
    <section className="player sonification-transport" aria-labelledby="transport-title">
      <div className="transport">
        <button
          aria-label={playing ? "Pause sonification" : "Play sonification"}
          className="transport-play"
          disabled={!supported}
          onClick={onToggle}
          type="button"
        >
          {playing ? (
            <Pause aria-hidden="true" fill="currentColor" size={15} strokeWidth={0} />
          ) : (
            <Play aria-hidden="true" fill="currentColor" size={15} strokeWidth={0} />
          )}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>

        <button
          aria-label="Stop sonification and return to the first sample"
          className="transport-stop"
          disabled={!supported || (!playing && progress === 0)}
          onClick={onStop}
          type="button"
        >
          <Square aria-hidden="true" fill="currentColor" size={11} strokeWidth={0} />
          <span>Stop</span>
        </button>

        <div className="transport-copy">
          <div className="transport-heading-row">
            <h2 className="transport-title" id="transport-title">
              Listen to the transect
            </h2>
            <StatusTag tone={tone}>{status}</StatusTag>
          </div>
          <p className="transport-note">
            {supported
              ? "Press play once. Audio starts only after that interaction. Step through the highlighted transect west to east."
              : "This browser does not expose the Web Audio API. The field and readings remain available; audio is unavailable."}
          </p>
        </div>

        <dl className="transport-metrics">
          <div>
            <dt>Step</dt>
            <dd>
              {String(stepIndex + 1).padStart(2, "0")} / {String(stepCount).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt>Position</dt>
            <dd>{positionLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="seek-row">
        <label className="sr-only" htmlFor="seek">
          Playback position along the transect
        </label>
        <input
          aria-valuetext={`Step ${stepIndex + 1} of ${stepCount}, ${positionLabel}`}
          className="seek"
          id="seek"
          max={Math.max(1, stepCount - 1)}
          min={0}
          onChange={(event) =>
            onSeek(Number(event.target.value) / Math.max(1, stepCount - 1))
          }
          step={1}
          style={
            {
              "--seek": `${(stepIndex / Math.max(1, stepCount - 1)) * 100}%`,
            } as CSSProperties
          }
          type="range"
          value={stepIndex}
        />
        <div className="seek-labels" aria-hidden="true">
          <span>West</span>
          <span>{ended ? "End of transect" : playing ? "Listening" : "Drag to inspect"}</span>
          <span>East</span>
        </div>
      </div>

      <div className="transport-controls">
        <fieldset className="control-set" disabled={!supported}>
          <legend>Playback speed</legend>
          <div className="segmented">
            {SPEEDS.map((value) => (
              <button
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

        <fieldset className="control-set control-set--layers" disabled={!supported}>
          <legend>Sound layers</legend>
          <div className="layer-options">
            <label className="layer-option">
              <input
                checked={layers.temperature}
                onChange={(event) =>
                  onLayers({ ...layers, temperature: event.target.checked })
                }
                type="checkbox"
              />
              <span>Temperature tone</span>
            </label>
            <label className="layer-option">
              <input
                checked={layers.rhythm}
                onChange={(event) =>
                  onLayers({ ...layers, rhythm: event.target.checked })
                }
                type="checkbox"
              />
              <span>Current pulse</span>
            </label>
            <label className="layer-option">
              <input
                checked={layers.texture}
                onChange={(event) =>
                  onLayers({ ...layers, texture: event.target.checked })
                }
                type="checkbox"
              />
              <span>Flow texture</span>
            </label>
          </div>
        </fieldset>

        <div className="control-set volume-control">
          <label htmlFor="volume">Volume</label>
          <div className="volume-row">
            <input
              aria-valuetext={`${Math.round(volume * 100)} percent`}
              disabled={!supported}
              id="volume"
              max={1}
              min={0}
              onChange={(event) => onVolume(Number(event.target.value))}
              step={0.01}
              type="range"
              value={volume}
            />
            <output htmlFor="volume">{Math.round(volume * 100)}%</output>
          </div>
        </div>
      </div>

      {audioError ? (
        <p className="transport-error" role="alert">
          {audioError}
        </p>
      ) : null}

      <p className="transport-fineprint">
        Same fields and settings produce the same sound. Speed changes listening
        time only; it does not change the values. Each arrow key on the position
        slider moves one sample along the transect.
      </p>
    </section>
  );
}
