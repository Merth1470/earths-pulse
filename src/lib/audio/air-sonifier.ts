import { mapAirSample, type AirSoundParameters } from "@/lib/air/mapping";
import { SILENT, makeNoiseBuffer, makePulseCurve, target } from "./primitives";
import type {
  AirLayerId,
  AirNormalization,
  AirSample,
} from "@/lib/air/types";

export type AirLayers = Record<AirLayerId, boolean>;

export interface AirSonifierSnapshot {
  playing: boolean;
  ended: boolean;
  progress: number;
  stepIndex: number;
  state: "idle" | "playing" | "paused" | "ended" | "error";
}

export interface AirSonifierCallbacks {
  onStep?: (sample: AirSample, index: number) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface AirSonifierConfig {
  samples: AirSample[];
  ranges: AirNormalization;
  layers: AirLayers;
  volume: number;
  rate: number;
}

const BASE_STEP_SECONDS = 0.55;

interface AirGraph {
  master: GainNode;
  compressor: DynamicsCompressorNode;
  pmNoise: AudioBufferSourceNode;
  pmFilter: BiquadFilterNode;
  pmGain: GainNode;
  pmPan: StereoPannerNode;
  no2Osc: OscillatorNode;
  no2Filter: BiquadFilterNode;
  no2Gain: GainNode;
  no2Pan: StereoPannerNode;
  no2Lfo: OscillatorNode;
  no2Shaper: WaveShaperNode;
  no2PulseDepth: GainNode;
  ozoneNoise: AudioBufferSourceNode;
  ozoneFilter: BiquadFilterNode;
  ozoneGain: GainNode;
  ozonePan: StereoPannerNode;
}

/**
 * Three air-quality voices:
 *
 *  PM2.5  low filtered haze
 *  NO2    reedy, concentration-driven pulse
 *  ozone  bright high band
 *
 * The selected city's longitude sets a stable stereo position. Missing
 * pollutant values silence their voice; they are never mapped to zero.
 */
export class AirSonifier {
  private context: AudioContext | null = null;
  private graph: AirGraph | null = null;
  private samples: AirSample[] = [];
  private ranges: AirNormalization | null = null;
  private layers: AirLayers = {
    pm25: true,
    no2: true,
    ozone: true,
  };
  private volume = 0.72;
  private stepDuration = BASE_STEP_SECONDS;
  private callbacks: AirSonifierCallbacks = {};
  private playing = false;
  private ended = false;
  private pausedSteps = 0;
  private anchorSteps = 0;
  private startedAt = 0;
  private scheduledStep = -1;
  private timer: number | null = null;
  private currentParams: AirSoundParameters | null = null;

  get supported(): boolean {
    return typeof window !== "undefined" && "AudioContext" in window;
  }

  configure(config: AirSonifierConfig) {
    this.samples = config.samples;
    this.ranges = config.ranges;
    this.layers = config.layers;
    this.volume = config.volume;
    this.stepDuration = BASE_STEP_SECONDS / Math.max(0.25, config.rate);
    this.ended = false;
    this.pausedSteps = Math.min(
      this.pausedSteps,
      Math.max(0, this.samples.length - 0.001),
    );
    this.scheduledStep = -1;
  }

  setCallbacks(callbacks: AirSonifierCallbacks) {
    this.callbacks = callbacks;
  }

  private ensureGraph() {
    if (this.context && this.graph) return;
    if (!this.supported) {
      throw new Error("This browser does not expose the Web Audio API.");
    }

    const context = new AudioContext({ latencyHint: "interactive" });
    const master = context.createGain();
    master.gain.value = 0;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.24;
    compressor.connect(master);
    master.connect(context.destination);

    const pmNoise = context.createBufferSource();
    pmNoise.buffer = makeNoiseBuffer(context);
    pmNoise.loop = true;
    const pmFilter = context.createBiquadFilter();
    pmFilter.type = "lowpass";
    pmFilter.frequency.value = 600;
    pmFilter.Q.value = 0.55;
    const pmGain = context.createGain();
    pmGain.gain.value = SILENT;
    const pmPan = context.createStereoPanner();
    pmPan.pan.value = 0;
    pmNoise.connect(pmFilter);
    pmFilter.connect(pmGain);
    pmGain.connect(pmPan);
    pmPan.connect(compressor);

    const no2Osc = context.createOscillator();
    no2Osc.type = "triangle";
    no2Osc.frequency.value = 190;
    const no2Filter = context.createBiquadFilter();
    no2Filter.type = "lowpass";
    no2Filter.frequency.value = 800;
    no2Filter.Q.value = 1.1;
    const no2Gain = context.createGain();
    no2Gain.gain.value = SILENT;
    const no2Pan = context.createStereoPanner();
    no2Pan.pan.value = 0;
    no2Osc.connect(no2Filter);
    no2Filter.connect(no2Gain);
    no2Gain.connect(no2Pan);
    no2Pan.connect(compressor);

    const no2Lfo = context.createOscillator();
    no2Lfo.type = "sine";
    no2Lfo.frequency.value = 1.1;
    const no2Shaper = context.createWaveShaper();
    no2Shaper.curve = makePulseCurve();
    no2Shaper.oversample = "2x";
    const no2PulseDepth = context.createGain();
    no2PulseDepth.gain.value = 0;
    no2Lfo.connect(no2Shaper);
    no2Shaper.connect(no2PulseDepth);
    no2PulseDepth.connect(no2Gain.gain);

    const ozoneNoise = context.createBufferSource();
    ozoneNoise.buffer = makeNoiseBuffer(context);
    ozoneNoise.loop = true;
    const ozoneFilter = context.createBiquadFilter();
    ozoneFilter.type = "bandpass";
    ozoneFilter.frequency.value = 1400;
    ozoneFilter.Q.value = 1.8;
    const ozoneGain = context.createGain();
    ozoneGain.gain.value = SILENT;
    const ozonePan = context.createStereoPanner();
    ozonePan.pan.value = 0;
    ozoneNoise.connect(ozoneFilter);
    ozoneFilter.connect(ozoneGain);
    ozoneGain.connect(ozonePan);
    ozonePan.connect(compressor);

    no2Osc.start();
    no2Lfo.start();
    pmNoise.start();
    ozoneNoise.start();

    this.context = context;
    this.graph = {
      master,
      compressor,
      pmNoise,
      pmFilter,
      pmGain,
      pmPan,
      no2Osc,
      no2Filter,
      no2Gain,
      no2Pan,
      no2Lfo,
      no2Shaper,
      no2PulseDepth,
      ozoneNoise,
      ozoneFilter,
      ozoneGain,
      ozonePan,
    };
  }

  private applyVolume(time: number) {
    if (!this.graph) return;
    const gain = this.playing
      ? Math.max(0, Math.min(1, this.volume)) * 0.74
      : 0;
    target(this.graph.master.gain, gain, time, 0.04);
  }

  private applySample(index: number, time: number) {
    if (!this.graph || !this.ranges) return;
    const sample = this.samples[index];
    if (!sample) return;
    const params = mapAirSample(sample, this.ranges);
    const graph = this.graph;
    this.currentParams = params;

    target(
      graph.pmGain.gain,
      this.layers.pm25 && params.hasPm25 ? params.pm25Gain : SILENT,
      time,
      0.14,
    );
    target(graph.pmFilter.frequency, params.pm25CutoffHz, time, 0.16);
    target(graph.pmPan.pan, params.pan, time, 0.1);

    target(graph.no2Osc.frequency, params.no2Hz, time, 0.14);
    target(graph.no2Filter.frequency, params.no2CutoffHz, time, 0.16);
    target(graph.no2Lfo.frequency, params.no2PulseHz, time, 0.14);
    target(
      graph.no2PulseDepth.gain,
      this.layers.no2 && params.hasNo2 ? params.no2Gain : SILENT,
      time,
      0.14,
    );
    target(graph.no2Pan.pan, params.pan, time, 0.1);

    target(
      graph.ozoneGain.gain,
      this.layers.ozone && params.hasOzone ? params.ozoneGain : SILENT,
      time,
      0.16,
    );
    target(graph.ozoneFilter.frequency, params.ozoneCutoffHz, time, 0.18);
    target(graph.ozonePan.pan, params.pan, time, 0.1);

    this.callbacks.onStep?.(sample, index);
  }

  private positionSteps(now: number): number {
    if (!this.playing) return this.pausedSteps;
    return this.anchorSteps + (now - this.startedAt) / this.stepDuration;
  }

  private tick = () => {
    if (!this.playing || !this.context) return;
    const now = this.context.currentTime;
    const steps = this.positionSteps(now);
    if (steps >= this.samples.length) {
      this.finish();
      return;
    }
    const step = Math.floor(steps);
    if (step > this.scheduledStep) {
      const from = Math.max(0, this.scheduledStep + 1);
      for (let index = from; index <= step; index += 1) {
        this.applySample(index, now + 0.01);
      }
      this.scheduledStep = step;
    }
  };

  private startTimer() {
    this.clearTimer();
    this.timer = window.setInterval(this.tick, 45);
  }

  private clearTimer() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  getSnapshot(): AirSonifierSnapshot {
    const length = Math.max(1, this.samples.length);
    const steps = this.context
      ? this.positionSteps(this.context.currentTime)
      : this.pausedSteps;
    const progress = this.ended
      ? 1
      : Math.max(0, Math.min(1, steps / length));
    const stepIndex = Math.max(
      0,
      Math.min(length - 1, Math.floor(progress * length)),
    );
    return {
      playing: this.playing,
      ended: this.ended,
      progress,
      stepIndex,
      state: this.playing
        ? "playing"
        : this.ended
          ? "ended"
          : progress > 0
            ? "paused"
            : "idle",
    };
  }

  async play(): Promise<void> {
    this.ensureGraph();
    const context = this.context;
    if (!context) return;
    if (this.samples.length < 2) {
      throw new Error("No air-quality hours are loaded.");
    }
    if (this.ended || this.pausedSteps >= this.samples.length - 0.001) {
      this.pausedSteps = 0;
      this.ended = false;
    }
    if (context.state === "suspended") await context.resume();
    this.anchorSteps = this.pausedSteps;
    this.startedAt = context.currentTime;
    this.scheduledStep = Math.floor(this.anchorSteps) - 1;
    this.playing = true;
    this.applyVolume(context.currentTime);
    this.tick();
    this.startTimer();
  }

  pause() {
    if (!this.playing || !this.context) return;
    this.pausedSteps = this.positionSteps(this.context.currentTime);
    this.playing = false;
    this.clearTimer();
    this.applyVolume(this.context.currentTime);
    void this.context.suspend();
  }

  stop() {
    this.playing = false;
    this.ended = false;
    this.pausedSteps = 0;
    this.scheduledStep = -1;
    this.clearTimer();
    if (this.context && this.graph) {
      const now = this.context.currentTime;
      for (const gain of [
        this.graph.pmGain.gain,
        this.graph.no2PulseDepth.gain,
        this.graph.ozoneGain.gain,
        this.graph.master.gain,
      ]) {
        target(gain, SILENT, now, 0.04);
      }
      void this.context.suspend();
    }
  }

  seek(progress: number) {
    const targetProgress = Math.max(0, Math.min(1, progress));
    const steps = targetProgress * Math.max(1, this.samples.length);
    this.pausedSteps = Math.min(steps, this.samples.length - 0.001);
    this.ended = false;
    if (this.playing && this.context) {
      this.startedAt =
        this.context.currentTime - this.pausedSteps * this.stepDuration;
      this.anchorSteps = 0;
      this.scheduledStep = Math.floor(this.pausedSteps) - 1;
      this.tick();
    } else {
      this.scheduledStep = -1;
      this.callbacks.onStep?.(
        this.samples[Math.floor(this.pausedSteps)],
        Math.floor(this.pausedSteps),
      );
    }
  }

  setLayers(layers: AirLayers) {
    this.layers = layers;
    if (this.context && this.playing && this.currentParams && this.graph) {
      const now = this.context.currentTime;
      const params = this.currentParams;
      target(
        this.graph.pmGain.gain,
        layers.pm25 && params.hasPm25 ? params.pm25Gain : SILENT,
        now,
        0.12,
      );
      target(
        this.graph.no2PulseDepth.gain,
        layers.no2 && params.hasNo2 ? params.no2Gain : SILENT,
        now,
        0.12,
      );
      target(
        this.graph.ozoneGain.gain,
        layers.ozone && params.hasOzone ? params.ozoneGain : SILENT,
        now,
        0.12,
      );
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.context) this.applyVolume(this.context.currentTime);
  }

  setRate(rate: number) {
    if (!this.context) {
      this.stepDuration = BASE_STEP_SECONDS / Math.max(0.25, rate);
      return;
    }
    const now = this.context.currentTime;
    const steps = this.positionSteps(now);
    this.stepDuration = BASE_STEP_SECONDS / Math.max(0.25, rate);
    if (this.playing) {
      this.anchorSteps = 0;
      this.startedAt = now - steps * this.stepDuration;
      this.scheduledStep = Math.floor(steps) - 1;
    }
  }

  private finish() {
    if (this.context && this.graph) {
      const now = this.context.currentTime;
      for (const gain of [
        this.graph.pmGain.gain,
        this.graph.no2PulseDepth.gain,
        this.graph.ozoneGain.gain,
        this.graph.master.gain,
      ]) {
        target(gain, SILENT, now, 0.12);
      }
    }
    this.playing = false;
    this.ended = true;
    this.pausedSteps = this.samples.length;
    this.clearTimer();
    this.callbacks.onEnd?.();
  }

  dispose() {
    this.clearTimer();
    this.playing = false;
    if (this.graph && this.context) {
      const graph = this.graph;
      const context = this.context;
      try {
        graph.no2Osc.stop();
        graph.no2Lfo.stop();
        graph.pmNoise.stop();
        graph.ozoneNoise.stop();
      } catch {
        // A source may already have stopped; disposal continues.
      }
      try {
        graph.compressor.disconnect();
        graph.master.disconnect();
        void context.close();
      } catch {
        // Closing an already-closed context is harmless.
      }
    }
    this.graph = null;
    this.context = null;
  }
}
