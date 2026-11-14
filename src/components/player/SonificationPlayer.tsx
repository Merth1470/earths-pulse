import { Play } from "lucide-react";

import { AudioCapability } from "@/components/player/AudioCapability";
import { StatusTag } from "@/components/ui/StatusTag";

const SPEEDS = ["0.5×", "1×", "2×"] as const;
const LAYERS = [
  { id: "sst", label: "Sea surface temperature" },
  { id: "currents", label: "Surface currents" },
] as const;

export function SonificationPlayer() {
  return (
    <section
      aria-describedby="transport-note"
      aria-labelledby="transport-title"
      className="player"
    >
      <div className="transport">
        <button
          aria-describedby="transport-note"
          aria-label="Play sonification. Unavailable in Stage 1."
          className="transport-play"
          disabled
          type="button"
        >
          <Play aria-hidden="true" fill="currentColor" size={16} strokeWidth={0} />
        </button>

        <div className="transport-copy">
          <div className="transport-heading-row">
            <h2 className="transport-title" id="transport-title">
              Sonification transport
            </h2>
            <StatusTag tone="blocked">Offline</StatusTag>
          </div>
          <p className="transport-note" id="transport-note">
            Audio engine not implemented. Stage 02 will map verified ECCO2
            fields to Web Audio; playback stays disabled until then.
          </p>
        </div>

        <dl className="transport-metrics">
          <div>
            <dt>Web Audio API</dt>
            <dd>
              <AudioCapability />
            </dd>
          </div>
          <div>
            <dt>Engine</dt>
            <dd className="metric-blocked">Not implemented</dd>
          </div>
        </dl>
      </div>

      <div className="timeline" role="group" aria-label="Playback timeline, unavailable">
        <div aria-hidden="true" className="timeline-track">
          <span className="timeline-edge timeline-edge--start" />
          <span className="timeline-edge timeline-edge--end" />
          <span className="timeline-cursor" />
        </div>
        <div className="timeline-labels">
          <span className="timeline-date">2007.03.25 / 12:00Z</span>
          <span className="timeline-state">Not synchronized</span>
          <span className="timeline-date">2008.03.03 / 12:00Z</span>
        </div>
      </div>

      <div className="transport-controls">
        <fieldset className="control-set" disabled>
          <legend>Speed</legend>
          <div className="segmented">
            {SPEEDS.map((speed) => (
              <button
                aria-label={`Playback speed ${speed}. Unavailable in Stage 1.`}
                className="segment"
                key={speed}
                type="button"
              >
                {speed}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="control-set control-set--layers" disabled>
          <legend>Layers</legend>
          <div className="layer-options">
            {LAYERS.map((layer) => (
              <label className="layer-option" key={layer.id}>
                <input type="checkbox" />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="transport-fineprint">
          Both layers are baked into the NASA plate. Separate, synchronized
          layers require numerical field data.
        </p>
      </div>
    </section>
  );
}
