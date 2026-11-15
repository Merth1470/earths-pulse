import {
  mapCarbonYear,
  type CarbonSoundParameters,
} from "@/lib/carbon/mapping";
import { SILENT, makeNoiseBuffer, makePulseCurve, target } from "./primitives";
import type {
  CarbonLayerId,
  CarbonNormalization,
  CarbonYear,
} from "@/lib/carbon/types";

export type CarbonLayers = Record<CarbonLayerId, boolean>;

export interface CarbonSonifierSnapshot {
  playing: boolean;
  ended: boolean;
  progress: number;
  stepIndex: number;
  state: "idle" | "playing" | "paused" | "ended" | "error";
}

export interface CarbonSonifierCallbacks {
  onStep?: (sample: CarbonYear, index: number) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface CarbonSonifierConfig {
  samples: CarbonYear[];
  ranges: CarbonNormalization;
  layers: CarbonLayers;
  volume: number;
  rate: number;
}

const BASE_STEP_SECONDS = 1.1;

interface CarbonGraph {
  master: GainNode;
  compressor: DynamicsCompressorNode;
  atmosphereOscA: OscillatorNode;
  atmosphereOscB: OscillatorNode;
  atmosphereFilter: BiquadFilterNode;
  atmosphereGain: GainNode;
  atmospherePan: StereoPannerNode;
  atmosphereLfo: OscillatorNode;
  atmosphereLfoDepth: GainNode;
  fossilOsc: OscillatorNode;
  fossilFilter: BiquadFilterNode;
  fossilGain: GainNode;
  fossilPan: StereoPannerNode;
  fossilLfo: OscillatorNode;
  fossilShaper: WaveShaperNode;
  fossilPulseDepth: GainNode;
  landUseOsc: OscillatorNode;
  landUseFilter: BiquadFilterNode;
  landUseGain: GainNode;
  landUsePan: StereoPannerNode;
  landUseLfo: OscillatorNode;
  landUseShaper: WaveShaperNode;
  landUsePulseDepth: GainNode;
  oceanNoise: AudioBufferSourceNode;
  oceanFilter: BiquadFilterNode;
  oceanGain: GainNode;
  oceanPan: StereoPannerNode;
  oceanSwell: OscillatorNode;
  oceanSwellDepth: GainNode;
  landNoise: AudioBufferSourceNode;
  landFilter: BiquadFilterNode;
  landGain: GainNode;
  landPan: StereoPannerNode;
  balanceOsc: OscillatorNode;
  balanceGain: GainNode;
  balancePan: StereoPannerNode;
}

/**
 * Five distinguishable carbon voices:
 *
 *  atmosphere  sustained harmonic; pitch = concentration, tremolo = change
 *  emissions   two rhythmic pulses; rate = fossil and land-use emissions
 *  ocean       filtered tide; magnitude and direction = net ocean flux
 *  land        higher band; magnitude and direction = net land flux
 *  balance     low anchor; magnitude = accounting residual
 *
 * The graph is owned by this class and every source is stopped in dispose().
 */
export class CarbonSonifier {
  private context: AudioContext | null = null;
  private graph: CarbonGraph | null = null;
  private samples: CarbonYear[] = [];
  private ranges: CarbonNormalization | null = null;
  private layers: CarbonLayers = {
    atmosphere: true,
    emissions: true,
    ocean: true,
    land: true,
    balance: true,
  };
  private volume = 0.72;
  private stepDuration = BASE_STEP_SECONDS;
  private callbacks: CarbonSonifierCallbacks = {};
  private playing = false;
  private ended = false;
  private pausedSteps = 0;
  private anchorSteps = 0;
  private startedAt = 0;
  private scheduledStep = -1;
  private timer: number | null = null;
  private currentParams: CarbonSoundParameters | null = null;

  get supported(): boolean {
    return typeof window !== "undefined" && "AudioContext" in window;
  }

  configure(config: CarbonSonifierConfig) {
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

  setCallbacks(callbacks: CarbonSonifierCallbacks) {
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
    compressor.attack.value = 0.005;
    compressor.release.value = 0.25;
    compressor.connect(master);
    master.connect(context.destination);

    // Atmosphere: two detuned oscillators, a low-pass, and a slow tremolo.
    const atmosphereOscA = context.createOscillator();
    atmosphereOscA.type = "sine";
    atmosphereOscA.frequency.value = 146;
    const atmosphereOscB = context.createOscillator();
    atmosphereOscB.type = "triangle";
    atmosphereOscB.frequency.value = 146.7;
    const atmosphereFilter = context.createBiquadFilter();
    atmosphereFilter.type = "lowpass";
    atmosphereFilter.frequency.value = 600;
    atmosphereFilter.Q.value = 0.65;
    const atmosphereGain = context.createGain();
    atmosphereGain.gain.value = SILENT;
    const atmospherePan = context.createStereoPanner();
    atmospherePan.pan.value = 0;
    atmosphereOscA.connect(atmosphereFilter);
    atmosphereOscB.connect(atmosphereFilter);
    atmosphereFilter.connect(atmosphereGain);
    atmosphereGain.connect(atmospherePan);
    atmospherePan.connect(compressor);

    const atmosphereLfo = context.createOscillator();
    atmosphereLfo.type = "sine";
    atmosphereLfo.frequency.value = 0.1;
    const atmosphereLfoDepth = context.createGain();
    atmosphereLfoDepth.gain.value = 0.014;
    atmosphereLfo.connect(atmosphereLfoDepth);
    atmosphereLfoDepth.connect(atmosphereGain.gain);

    // Fossil emissions: a regular pulse, no pitched data claim.
    const fossilOsc = context.createOscillator();
    fossilOsc.type = "triangle";
    fossilOsc.frequency.value = 96;
    const fossilFilter = context.createBiquadFilter();
    fossilFilter.type = "lowpass";
    fossilFilter.frequency.value = 900;
    fossilFilter.Q.value = 0.8;
    const fossilGain = context.createGain();
    fossilGain.gain.value = SILENT;
    const fossilPan = context.createStereoPanner();
    fossilPan.pan.value = 0.25;
    fossilOsc.connect(fossilFilter);
    fossilFilter.connect(fossilGain);
    fossilGain.connect(fossilPan);
    fossilPan.connect(compressor);

    const fossilLfo = context.createOscillator();
    fossilLfo.type = "sine";
    fossilLfo.frequency.value = 1.1;
    const fossilShaper = context.createWaveShaper();
    fossilShaper.curve = makePulseCurve();
    fossilShaper.oversample = "2x";
    const fossilPulseDepth = context.createGain();
    fossilPulseDepth.gain.value = 0;
    fossilLfo.connect(fossilShaper);
    fossilShaper.connect(fossilPulseDepth);
    fossilPulseDepth.connect(fossilGain.gain);

    // Land-use emissions: a slower, darker pulse.
    const landUseOsc = context.createOscillator();
    landUseOsc.type = "sine";
    landUseOsc.frequency.value = 61;
    const landUseFilter = context.createBiquadFilter();
    landUseFilter.type = "lowpass";
    landUseFilter.frequency.value = 420;
    landUseFilter.Q.value = 0.9;
    const landUseGain = context.createGain();
    landUseGain.gain.value = SILENT;
    const landUsePan = context.createStereoPanner();
    landUsePan.pan.value = -0.45;
    landUseOsc.connect(landUseFilter);
    landUseFilter.connect(landUseGain);
    landUseGain.connect(landUsePan);
    landUsePan.connect(compressor);

    const landUseLfo = context.createOscillator();
    landUseLfo.type = "sine";
    landUseLfo.frequency.value = 0.5;
    const landUseShaper = context.createWaveShaper();
    landUseShaper.curve = makePulseCurve();
    landUseShaper.oversample = "2x";
    const landUsePulseDepth = context.createGain();
    landUsePulseDepth.gain.value = 0;
    landUseLfo.connect(landUseShaper);
    landUseShaper.connect(landUsePulseDepth);
    landUsePulseDepth.connect(landUseGain.gain);

    // Ocean: filtered noise with a slow swell.
    const oceanNoise = context.createBufferSource();
    oceanNoise.buffer = makeNoiseBuffer(context);
    oceanNoise.loop = true;
    const oceanFilter = context.createBiquadFilter();
    oceanFilter.type = "lowpass";
    oceanFilter.frequency.value = 500;
    oceanFilter.Q.value = 0.7;
    const oceanGain = context.createGain();
    oceanGain.gain.value = SILENT;
    const oceanPan = context.createStereoPanner();
    oceanPan.pan.value = -0.2;
    oceanNoise.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(oceanPan);
    oceanPan.connect(compressor);

    const oceanSwell = context.createOscillator();
    oceanSwell.type = "sine";
    oceanSwell.frequency.value = 0.1;
    const oceanSwellDepth = context.createGain();
    oceanSwellDepth.gain.value = 110;
    oceanSwell.connect(oceanSwellDepth);
    oceanSwellDepth.connect(oceanFilter.frequency);

    // Land: a higher band of the same deterministic noise.
    const landNoise = context.createBufferSource();
    landNoise.buffer = makeNoiseBuffer(context);
    landNoise.loop = true;
    const landFilter = context.createBiquadFilter();
    landFilter.type = "bandpass";
    landFilter.frequency.value = 1000;
    landFilter.Q.value = 0.75;
    const landGain = context.createGain();
    landGain.gain.value = SILENT;
    const landPan = context.createStereoPanner();
    landPan.pan.value = 0.42;
    landNoise.connect(landFilter);
    landFilter.connect(landGain);
    landGain.connect(landPan);
    landPan.connect(compressor);

    // Balance: a quiet low anchor.
    const balanceOsc = context.createOscillator();
    balanceOsc.type = "sine";
    balanceOsc.frequency.value = 62;
    const balanceGain = context.createGain();
    balanceGain.gain.value = SILENT;
    const balancePan = context.createStereoPanner();
    balancePan.pan.value = 0;
    balanceOsc.connect(balanceGain);
    balanceGain.connect(balancePan);
    balancePan.connect(compressor);

    for (const oscillator of [
      atmosphereOscA,
      atmosphereOscB,
      atmosphereLfo,
      fossilOsc,
      fossilLfo,
      landUseOsc,
      landUseLfo,
      oceanSwell,
      balanceOsc,
    ]) {
      oscillator.start();
    }
    oceanNoise.start();
    landNoise.start();

    this.context = context;
    this.graph = {
      master,
      compressor,
      atmosphereOscA,
      atmosphereOscB,
      atmosphereFilter,
      atmosphereGain,
      atmospherePan,
      atmosphereLfo,
      atmosphereLfoDepth,
      fossilOsc,
      fossilFilter,
      fossilGain,
      fossilPan,
      fossilLfo,
      fossilShaper,
      fossilPulseDepth,
      landUseOsc,
      landUseFilter,
      landUseGain,
      landUsePan,
      landUseLfo,
      landUseShaper,
      landUsePulseDepth,
      oceanNoise,
      oceanFilter,
      oceanGain,
      oceanPan,
      oceanSwell,
      oceanSwellDepth,
      landNoise,
      landFilter,
      landGain,
      landPan,
      balanceOsc,
      balanceGain,
      balancePan,
    };
  }

  private applyVolume(time: number) {
    if (!this.graph) return;
    const gain = this.playing
      ? Math.max(0, Math.min(1, this.volume)) * 0.68
      : 0;
    target(this.graph.master.gain, gain, time, 0.04);
  }

  private applySample(index: number, time: number) {
    if (!this.graph || !this.ranges) return;
    const sample = this.samples[index];
    if (!sample) return;
    const params = mapCarbonYear(sample, this.ranges);
    const graph = this.graph;
    this.currentParams = params;

    target(graph.atmosphereOscA.frequency, params.atmosphereHz, time, 0.12);
    target(
      graph.atmosphereOscB.frequency,
      params.atmosphereHz * 1.004,
      time,
      0.12,
    );
    target(graph.atmosphereFilter.frequency, params.atmosphereCutoffHz, time, 0.16);
    target(graph.atmosphereLfo.frequency, params.atmosphereTremoloHz, time, 0.2);
    target(
      graph.atmosphereLfoDepth.gain,
      params.hasChange ? 0.014 : 0,
      time,
      0.16,
    );
    target(
      graph.atmosphereGain.gain,
      this.layers.atmosphere ? params.atmosphereGain : SILENT,
      time,
      0.14,
    );
    target(graph.atmospherePan.pan, params.panAtmosphere, time, 0.1);

    target(graph.fossilLfo.frequency, params.fossilPulseHz, time, 0.14);
    target(graph.fossilFilter.frequency, params.fossilCutoffHz, time, 0.16);
    target(
      graph.fossilPulseDepth.gain,
      this.layers.emissions ? params.fossilGain : SILENT,
      time,
      0.14,
    );
    target(graph.fossilPan.pan, params.panFossil, time, 0.1);

    target(graph.landUseLfo.frequency, params.landUsePulseHz, time, 0.18);
    target(graph.landUseFilter.frequency, params.landUseCutoffHz, time, 0.18);
    target(
      graph.landUsePulseDepth.gain,
      this.layers.emissions ? params.landUseGain : SILENT,
      time,
      0.16,
    );
    target(graph.landUsePan.pan, params.panLandUse, time, 0.1);

    target(
      graph.oceanGain.gain,
      this.layers.ocean ? params.oceanGain : SILENT,
      time,
      0.18,
    );
    target(
      graph.oceanFilter.frequency,
      params.oceanCutoffHz * (params.oceanDirection === -1 ? 1.35 : 1),
      time,
      0.2,
    );
    target(graph.oceanSwell.frequency, params.oceanSwellHz, time, 0.2);
    target(
      graph.oceanPan.pan,
      params.panOcean * params.oceanDirection,
      time,
      0.14,
    );

    target(
      graph.landGain.gain,
      this.layers.land ? params.landGain : SILENT,
      time,
      0.18,
    );
    target(
      graph.landFilter.frequency,
      params.landCutoffHz * (params.landDirection === -1 ? 0.6 : 1),
      time,
      0.2,
    );
    target(
      graph.landPan.pan,
      params.panLand * params.landDirection,
      time,
      0.14,
    );

    target(graph.balanceOsc.frequency, params.balanceHz, time, 0.24);
    target(
      graph.balanceGain.gain,
      this.layers.balance ? params.balanceGain : SILENT,
      time,
      0.24,
    );
    target(
      graph.balancePan.pan,
      params.panBalance * params.balanceDirection,
      time,
      0.14,
    );

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

  getSnapshot(): CarbonSonifierSnapshot {
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
      throw new Error("No carbon years are loaded.");
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
        this.graph.atmosphereGain.gain,
        this.graph.fossilPulseDepth.gain,
        this.graph.landUsePulseDepth.gain,
        this.graph.oceanGain.gain,
        this.graph.landGain.gain,
        this.graph.balanceGain.gain,
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

  setLayers(layers: CarbonLayers) {
    this.layers = layers;
    if (this.context && this.playing) {
      const index = Math.floor(
        this.positionSteps(this.context.currentTime),
      );
      const sample = this.samples[index];
      if (sample && this.currentParams) {
        const now = this.context.currentTime;
        const params = this.currentParams;
        target(
          this.graph!.atmosphereGain.gain,
          layers.atmosphere ? params.atmosphereGain : SILENT,
          now,
          0.12,
        );
        target(
          this.graph!.fossilPulseDepth.gain,
          layers.emissions ? params.fossilGain : SILENT,
          now,
          0.12,
        );
        target(
          this.graph!.landUsePulseDepth.gain,
          layers.emissions ? params.landUseGain : SILENT,
          now,
          0.12,
        );
        target(
          this.graph!.oceanGain.gain,
          layers.ocean ? params.oceanGain : SILENT,
          now,
          0.12,
        );
        target(
          this.graph!.landGain.gain,
          layers.land ? params.landGain : SILENT,
          now,
          0.12,
        );
        target(
          this.graph!.balanceGain.gain,
          layers.balance ? params.balanceGain : SILENT,
          now,
          0.12,
        );
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
      for (const gain of [
        this.graph.atmosphereGain.gain,
        this.graph.fossilPulseDepth.gain,
        this.graph.landUsePulseDepth.gain,
        this.graph.oceanGain.gain,
        this.graph.landGain.gain,
        this.graph.balanceGain.gain,
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
        graph.atmosphereOscA.stop();
        graph.atmosphereOscB.stop();
        graph.atmosphereLfo.stop();
        graph.fossilOsc.stop();
        graph.fossilLfo.stop();
        graph.landUseOsc.stop();
        graph.landUseLfo.stop();
        graph.oceanSwell.stop();
        graph.oceanNoise.stop();
        graph.landNoise.stop();
        graph.balanceOsc.stop();
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
