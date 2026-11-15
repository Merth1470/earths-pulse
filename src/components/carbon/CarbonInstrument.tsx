"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { LayerSwitches } from "@/components/audio/LayerSwitches";
import { TransportBar } from "@/components/audio/TransportBar";
import { CarbonCompare } from "@/components/carbon/CarbonCompare";
import {
  CarbonDiagram,
  type CarbonFlowSelection,
} from "@/components/carbon/CarbonDiagram";
import { CarbonDatasetRecord } from "@/components/carbon/CarbonDatasetRecord";
import { CarbonReadingPanel } from "@/components/carbon/CarbonReadingPanel";
import { cancelSpeech, speakText } from "@/lib/accessibility/speech";
import { useInstrumentShortcuts } from "@/lib/accessibility/useInstrumentShortcuts";
import {
  CarbonSonifier,
  type CarbonLayers,
} from "@/lib/audio/carbon-sonifier";
import {
  CARBON_LAYERS,
  carbonYearAt,
  describeCarbonYear,
  formatGtC,
  formatPpm,
  loadCarbonDataset,
} from "@/lib/carbon/dataset";
import type { CarbonYear } from "@/lib/carbon/types";
import { useDataset } from "@/lib/browser/useDataset";

const subscribeNoop = () => () => {};
const audioSupportedSnapshot = () =>
  typeof window !== "undefined" && "AudioContext" in window;
const speechSupportedSnapshot = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const DEFAULT_LAYERS: CarbonLayers = {
  atmosphere: true,
  emissions: true,
  ocean: true,
  land: true,
  balance: true,
};

export function CarbonInstrument() {
  const { data: dataset, error: loadError, loading, retry } = useDataset(loadCarbonDataset);
  const [yearIndex, setYearIndex] = useState(0);
  const [layers, setLayers] = useState<CarbonLayers>(DEFAULT_LAYERS);
  const [volume, setVolume] = useState(0.72);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedFlow, setSelectedFlow] =
    useState<CarbonFlowSelection>("atmosphere");
  const [spoken, setSpoken] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [audioError, setAudioError] = useState<string | null>(null);

  const engineRef = useRef<CarbonSonifier | null>(null);
  const spokenRef = useRef(false);

  const audioSupported = useSyncExternalStore(
    subscribeNoop,
    audioSupportedSnapshot,
    () => false,
  );
  const speechReady = useSyncExternalStore(
    subscribeNoop,
    speechSupportedSnapshot,
    () => false,
  );

  const samples = useMemo(
    () =>
      dataset
        ? dataset.years.map((_, index) => carbonYearAt(dataset, index))
        : [],
    [dataset],
  );

  useEffect(() => {
    spokenRef.current = spoken;
  }, [spoken]);

  const announce = useCallback((value: CarbonYear) => {
    const text = describeCarbonYear(value);
    setAnnouncement(text);
    if (spokenRef.current) speakText(text);
  }, []);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const engine = new CarbonSonifier();
      engine.setCallbacks({
        onStep: (next, index) => {
          setStepIndex(index);
          setYearIndex(index);
          setProgress(
            samples.length > 1 ? index / Math.max(1, samples.length - 1) : 0,
          );
          if (index % 5 === 0) announce(next);
        },
        onEnd: () => {
          setPlaying(false);
          setEnded(true);
          setProgress(1);
        },
        onError: (message) => {
          setAudioError(message);
          setPlaying(false);
        },
      });
      engineRef.current = engine;
    }
    return engineRef.current;
  }, [announce, samples.length]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      cancelSpeech();
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const snapshot = engineRef.current?.getSnapshot();
      if (!snapshot) return;
      setProgress(snapshot.progress);
      if (!snapshot.playing && snapshot.ended) setPlaying(false);
    }, 140);
    return () => window.clearInterval(timer);
  }, [playing]);

  const resetPlayback = useCallback(() => {
    engineRef.current?.stop();
    setPlaying(false);
    setEnded(false);
    setProgress(0);
    setStepIndex(0);
    setYearIndex(0);
    setAnnouncement("");
    setAudioError(null);
  }, []);

  const handleYear = useCallback(
    (index: number) => {
      if (!samples.length) return;
      resetPlayback();
      const nextIndex = Math.max(0, Math.min(samples.length - 1, index));
      setYearIndex(nextIndex);
      setStepIndex(nextIndex);
      engineRef.current?.seek(nextIndex / Math.max(1, samples.length - 1));
      announce(samples[nextIndex]);
    },
    [announce, resetPlayback, samples],
  );

  const startAtYear = useCallback(
    async (index: number, autoplay = true) => {
      if (!dataset || !samples.length) return;
      const nextIndex = Math.max(0, Math.min(samples.length - 1, index));
      const engine = getEngine();
      setAudioError(null);
      engine.configure({
        samples,
        ranges: dataset.meta.normalization,
        layers,
        volume,
        rate: speed,
      });
      engine.seek(nextIndex / Math.max(1, samples.length - 1));
      setYearIndex(nextIndex);
      setStepIndex(nextIndex);
      setEnded(false);
      if (!autoplay) {
        setPlaying(false);
        setProgress(nextIndex / Math.max(1, samples.length - 1));
        announce(samples[nextIndex]);
        return;
      }
      try {
        await engine.play();
        setPlaying(true);
        setProgress(nextIndex / Math.max(1, samples.length - 1));
      } catch (error) {
        setAudioError(
          error instanceof Error
            ? error.message
            : "Audio could not start in this browser.",
        );
        setPlaying(false);
      }
    },
    [announce, dataset, getEngine, layers, samples, speed, volume],
  );

  const handleToggle = useCallback(async () => {
    if (!dataset || !samples.length) return;
    if (playing) {
      engineRef.current?.pause();
      setPlaying(false);
      return;
    }
    await startAtYear(yearIndex, true);
  }, [dataset, playing, samples.length, startAtYear, yearIndex]);

  const handleStop = useCallback(() => {
    resetPlayback();
  }, [resetPlayback]);

  const handleSeek = useCallback(
    (nextProgress: number) => {
      if (!samples.length) return;
      const clamped = Math.max(0, Math.min(1, nextProgress));
      const nextIndex = Math.min(
        samples.length - 1,
        Math.floor(clamped * samples.length),
      );
      setProgress(clamped);
      setEnded(false);
      setStepIndex(nextIndex);
      setYearIndex(nextIndex);
      if (engineRef.current) {
        engineRef.current.seek(clamped);
      }
      announce(samples[nextIndex]);
    },
    [announce, samples],
  );

  const handleSpeed = useCallback((value: number) => {
    setSpeed(value);
    engineRef.current?.setRate(value);
  }, []);

  const handleVolume = useCallback((value: number) => {
    setVolume(value);
    engineRef.current?.setVolume(value);
  }, []);

  const handleLayers = useCallback((next: CarbonLayers) => {
    setLayers(next);
    engineRef.current?.setLayers(next);
  }, []);

  const handleSpoken = useCallback((value: boolean) => {
    setSpoken(value);
    if (!value) {
      cancelSpeech();
      return;
    }
    const current = samples[yearIndex];
    if (current) {
      const text = describeCarbonYear(current);
      setAnnouncement(text);
      speakText(text);
    }
  }, [samples, yearIndex]);

  const handleSpeak = useCallback(() => {
    const current = samples[yearIndex];
    if (!current) return;
    const text = describeCarbonYear(current);
    setAnnouncement(text);
    speakText(text);
  }, [samples, yearIndex]);

  useInstrumentShortcuts({
    onToggle: handleToggle,
    onStop: handleStop,
    onRead: handleSpeak,
  });

  if (!dataset || loading) {
    return (
      <div className="ocean-instrument">
        <div className="ocean-plate loading-plate">
          <div className="ocean-plate-bar">
            <span className="ocean-plate-index">System / Global</span>
            <span className="ocean-plate-kind">Loading annual budget</span>
            <span className="ocean-plate-dims">NOAA + GCB</span>
          </div>
          <div className="loading-plate-body">
            {loadError ? (
              <div className="load-error" role="alert">
                <AlertTriangle aria-hidden="true" size={20} strokeWidth={1.5} />
                <p className="load-error-title">The carbon record did not load</p>
                <p>{loadError}</p>
                <button className="button-primary" onClick={retry} type="button">
                  <RefreshCw aria-hidden="true" size={13} strokeWidth={1.7} />
                  Retry carbon record
                </button>
              </div>
            ) : (
              <div className="load-progress">
                <span className="load-progress-kicker">
                  NOAA GML → 66 annual records
                </span>
                <span className="load-progress-title">
                  Loading the global carbon budget
                </span>
                <span aria-hidden="true" className="load-progress-bar">
                  <span />
                </span>
                <span className="load-progress-note">
                  Concentration, emissions, ocean and land sinks, and residual
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const current = samples[yearIndex] ?? samples[0];
  const stateLabel = playing
    ? "Running"
    : ended
      ? "Complete"
      : progress > 0
        ? "Paused"
        : "Ready";
  const emissionScale = Math.max(
    ...dataset.series.fossilGtC.map((value) => Math.abs(value ?? 0)),
    ...dataset.series.landUseGtC.map((value) => Math.abs(value ?? 0)),
  );
  const sinkScale = Math.max(
    ...dataset.series.oceanSinkGtC.map((value) => Math.abs(value ?? 0)),
    ...dataset.series.landSinkGtC.map((value) => Math.abs(value ?? 0)),
  );

  return (
    <div className="carbon-instrument" data-ep-instrument="">
      <div className="carbon-field-bar">
        <label className="field-control" htmlFor="carbon-year">
          <span>Year</span>
          <select
            data-ep-select=""
            id="carbon-year"
            onChange={(event) => handleYear(Number(event.currentTarget.value))}
            value={yearIndex}
          >
            {dataset.years.map((year, index) => (
              <option key={year} value={index}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <div className="carbon-field-summary">
          <span className="aside-label">Selected period</span>
          <strong>{current.year}</strong>
          <span>annual · global</span>
        </div>
        <p className="carbon-field-hint">
          Hear the annual state, then scrub the record. Concentration is not an
          emission, and a global sink is not a local measurement.
        </p>
      </div>

      <div className="instrument-grid carbon-grid">
        <div className="instrument-main">
          <section aria-labelledby="carbon-diagram-heading" className="ocean-plate carbon-plate">
            <div className="ocean-plate-bar">
              <span className="ocean-plate-index" id="carbon-diagram-heading">
                System / Global
              </span>
              <span className="ocean-plate-kind">Computed from NOAA + GCB</span>
              <span className="ocean-plate-dims">66 annual records</span>
            </div>
            <p className="carbon-diagram-hint">
              Wide diagram. Scroll horizontally to inspect every reservoir.
            </p>
            <div
              aria-label="Carbon flow diagram. Scroll horizontally to inspect every reservoir."
              className="carbon-diagram-wrap"
              role="region"
              tabIndex={0}
            >
              <CarbonDiagram
                emissionScale={emissionScale}
                sample={current}
                selected={selectedFlow}
                sinkScale={sinkScale}
              />
            </div>
            <p className="ocean-plate-caption">
              <span>
                Atmosphere is shown as concentration; the other boxes are
                reservoirs. Arrows are annual fluxes in GtC/yr, not stocks.
                Positive ocean and land fluxes point into the reservoir.
              </span>
              <span className="ocean-plate-credit">
                {formatPpm(current.co2Ppm)} · {formatGtC(current.emissionsGtC)}
              </span>
            </p>
          </section>

          <TransportBar
            canStop={playing || progress > 0}
            endLabel={String(dataset.years.at(-1))}
            fineprint="A global annual record. The budget residual is not a physical flux. A/B comparison is available below."
            metrics={[
              { label: "Year", value: String(current.year) },
              {
                label: "CO₂",
                value: formatPpm(current.co2Ppm),
              },
              {
                label: "Residual",
                value: `${current.imbalanceGtC >= 0 ? "+" : ""}${current.imbalanceGtC.toFixed(2)} GtC`,
              },
            ]}
            note="Five independent voices. Play the annual sequence, or scrub to a year to hear that year's state."
            onSeek={handleSeek}
            onSpeed={handleSpeed}
            onStop={handleStop}
            onToggle={handleToggle}
            onVolume={handleVolume}
            playLabel="Play carbon sonification"
            playing={playing}
            progress={progress}
            speed={speed}
            startLabel={String(dataset.years[0])}
            stateLabel={stateLabel}
            stepCount={samples.length}
            stepIndex={stepIndex}
            stepLabel="Carbon year"
            stepText={`${current.year}, ${formatPpm(current.co2Ppm)}`}
            supported={audioSupported}
            title="Listen to the carbon system"
            volume={volume}
            audioError={audioError}
          />

          <section aria-labelledby="carbon-layers-title" className="carbon-layer-panel">
            <div className="panel-head">
              <h2 className="panel-title" id="carbon-layers-title">
                Sound layers
              </h2>
              <span className="panel-count">Five voices</span>
            </div>
            <LayerSwitches
              legend="Independent carbon layers"
              onChange={handleLayers}
              options={CARBON_LAYERS.map((layer) => ({
                id: layer.id,
                label: layer.label,
                detail: layer.sonification,
              }))}
              values={layers}
            />
            <p className="carbon-layer-note">
              Muting a layer stops its voice without changing the data or the
              other layers. Volume is shared so the combined system never clips.
            </p>
          </section>

          <CarbonCompare dataset={dataset} onHear={(year) => {
            const index = dataset.years.indexOf(year);
            void startAtYear(index, true);
          }} />
        </div>

        <aside className="instrument-rail">
          <CarbonReadingPanel
            announcement={announcement}
            live={!spoken}
            meta={dataset.meta}
            onFlow={setSelectedFlow}
            onSpeak={handleSpeak}
            onSpoken={handleSpoken}
            sample={current}
            selectedFlow={selectedFlow}
            speechReady={speechReady}
            spoken={spoken}
          />
          <CarbonDatasetRecord meta={dataset.meta} />
          <section aria-labelledby="carbon-access-title" className="rail-panel rail-access">
            <div className="panel-head">
              <h2 className="panel-title" id="carbon-access-title">
                Nonvisual path
              </h2>
              <a className="panel-link" href="/accessibility#carbon">
                Guide
              </a>
            </div>
            <p className="rail-access-copy">
              The selected year is printed in the transport and reading panel.
              Choose a flow button to hear its definition; the live region
              announces every fifth year, or use “Read this year aloud.”
            </p>
          </section>
        </aside>
      </div>

      <section aria-labelledby="carbon-encoding-title" className="pulse-section encoding-section">
        <div className="section-intro">
          <h2 id="carbon-encoding-title">Five voices, five distinct claims</h2>
          <p>
            The carbon system is not a single number. Concentration, emissions,
            ocean exchange, land uptake, and the accounting residual each have a
            separate source, unit, and sound.
          </p>
        </div>
        <dl className="encoding-rows">
          {CARBON_LAYERS.map((layer) => (
            <div className="encoding-row" key={layer.id}>
              <dt>
                <span>{layer.label}</span>
                <span className="encoding-arrow" aria-hidden="true">
                  →
                </span>
                <span className="encoding-sound">{layer.sonification}</span>
              </dt>
              <dd>
                {layer.scientific} <span className="carbon-limit">{layer.limitation}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
