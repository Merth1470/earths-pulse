import type { OceanSample } from "@/lib/ocean/types";

/**
 * The sonification mapping.
 *
 * These functions are pure and deterministic. The same sample and the same
 * normalization ranges always produce the same audio parameters. Nothing here
 * creates musical notes from a scale: continuous physical values drive
 * continuous audio controls, with documented limits.
 */

export interface SonificationRanges {
  sst: { min: number; max: number };
  speed: { min: number; max: number };
}

export interface SoundParameters {
  sstNorm: number;
  speedNorm: number;
  uNorm: number;
  vNorm: number;
  /** Frequency of the temperature voice, Hz. */
  toneHz: number;
  /** Low-pass cutoff for the temperature voice, Hz. */
  toneCutoffHz: number;
  /** Stereo position, -1 (left) to 1 (right). */
  pan: number;
  /** Fundamental of the pulse voice, Hz. */
  pulseHz: number;
  /** Pulse repetition rate, Hz. */
  pulseRateHz: number;
  /** Peak pulse gain. */
  pulseDepth: number;
  /** Flow-texture gain. */
  textureGain: number;
  /** Flow-texture band-pass center, Hz. */
  textureCutoffHz: number;
}

export const AUDIO_LIMITS = {
  toneMinHz: 130.81, // C3
  toneMaxHz: 523.25, // C5
  toneOctaves: 2,
  filterMinHz: 380,
  filterMaxHz: 2980,
  pulseRateMinHz: 0.65,
  pulseRateMaxHz: 6,
  pulseDepthMin: 0.05,
  pulseDepthMax: 0.28,
  textureMinGain: 0.008,
  textureMaxGain: 0.078,
  textureMinHz: 260,
  textureMaxHz: 1460,
  panLimit: 0.9,
  directionPitchSemitones: 3,
} as const;

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function normalized(
  value: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value) || max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

/**
 * Returns null when the sample has neither temperature nor velocity: the
 * engine then stays silent instead of inventing a value.
 */
export function mapSample(
  sample: OceanSample,
  ranges: SonificationRanges,
): SoundParameters | null {
  if (sample.sst === null && sample.speed === null) return null;

  const sstNorm =
    sample.sst === null
      ? 0
      : normalized(sample.sst, ranges.sst.min, ranges.sst.max);
  const speedNorm =
    sample.speed === null
      ? 0
      : normalized(sample.speed, ranges.speed.min, ranges.speed.max);
  const speedReference = Math.max(0.01, ranges.speed.max);
  const uNorm =
    sample.u === null ? 0 : clamp(sample.u / speedReference, -1, 1);
  const vNorm =
    sample.v === null ? 0 : clamp(sample.v / speedReference, -1, 1);

  const toneHz =
    AUDIO_LIMITS.toneMinHz *
    Math.pow(2, sstNorm * AUDIO_LIMITS.toneOctaves);
  const toneCutoffHz =
    AUDIO_LIMITS.filterMinHz +
    sstNorm * (AUDIO_LIMITS.filterMaxHz - AUDIO_LIMITS.filterMinHz);
  const pan = uNorm * AUDIO_LIMITS.panLimit;
  const pulseHz =
    (toneHz / 2) *
    Math.pow(2, (vNorm * AUDIO_LIMITS.directionPitchSemitones) / 12);
  const pulseRateHz =
    AUDIO_LIMITS.pulseRateMinHz +
    speedNorm *
      (AUDIO_LIMITS.pulseRateMaxHz - AUDIO_LIMITS.pulseRateMinHz);
  const pulseDepth =
    AUDIO_LIMITS.pulseDepthMin +
    speedNorm * (AUDIO_LIMITS.pulseDepthMax - AUDIO_LIMITS.pulseDepthMin);
  const textureGain =
    AUDIO_LIMITS.textureMinGain +
    speedNorm * (AUDIO_LIMITS.textureMaxGain - AUDIO_LIMITS.textureMinGain);
  const textureCutoffHz =
    AUDIO_LIMITS.textureMinHz +
    speedNorm * (AUDIO_LIMITS.textureMaxHz - AUDIO_LIMITS.textureMinHz);

  return {
    sstNorm,
    speedNorm,
    uNorm,
    vNorm,
    toneHz,
    toneCutoffHz,
    pan,
    pulseHz,
    pulseRateHz,
    pulseDepth,
    textureGain,
    textureCutoffHz,
  };
}

export interface MappingRow {
  variable: string;
  sound: string;
  explanation: string;
}

export const MAPPING_ROWS: MappingRow[] = [
  {
    variable: "Sea surface temperature",
    sound: "Pitch and brightness",
    explanation:
      "Warmer water raises the tone across two octaves and opens the filter, so warm water sounds brighter.",
  },
  {
    variable: "Current speed",
    sound: "Pulse rate and accent",
    explanation:
      "Faster flow pulses more quickly and with more accent. Slack water becomes a slow, quiet pulse.",
  },
  {
    variable: "Eastward current",
    sound: "Stereo position",
    explanation:
      "Eastward flow moves the sound right; westward flow moves it left. Center means little zonal flow.",
  },
  {
    variable: "Northward current",
    sound: "Pulse pitch offset",
    explanation:
      "Northward flow lifts the pulse by up to three semitones; southward flow lowers it by the same amount.",
  },
  {
    variable: "Position on the transect",
    sound: "Time",
    explanation:
      "The route is heard west to east. The playhead and reading show exactly which longitude is sounding.",
  },
];

export function describeRange(ranges: SonificationRanges): string {
  return `Temperature ${ranges.sst.min.toFixed(1)} to ${ranges.sst.max.toFixed(1)} °C; speed 0 to ${ranges.speed.max.toFixed(2)} m/s.`;
}
