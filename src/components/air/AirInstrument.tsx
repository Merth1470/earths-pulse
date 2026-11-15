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

import { AirCompare } from "@/components/air/AirCompare";
import { AirDatasetRecord } from "@/components/air/AirDatasetRecord";
import { AirMap } from "@/components/air/AirMap";
import { AirReadingPanel } from "@/components/air/AirReadingPanel";
import { AirTimeline } from "@/components/air/AirTimeline";
import { LayerSwitches } from "@/components/audio/LayerSwitches";
import { TransportBar } from "@/components/audio/TransportBar";
import { cancelSpeech, speakText } from "@/lib/accessibility/speech";
import { AirSonifier, type AirLayers } from "@/lib/audio/air-sonifier";
import {
  AIR_LAYERS,
  AIR_POLLUTANT_IDS,
  AIR_POLLUTANT_SHORT,
  airCityById,
  airDayIndex,
  airDayStartHour,
  airHourOfDay,
  airSampleAt,
  airTimeAt,
  airTimestampLabel,
  describeAirSample,
  formatAirValue,
  loadAirDataset,
} from "@/lib/air/dataset";
import type { AirPollutantId, AirSample } from "@/lib/air/types";
import { useDataset } from "@/lib/browser/useDataset";

const subscribeNoop = () => () => {};
const audioSupportedSnapshot = () =>
  typeof window !== "undefined" && "AudioContext" in window;
const speechSupportedSnapshot = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const DEFAULT_CITY = "new-york";
const DEFAULT_COMPARE = "los-angeles";
const DEFAULT_DAY = 195; // 15 July 2023
const DEFAULT_HOUR = 18;
const DEFAULT_HOUR_INDEX = DEFAULT_DAY * 24 + DEFAULT_HOUR;

const DEFAULT_LAYERS: AirLayers = {
  pm25: true,
  no2: true,
  ozone: true,
};

export function AirInstrument() {
  const { data: dataset, error: loadError, loading, retry } = useDataset(loadAirDataset);
  const [cityId, setCityId] = useState(DEFAULT_CITY);
  const [compareCityId, setCompareCityId] = useState<string | null>(DEFAULT_COMPARE);
  const [hourIndex, setHourIndex] = useState(DEFAULT_HOUR_INDEX);
  const [pollutant, setPollutant] = useState<AirPollutantId>("pm25");
  const [layers, setLayers] = useState<AirLayers>(DEFAULT_LAYERS);
  const [volume, setVolume] = useState(0.72);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(DEFAULT_HOUR);
  const [spoken, setSpoken] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [audioError, setAudioError] = useState<string | null>(null);

  const engineRef = useRef<AirSonifier | null>(null);
  const spokenRef = useRef(false);
  const announcedRef = useRef(-1);

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

  const city = dataset ? airCityById(dataset, cityId) : null;
  const compareCity = dataset && compareCityId
    ? airCityById(dataset, compareCityId)
    : null;
  const day = airDayIndex(hourIndex);
  const hour = airHourOfDay(hourIndex);
  const current = dataset && city ? airSampleAt(dataset, city, hourIndex) : null;

  const daySamples = useMemo(
    () =>
      dataset && city
        ? Array.from({ length: 24 }, (_, index) =>
            airSampleAt(dataset, city, airDayStartHour(day) + index),
          )
        : [],
    [city, dataset, day],
  );

  const validPollutantHours = city
    ? city.series[pollutant].slice(day * 24, day * 24 + 24).filter((value) => value !== null).length
    : 0;

  useEffect(() => {
    spokenRef.current = spoken;
  }, [spoken]);

  const announce = useCallback((value: AirSample, force = false) => {
    if (!force && announcedRef.current === value.hourIndex) return;
    announcedRef.current = value.hourIndex;
    const text = describeAirSample(value);
    setAnnouncement(text);
    if (spokenRef.current) speakText(text);
  }, []);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const engine = new AirSonifier();
      engine.setCallbacks({
        onStep: (next, index) => {
          setHourIndex(next.hourIndex);
          setStepIndex(index);
          setProgress(24 > 1 ? index / 23 : 0);
          if (index % 4 === 0) announce(next);
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
  }, [announce]);

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
    setStepIndex(airHourOfDay(hourIndex));
    setAnnouncement("");
    setAudioError(null);
  }, [hourIndex]);

  const handleCity = useCallback(
    (nextId: string) => {
      if (!dataset || nextId === cityId) return;
      resetPlayback();
      if (nextId === compareCityId) {
        setCompareCityId(cityId);
      }
      setCityId(nextId);
      announcedRef.current = -1;
      const nextCity = airCityById(dataset, nextId);
      announce(airSampleAt(dataset, nextCity, hourIndex), true);
    },
    [announce, cityId, compareCityId, dataset, hourIndex, resetPlayback],
  );

  const handleDay = useCallback(
    (nextDay: number) => {
      resetPlayback();
      const nextHour = airDayStartHour(nextDay) + hour;
      setHourIndex(nextHour);
      announcedRef.current = -1;
      if (dataset && city) announce(airSampleAt(dataset, city, nextHour), true);
    },
    [announce, city, dataset, hour, resetPlayback],
  );

  const handleHour = useCallback(
    (nextHourIndex: number) => {
      const next = Math.max(0, Math.min(8759, nextHourIndex));
      setHourIndex(next);
      setStepIndex(airHourOfDay(next));
      if (engineRef.current) {
        engineRef.current.seek(airHourOfDay(next) / 23);
      }
      if (dataset && city) announce(airSampleAt(dataset, city, next), true);
    },
    [announce, city, dataset],
  );

  const startDay = useCallback(async () => {
    if (!dataset || !city || !daySamples.length) return;
    setAudioError(null);
    const engine = getEngine();
    engine.configure({
      samples: daySamples,
      ranges: dataset.meta.normalization,
      layers,
      volume,
      rate: speed,
    });
    engine.seek(stepIndex / 23);
    try {
      await engine.play();
      setPlaying(true);
      setEnded(false);
    } catch (error) {
      setAudioError(
        error instanceof Error
          ? error.message
          : "Audio could not start in this browser.",
      );
      setPlaying(false);
    }
  }, [city, dataset, daySamples, getEngine, layers, speed, stepIndex, volume]);

  const handleToggle = useCallback(async () => {
    if (playing) {
      engineRef.current?.pause();
      setPlaying(false);
      return;
    }
    await startDay();
  }, [playing, startDay]);

  const handleStop = useCallback(() => {
    resetPlayback();
    setHourIndex(day * 24);
    setStepIndex(0);
    setProgress(0);
  }, [day, resetPlayback]);

  const handleSeek = useCallback(
    (nextProgress: number) => {
      const clamped = Math.max(0, Math.min(1, nextProgress));
      const nextHour = Math.max(0, Math.min(23, Math.floor(clamped * 24)));
      const nextIndex = day * 24 + nextHour;
      setProgress(clamped);
      setEnded(false);
      setHourIndex(nextIndex);
      setStepIndex(nextHour);
      if (engineRef.current) engineRef.current.seek(clamped);
      if (dataset && city) announce(airSampleAt(dataset, city, nextIndex), true);
    },
    [announce, city, dataset, day],
  );

  const handleSpeed = useCallback((value: number) => {
    setSpeed(value);
    engineRef.current?.setRate(value);
  }, []);

  const handleVolume = useCallback((value: number) => {
    setVolume(value);
    engineRef.current?.setVolume(value);
  }, []);

  const handleLayers = useCallback((next: AirLayers) => {
    setLayers(next);
    engineRef.current?.setLayers(next);
  }, []);

  const handleSpoken = useCallback((value: boolean) => {
    setSpoken(value);
    if (!value) {
      cancelSpeech();
      return;
    }
    if (current) {
      const text = describeAirSample(current);
      setAnnouncement(text);
      speakText(text);
    }
  }, [current]);

  const handleSpeak = useCallback(() => {
    if (!current) return;
    const text = describeAirSample(current);
    setAnnouncement(text);
    speakText(text);
  }, [current]);

  if (!dataset || loading || !city || !current) {
    return (
      <div className="ocean-instrument">
        <div className="ocean-plate loading-plate">
          <div className="ocean-plate-bar">
            <span className="ocean-plate-index">Cities / US</span>
            <span className="ocean-plate-kind">Loading ground monitors</span>
            <span className="ocean-plate-dims">EPA AQS · 2023</span>
          </div>
          <div className="loading-plate-body">
            {loadError ? (
              <div className="load-error" role="alert">
                <AlertTriangle aria-hidden="true" size={20} strokeWidth={1.5} />
                <p className="load-error-title">The air-quality record did not load</p>
                <p>{loadError}</p>
                <button className="button-primary" onClick={retry} type="button">
                  <RefreshCw aria-hidden="true" size={13} strokeWidth={1.7} />
                  Retry air-quality record
                </button>
              </div>
            ) : (
              <div className="load-progress">
                <span className="load-progress-kicker">
                  EPA AirData → 8 co-located monitors
                </span>
                <span className="load-progress-title">
                  Loading 8,760 hourly records
                </span>
                <span aria-hidden="true" className="load-progress-bar">
                  <span />
                </span>
                <span className="load-progress-note">
                  PM2.5 · NO₂ · O₃ · missing hours preserved
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stateLabel = playing
    ? "Running"
    : ended
      ? "Complete"
      : progress > 0
        ? "Paused"
        : "Ready";
  const timestamp = airTimeAt(dataset, current.hourIndex);

  return (
    <div className="air-instrument">
      <div className="air-field-bar">
        <label className="field-control" htmlFor="air-city">
          <span>City</span>
          <select
            id="air-city"
            onChange={(event) => handleCity(event.currentTarget.value)}
            value={city.id}
          >
            {dataset.cities.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}, {option.state}
              </option>
            ))}
          </select>
        </label>
        <label className="field-control">
          <span>Compare</span>
          <select
            onChange={(event) => {
              const value = event.currentTarget.value;
              setCompareCityId(value || null);
            }}
            value={compareCity?.id ?? ""}
          >
            <option value="">No comparison</option>
            {dataset.cities
              .filter((option) => option.id !== city.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}, {option.state}
                </option>
              ))}
          </select>
        </label>
        <label className="field-control" htmlFor="air-pollutant">
          <span>Highlight pollutant</span>
          <select
            id="air-pollutant"
            onChange={(event) =>
              setPollutant(event.currentTarget.value as AirPollutantId)
            }
            value={pollutant}
          >
            {AIR_POLLUTANT_IDS.map((id) => (
              <option key={id} value={id}>
                {AIR_POLLUTANT_SHORT[id]}
              </option>
            ))}
          </select>
        </label>
        <p className="air-field-hint">
          Select a city, then an hour. Marker size and the sound both follow
          the selected pollutant. West is left; east is right.
        </p>
      </div>

      <div className="instrument-grid air-grid">
        <div className="instrument-main">
          <section aria-labelledby="air-map-heading" className="ocean-plate air-plate">
            <div className="ocean-plate-bar">
              <span className="ocean-plate-index" id="air-map-heading">
                Cities / US
              </span>
              <span className="ocean-plate-kind">Ground monitors · 2023</span>
              <span className="ocean-plate-dims">8 cities · 8,760 hours</span>
            </div>
            <AirMap
              city={city}
              compareCity={compareCity}
              dataset={dataset}
              hourIndex={current.hourIndex}
              onSelect={handleCity}
              pollutant={pollutant}
            />
            <p className="ocean-plate-caption">
              <span>
                Markers sit at monitor coordinates, not city centres. The map is
                an equirectangular crop of the contiguous US and Great Lakes
                region; it is not a satellite image or a continuous pollution
                surface.
              </span>
              <span className="ocean-plate-credit">
                EPA AQS · {airTimestampLabel(timestamp)}
              </span>
            </p>
          </section>

          <AirTimeline
            dataset={dataset}
            hourIndex={current.hourIndex}
            onDay={handleDay}
            onHour={handleHour}
            validHours={validPollutantHours}
          />

          <TransportBar
            canStop={playing || progress > 0}
            endLabel="23:00"
            fineprint="The 24-hour sequence uses the actual hourly samples. Missing hours stay silent and are named in the reading."
            metrics={[
              { label: "City", value: city.name },
              { label: "Pollutant", value: AIR_POLLUTANT_SHORT[pollutant] },
              { label: "Time", value: `${String(hour).padStart(2, "0")}:00 UTC` },
            ]}
            note="Play the selected day hour by hour. The map, reading panel, and stereo position share one timestamp."
            onSeek={handleSeek}
            onSpeed={handleSpeed}
            onStop={handleStop}
            onToggle={handleToggle}
            onVolume={handleVolume}
            playLabel="Play city sonification"
            playing={playing}
            progress={progress}
            speed={speed}
            startLabel="00:00"
            stateLabel={stateLabel}
            stepCount={24}
            stepIndex={stepIndex}
            stepLabel="Hour of day"
            stepText={`${String(hour).padStart(2, "0")}:00 UTC, ${formatAirValue(
              pollutant,
              current.values[pollutant],
            )}`}
            supported={audioSupported}
            title="Listen to the city"
            volume={volume}
            audioError={audioError}
          />

          <section aria-labelledby="air-layers-title" className="carbon-layer-panel">
            <div className="panel-head">
              <h2 className="panel-title" id="air-layers-title">
                Pollutant layers
              </h2>
              <span className="panel-count">Three voices</span>
            </div>
            <LayerSwitches
              legend="Independent pollutant layers"
              onChange={handleLayers}
              options={AIR_LAYERS.map((layer) => ({
                id: layer.id,
                label: layer.label,
                detail: layer.sonification,
              }))}
              values={layers}
            />
            <p className="carbon-layer-note">
              Pollutant units differ, so each voice has its own normalized
              scale. Muting a layer removes its sound, not its measurement.
            </p>
          </section>

          <AirCompare
            city={city}
            compareCity={compareCity}
            dataset={dataset}
            hourIndex={current.hourIndex}
            onCompare={(next) => setCompareCityId(next || null)}
            onSelect={handleCity}
          />
        </div>

        <aside className="instrument-rail">
          <AirReadingPanel
            announcement={announcement}
            live={!spoken}
            meta={dataset.meta}
            onSpeak={handleSpeak}
            onSpoken={handleSpoken}
            pollutant={pollutant}
            sample={current}
            speechReady={speechReady}
            spoken={spoken}
          />
          <AirDatasetRecord meta={dataset.meta} />
          <section aria-labelledby="air-access-title" className="rail-panel rail-access">
            <div className="panel-head">
              <h2 className="panel-title" id="air-access-title">
                Nonvisual path
              </h2>
              <a className="panel-link" href="/accessibility#air">
                Guide
              </a>
            </div>
            <p className="rail-access-copy">
              Choose a city and hour with the selects and sliders. The reading
              panel names the monitor, timestamp, all three measurements, units,
              and measurement type. The live region announces every fourth hour,
              or use “Read this hour aloud.”
            </p>
          </section>
        </aside>
      </div>

      <section aria-labelledby="air-encoding-title" className="pulse-section encoding-section">
        <div className="section-intro">
          <h2 id="air-encoding-title">The map is a control, not the measurement</h2>
          <p>
            A marker and a stereo position help you choose a place. The numbers
            come from a ground monitor, at a named UTC hour, in the pollutant&apos;s
            own unit. No value is interpolated between stations or hours.
          </p>
        </div>
        <dl className="encoding-rows">
          {AIR_LAYERS.map((layer) => (
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
