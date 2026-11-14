import { mapSample, type SonificationRanges, type SoundParameters } from "./mapping";
import type { TransectSample } from "@/lib/ocean/types";

export interface SonifierLayers {
  temperature: boolean;
  rhythm: boolean;
  texture: boolean;
}

export interface SonifierSnapshot {
  playing: boolean;
  ended: boolean;
  /** 0–1 along the transect. */
  progress: number;
  stepIndex: number;
  state: "idle" | "playing" | "paused" | "ended" | "error";
}

export interface SonifierCallbacks {
  onStep?: (sample: TransectSample, index: number) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface SonifierConfig {
  samples: TransectSample[];
  ranges: SonificationRanges;
  layers: SonifierLayers;
  volume: number;
  rate: number;
}

const BASE_STEP_SECONDS = 0.8;
const SILENT = 0.0001;

interface VoiceGraph {
  master: GainNode;
  compressor: DynamicsCompressorNode;
  toneOscA: OscillatorNode;
  toneOscB: OscillatorNode;
  toneFilter: BiquadFilterNode;
  toneGain: GainNode;
  tonePan: StereoPannerNode;
  pulseOsc: OscillatorNode;
  pulseFilter: BiquadFilterNode;
  pulseGain: GainNode;
  pulsePan: StereoPannerNode;
  pulseLfo: OscillatorNode;
  pulseShaper: WaveShaperNode;
  pulseDepth: GainNode;
  noise: AudioBufferSourceNode;
  textureFilter: BiquadFilterNode;
  textureGain: GainNode;
  texturePan: StereoPannerNode;
}

function target(param: AudioParam, value: number, time: number, constant = 0.08) {
  if (!Number.isFinite(value)) return;
  param.setTargetAtTime(value, Math.max(time, 0), constant);
}

function makePulseCurve(): Float32Array<ArrayBuffer> {
  const length = 1024;
  const curve = new Float32Array(new ArrayBuffer(length * 4));
  for (let i = 0; i < length; i += 1) {
    const x = (i / (length - 1)) * 2 - 1;
    const positive = Math.max(0, x);
    curve[i] = positive * positive;
  }
  return curve;
}

/** Deterministic noise so the same data and settings sound the same. */
function makeNoiseBuffer(context: AudioContext): AudioBuffer {
  const length = Math.floor(context.sampleRate * 2);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0x6d2b79f5;
  let smooth = 0;
  for (let i = 0; i < length; i += 1) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const white = ((seed >>> 0) / 0x100000000) * 2 - 1;
    smooth = smooth * 0.985 + white * 0.015;
    data[i] = Math.max(-1, Math.min(1, smooth * 6));
  }
  return buffer;
}

/**
 * A small Web Audio instrument with three voices:
 * a temperature tone, a speed-driven pulse, and a flow-texture bed.
 *
 * It owns the audio graph and schedules nothing outside the class. Every
 * oscillator and noise source is stopped and disconnected in dispose().
 */
export class OceanSonifier {
  private context: AudioContext | null = null;
  private graph: VoiceGraph | null = null;
  private samples: TransectSample[] = [];
  private ranges: SonificationRanges = {
    sst: { min: 0, max: 30 },
    speed: { min: 0, max: 1 },
  };
  private layers: SonifierLayers = {
    temperature: true,
    rhythm: true,
    texture: true,
  };
  private volume = 0.8;
  private stepDuration = BASE_STEP_SECONDS;

  private callbacks: SonifierCallbacks = {};
  private playing = false;
  private ended = false;
  private pausedSteps = 0;
  private anchorSteps = 0;
  private startedAt = 0;
  private scheduledStep = -1;
  private timer: number | null = null;
  private currentParams: SoundParameters | null = null;

  get supported(): boolean {
    return typeof window !== "undefined" && "AudioContext" in window;
  }

  configure(config: SonifierConfig) {
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

  setCallbacks(callbacks: SonifierCallbacks) {
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
    compressor.threshold.value = -20;
    compressor.knee.value = 24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.22;

    compressor.connect(master);
    master.connect(context.destination);

    const toneMix = context.createGain();
    toneMix.gain.value = 0.5;
    const toneOscA = context.createOscillator();
    toneOscA.type = "sine";
    toneOscA.frequency.value = 220;
    const toneOscB = context.createOscillator();
    toneOscB.type = "triangle";
    toneOscB.frequency.value = 220.9;
    toneOscA.connect(toneMix);
    toneOscB.connect(toneMix);

    const toneFilter = context.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 600;
    toneFilter.Q.value = 0.7;

    const toneGain = context.createGain();
    toneGain.gain.value = SILENT;

    const tonePan = context.createStereoPanner();
    tonePan.pan.value = 0;

    toneMix.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(tonePan);
    tonePan.connect(compressor);

    const pulseOsc = context.createOscillator();
    pulseOsc.type = "triangle";
    pulseOsc.frequency.value = 110;
    const pulseFilter = context.createBiquadFilter();
    pulseFilter.type = "lowpass";
    pulseFilter.frequency.value = 1200;
    pulseFilter.Q.value = 0.9;
    const pulseGain = context.createGain();
    pulseGain.gain.value = 0.002;
    const pulsePan = context.createStereoPanner();
    pulsePan.pan.value = 0;

    pulseOsc.connect(pulseFilter);
    pulseFilter.connect(pulseGain);
    pulseGain.connect(pulsePan);
    pulsePan.connect(compressor);

    const pulseLfo = context.createOscillator();
    pulseLfo.type = "sine";
    pulseLfo.frequency.value = 1;
    const pulseShaper = context.createWaveShaper();
    pulseShaper.curve = makePulseCurve();
    pulseShaper.oversample = "2x";
    const pulseDepth = context.createGain();
    pulseDepth.gain.value = 0;
    pulseLfo.connect(pulseShaper);
    pulseShaper.connect(pulseDepth);
    pulseDepth.connect(pulseGain.gain);

    const noise = context.createBufferSource();
    noise.buffer = makeNoiseBuffer(context);
    noise.loop = true;
    const textureFilter = context.createBiquadFilter();
    textureFilter.type = "bandpass";
    textureFilter.frequency.value = 400;
    textureFilter.Q.value = 0.6;
    const textureGain = context.createGain();
    textureGain.gain.value = SILENT;
    const texturePan = context.createStereoPanner();
    texturePan.pan.value = 0;

    noise.connect(textureFilter);
    textureFilter.connect(textureGain);
    textureGain.connect(texturePan);
    texturePan.connect(compressor);

    toneOscA.start();
    toneOscB.start();
    pulseOsc.start();
    pulseLfo.start();
    noise.start();

    this.context = context;
    this.graph = {
      master,
      compressor,
      toneOscA,
      toneOscB,
      toneFilter,
      toneGain,
      tonePan,
      pulseOsc,
      pulseFilter,
      pulseGain,
      pulsePan,
      pulseLfo,
      pulseShaper,
      pulseDepth,
      noise,
      textureFilter,
      textureGain,
      texturePan,
    };
  }

  private applyVolume(time: number) {
    if (!this.graph) return;
    const gain = this.playing ? Math.max(0, Math.min(1, this.volume)) * 0.9 : 0;
    target(this.graph.master.gain, gain, time, 0.04);
  }

  private applySample(index: number, time: number) {
    if (!this.graph || !this.context) return;
    const sample = this.samples[index];
    if (!sample) return;

    const params = mapSample(sample, this.ranges);
    this.currentParams = params;
    const graph = this.graph;

    if (params) {
      target(graph.toneOscA.frequency, params.toneHz, time, 0.06);
      target(graph.toneOscB.frequency, params.toneHz * 1.004, time, 0.06);
      target(graph.toneFilter.frequency, params.toneCutoffHz, time, 0.08);
      target(
        graph.toneGain.gain,
        this.layers.temperature && params.hasTemperature ? 0.105 : SILENT,
        time,
        0.08,
      );
      target(graph.tonePan.pan, params.pan, time, 0.06);

      target(graph.pulseOsc.frequency, params.pulseHz, time, 0.07);
      target(graph.pulseLfo.frequency, params.pulseRateHz, time, 0.12);
      target(
        graph.pulseDepth.gain,
        this.layers.rhythm && params.hasFlow ? params.pulseDepth : SILENT,
        time,
        0.1,
      );
      target(graph.pulsePan.pan, params.pan, time, 0.06);

      target(
        graph.textureGain.gain,
        this.layers.texture && params.hasFlow ? params.textureGain : SILENT,
        time,
        0.1,
      );
      target(graph.textureFilter.frequency, params.textureCutoffHz, time, 0.12);
      target(graph.texturePan.pan, params.pan, time, 0.06);
    } else {
      target(graph.toneGain.gain, SILENT, time, 0.12);
      target(graph.pulseDepth.gain, SILENT, time, 0.12);
      target(graph.textureGain.gain, SILENT, time, 0.12);
    }

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

  getSnapshot(): SonifierSnapshot {
    const length = Math.max(1, this.samples.length);
    const steps = this.context ? this.positionSteps(this.context.currentTime) : this.pausedSteps;
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
      state: this.playing ? "playing" : this.ended ? "ended" : progress > 0 ? "paused" : "idle",
    };
  }

  async play(): Promise<void> {
    this.ensureGraph();
    const context = this.context;
    if (!context) return;

    if (this.samples.length < 2) {
      throw new Error("No transect samples are loaded.");
    }

    if (this.ended || this.pausedSteps >= this.samples.length - 0.001) {
      this.pausedSteps = 0;
      this.ended = false;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    this.anchorSteps = this.pausedSteps;
    this.startedAt = context.currentTime;
    this.scheduledStep = Math.floor(this.anchorSteps) - 1;
    this.playing = true;
    this.applyVolume(context.currentTime);
    this.tick();
    this.startTimer();
  }

  async resume(): Promise<void> {
    await this.play();
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
      for (const voice of [
        this.graph.toneGain.gain,
        this.graph.pulseDepth.gain,
        this.graph.textureGain.gain,
        this.graph.master.gain,
      ]) {
        target(voice, SILENT, now, 0.04);
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
      this.startedAt = this.context.currentTime - this.pausedSteps * this.stepDuration;
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

  setLayers(layers: SonifierLayers) {
    this.layers = layers;
    if (this.context && this.playing) {
      const index = Math.floor(this.positionSteps(this.context.currentTime));
      const sample = this.samples[index];
      if (sample) {
        const params = this.currentParams ?? mapSample(sample, this.ranges);
        if (this.graph && params) {
          const now = this.context.currentTime;
          target(
            this.graph.toneGain.gain,
            layers.temperature && params.hasTemperature ? 0.105 : SILENT,
            now,
            0.08,
          );
          target(
            this.graph.pulseDepth.gain,
            layers.rhythm && params.hasFlow ? params.pulseDepth : SILENT,
            now,
            0.1,
          );
          target(
            this.graph.textureGain.gain,
            layers.texture && params.hasFlow ? params.textureGain : SILENT,
            now,
            0.1,
          );
        }
      }
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
      target(this.graph.toneGain.gain, SILENT, now, 0.1);
      target(this.graph.pulseDepth.gain, SILENT, now, 0.1);
      target(this.graph.textureGain.gain, SILENT, now, 0.1);
      target(this.graph.master.gain, SILENT, now, 0.12);
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
        graph.toneOscA.stop();
        graph.toneOscB.stop();
        graph.pulseOsc.stop();
        graph.pulseLfo.stop();
        graph.noise.stop();
      } catch {
        // A node may already have stopped; disposal continues.
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
