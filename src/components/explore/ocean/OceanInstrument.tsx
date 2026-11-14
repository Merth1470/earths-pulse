"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { DatasetRecord } from "@/components/explore/ocean/DatasetRecord";
import { FieldBar } from "@/components/explore/ocean/FieldBar";
import { OceanCanvas } from "@/components/explore/ocean/OceanCanvas";
import { ReadingPanel } from "@/components/explore/ocean/ReadingPanel";
import { TransectDetails } from "@/components/explore/ocean/TransectDetails";
import { TransportControls } from "@/components/explore/ocean/TransportControls";
import { cancelSpeech, speakText } from "@/lib/accessibility/speech";
import { OceanSonifier, type SonifierLayers } from "@/lib/audio/sonifier";
import { useMediaQuery } from "@/lib/browser/useMediaQuery";
import {
  OceanDataError,
  buildTransect,
  describeSample,
  formatLatitude,
  formatLongitude,
  frameAt,
  loadOceanDataset,
} from "@/lib/ocean/dataset";
import { DEFAULT_TRANSECT, transectById } from "@/lib/ocean/regions";
import type {
  OceanDataset,
  TransectSample,
} from "@/lib/ocean/types";

const subscribeNoop = () => () => {};
const audioSupportedSnapshot = () =>
  typeof window !== "undefined" && "AudioContext" in window;
const speechSupportedSnapshot = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export function OceanInstrument() {
  const [dataset, setDataset] = useState<OceanDataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [transectId, setTransectId] = useState(DEFAULT_TRANSECT.id);
  const [layers, setLayers] = useState<SonifierLayers>({
    temperature: true,
    rhythm: true,
    texture: true,
  });
  const [volume, setVolume] = useState(0.75);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentSample, setCurrentSample] = useState<TransectSample | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [spoken, setSpoken] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const engineRef = useRef<OceanSonifier | null>(null);
  const spokenRef = useRef(false);
  const contextRef = useRef<{
    transect: typeof DEFAULT_TRANSECT;
    frame: ReturnType<typeof frameAt> | null;
    samples: TransectSample[];
  }>({ transect: DEFAULT_TRANSECT, frame: null, samples: [] });

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
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const activeTransect = transectById(transectId);

  useEffect(() => {
    let cancelled = false;
    loadOceanDataset()
      .then((loaded) => {
        if (!cancelled) setDataset(loaded);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof OceanDataError || error instanceof Error
            ? error.message
            : "The ocean field could not be loaded.";
        setLoadError(message);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const samples = useMemo(
    () =>
      dataset ? buildTransect(dataset, monthIndex, activeTransect) : [],
    [dataset, monthIndex, activeTransect],
  );

  const frame = dataset ? frameAt(dataset, monthIndex) : null;

  useEffect(() => {
    contextRef.current = {
      transect: activeTransect,
      frame,
      samples,
    };
  }, [activeTransect, frame, samples]);

  useEffect(() => {
    spokenRef.current = spoken;
  }, [spoken]);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const engine = new OceanSonifier();
      engine.setCallbacks({
        onStep: (sample, index) => {
          setCurrentSample(sample);
          setStepIndex(index);
          if (index % 4 === 0) {
            const context = contextRef.current;
            if (!context.frame) return;
            const text = describeSample(sample, context.transect, context.frame);
            setAnnouncement(text);
            if (spokenRef.current) speakText(text);
          }
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
  }, []);

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
      if (!snapshot.playing && snapshot.ended) {
        setPlaying(false);
        setEnded(true);
      }
    }, 120);
    return () => window.clearInterval(timer);
  }, [playing]);

  const resetPlayback = useCallback(() => {
    engineRef.current?.stop();
    setPlaying(false);
    setEnded(false);
    setProgress(0);
    setStepIndex(0);
    setCurrentSample(null);
    setAnnouncement("");
    setAudioError(null);
  }, []);

  const handleToggle = useCallback(async () => {
    if (!dataset) return;
    setAudioError(null);
    const engine = getEngine();

    if (playing) {
      engine.pause();
      setPlaying(false);
      return;
    }

    try {
      engine.configure({
        samples,
        ranges: dataset.meta.normalization,
        layers,
        volume,
        rate: speed,
      });
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
  }, [dataset, getEngine, layers, playing, samples, speed, volume]);

  const handleStop = useCallback(() => {
    resetPlayback();
  }, [resetPlayback]);

  const handleSeek = useCallback(
    (nextProgress: number) => {
      const clamped = Math.max(0, Math.min(1, nextProgress));
      const nextIndex = Math.min(
        Math.max(0, samples.length - 1),
        Math.floor(clamped * samples.length),
      );
      setProgress(clamped);
      setEnded(false);
      setStepIndex(nextIndex);
      if (engineRef.current) {
        engineRef.current.seek(clamped);
      } else {
        setCurrentSample(samples[nextIndex] ?? null);
      }
    },
    [samples],
  );

  const handleTransect = useCallback(
    (id: string) => {
      if (id === transectId) return;
      resetPlayback();
      setTransectId(id);
    },
    [resetPlayback, transectId],
  );

  const handleMonth = useCallback(
    (index: number) => {
      if (index === monthIndex) return;
      resetPlayback();
      setMonthIndex(index);
    },
    [monthIndex, resetPlayback],
  );

  const handleSpeed = useCallback((value: number) => {
    setSpeed(value);
    engineRef.current?.setRate(value);
  }, []);

  const handleVolume = useCallback((value: number) => {
    setVolume(value);
    engineRef.current?.setVolume(value);
  }, []);

  const handleLayers = useCallback((next: SonifierLayers) => {
    setLayers(next);
    engineRef.current?.setLayers(next);
  }, []);

  const handleSpoken = useCallback(
    (value: boolean) => {
      setSpoken(value);
      if (!value) {
        cancelSpeech();
        return;
      }
      const context = contextRef.current;
      if (!context.frame) return;
      const sample = currentSample ?? samples[0] ?? null;
      const text = describeSample(sample, context.transect, context.frame);
      setAnnouncement(text);
      speakText(text);
    },
    [currentSample, samples],
  );

  const handleSpeak = useCallback(() => {
    const context = contextRef.current;
    if (!context.frame) return;
    const sample = currentSample ?? samples[0] ?? null;
    const text = describeSample(sample, context.transect, context.frame);
    setAnnouncement(text);
    speakText(text);
  }, [currentSample, samples]);

  const retry = useCallback(() => {
    setDataset(null);
    setLoadError(null);
    setAttempt((value) => value + 1);
  }, []);

  const derivedIndex = Math.min(
    Math.max(0, samples.length - 1),
    Math.floor(progress * Math.max(1, samples.length)),
  );
  const readoutSample = currentSample ?? samples[derivedIndex] ?? null;
  const preview = !playing && !ended && progress === 0;
  const positionLabel = readoutSample
    ? `${formatLongitude(readoutSample.displayLon)} / ${formatLatitude(readoutSample.lat)}`
    : "—";

  if (!dataset || !frame) {
    return (
      <div className="ocean-instrument">
        <div className="instrument-grid">
          <div className="instrument-main">
            <div aria-busy={!loadError} className="ocean-plate loading-plate">
              <div className="ocean-plate-bar">
                <span className="ocean-plate-index">Field / Global</span>
                <span className="ocean-plate-kind">
                  {loadError ? "Field unavailable" : "Loading verified field"}
                </span>
                <span className="ocean-plate-dims">OSCAR + OISST</span>
              </div>
              <div className="loading-plate-body">
                {loadError ? (
                  <div className="load-error" role="alert">
                    <AlertTriangle aria-hidden="true" size={20} strokeWidth={1.5} />
                    <p className="load-error-title">The ocean field did not load</p>
                    <p>{loadError}</p>
                    <p className="load-error-note">
                      The 1.75 MB bundled subset is served from this site. Check
                      the connection and retry; no data is altered by a failed
                      request.
                    </p>
                    <button className="button-primary" onClick={retry} type="button">
                      <RefreshCw aria-hidden="true" size={13} strokeWidth={1.7} />
                      Retry field load
                    </button>
                  </div>
                ) : (
                  <div className="load-progress">
                    <span className="load-progress-kicker">
                      NOAA CoastWatch → 1.5° shared grid
                    </span>
                    <span className="load-progress-title">
                      Loading twelve monthly composites
                    </span>
                    <span aria-hidden="true" className="load-progress-bar">
                      <span />
                    </span>
                    <span className="load-progress-note">
                      1.75 MB · 240 × 106 cells per frame · missing cells
                      preserved
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="instrument-rail">
            <section className="rail-panel">
              <div className="panel-head">
                <h2 className="panel-title">Data record</h2>
                <span className="panel-count">Loading</span>
              </div>
              <p className="rail-placeholder">
                Source metadata appears once the bundled field is verified.
              </p>
            </section>
            <section className="rail-panel">
              <div className="panel-head">
                <h2 className="panel-title">Auditory encoding</h2>
              </div>
              <p className="rail-placeholder">
                Temperature becomes pitch, speed becomes pulse rate, and
                east–west flow becomes stereo position.
              </p>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="ocean-instrument">
      <FieldBar
        frames={dataset.meta.frames}
        monthIndex={monthIndex}
        onMonth={handleMonth}
        onTransect={handleTransect}
        transect={activeTransect}
      />

      <div className="instrument-grid">
        <div className="instrument-main">
          <OceanCanvas
            currentSample={readoutSample}
            dataset={dataset}
            monthIndex={monthIndex}
            playing={playing}
            progress={progress}
            reducedMotion={reducedMotion}
            transect={activeTransect}
          />

          <TransportControls
            audioError={audioError}
            ended={ended}
            layers={layers}
            onLayers={handleLayers}
            onSeek={handleSeek}
            onSpeed={handleSpeed}
            onStop={handleStop}
            onToggle={handleToggle}
            onVolume={handleVolume}
            playing={playing}
            positionLabel={positionLabel}
            progress={progress}
            speed={speed}
            stepCount={samples.length}
            stepIndex={stepIndex}
            supported={audioSupported}
            volume={volume}
          />
        </div>

        <aside className="instrument-rail">
          <ReadingPanel
            announcement={announcement}
            ended={ended}
            frame={frame}
            onSpeak={handleSpeak}
            onSpoken={handleSpoken}
            playing={playing}
            preview={preview}
            sample={readoutSample}
            speechReady={speechReady}
            spoken={spoken}
            stepCount={samples.length}
            stepIndex={stepIndex}
            transect={activeTransect}
          />
          <DatasetRecord meta={dataset.meta} />
          <section aria-labelledby="rail-access-title" className="rail-panel rail-access">
            <div className="panel-head">
              <h2 className="panel-title" id="rail-access-title">
                Nonvisual path
              </h2>
              <Link className="panel-link" href="/accessibility">
                Guide
              </Link>
            </div>
            <p className="rail-access-copy">
              Tab to the transport and press Play. The reading panel names every
              value; “Read this aloud” speaks it, and the trace table carries the
              same numbers. The field is usable without the canvas.
            </p>
          </section>
        </aside>
      </div>

      <TransectDetails
        frame={frame}
        samples={samples}
        transect={activeTransect}
      />
    </div>
  );
}
