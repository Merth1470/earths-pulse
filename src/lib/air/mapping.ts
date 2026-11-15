import type { AirNormalization, AirSample } from "./types";

export interface AirSoundParameters {
  pm25Norm: number;
  no2Norm: number;
  ozoneNorm: number;
  pm25Gain: number;
  pm25CutoffHz: number;
  no2Gain: number;
  no2Hz: number;
  no2PulseHz: number;
  no2CutoffHz: number;
  ozoneGain: number;
  ozoneCutoffHz: number;
  pan: number;
  hasPm25: boolean;
  hasNo2: boolean;
  hasOzone: boolean;
}

export const AIR_AUDIO_LIMITS = {
  pm25MinCutoffHz: 220,
  pm25MaxCutoffHz: 1500,
  pm25MinGain: 0.009,
  pm25MaxGain: 0.055,
  no2MinPulseHz: 0.55,
  no2MaxPulseHz: 4.2,
  no2MinHz: 150,
  no2MaxHz: 270,
  no2MinGain: 0.016,
  no2MaxGain: 0.075,
  no2MinCutoffHz: 420,
  no2MaxCutoffHz: 1500,
  ozoneMinCutoffHz: 800,
  ozoneMaxCutoffHz: 2600,
  ozoneMinGain: 0.006,
  ozoneMaxGain: 0.038,
  longitudeCenter: -98,
  longitudeSpan: 27,
  panLimit: 0.9,
} as const;

function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function norm(value: number | null, min: number, max: number): number {
  if (value === null || !Number.isFinite(value) || max <= min) return 0;
  return clamp((value - min) / (max - min));
}

export function airPanForLongitude(lon: number): number {
  const normalized =
    (lon - AIR_AUDIO_LIMITS.longitudeCenter) /
    AIR_AUDIO_LIMITS.longitudeSpan;
  return clamp(normalized, -1, 1) * AIR_AUDIO_LIMITS.panLimit;
}

export function mapAirSample(
  sample: AirSample,
  ranges: AirNormalization,
): AirSoundParameters {
  const pm25Norm = norm(
    sample.values.pm25,
    ranges.pm25.min,
    ranges.pm25.max,
  );
  const no2Norm = norm(sample.values.no2, ranges.no2.min, ranges.no2.max);
  const ozoneNorm = norm(
    sample.values.ozone,
    ranges.ozone.min,
    ranges.ozone.max,
  );

  return {
    pm25Norm,
    no2Norm,
    ozoneNorm,
    pm25Gain:
      AIR_AUDIO_LIMITS.pm25MinGain +
      pm25Norm *
        (AIR_AUDIO_LIMITS.pm25MaxGain - AIR_AUDIO_LIMITS.pm25MinGain),
    pm25CutoffHz:
      AIR_AUDIO_LIMITS.pm25MinCutoffHz +
      pm25Norm *
        (AIR_AUDIO_LIMITS.pm25MaxCutoffHz -
          AIR_AUDIO_LIMITS.pm25MinCutoffHz),
    no2Gain:
      AIR_AUDIO_LIMITS.no2MinGain +
      no2Norm * (AIR_AUDIO_LIMITS.no2MaxGain - AIR_AUDIO_LIMITS.no2MinGain),
    no2Hz:
      AIR_AUDIO_LIMITS.no2MinHz +
      no2Norm * (AIR_AUDIO_LIMITS.no2MaxHz - AIR_AUDIO_LIMITS.no2MinHz),
    no2PulseHz:
      AIR_AUDIO_LIMITS.no2MinPulseHz +
      no2Norm *
        (AIR_AUDIO_LIMITS.no2MaxPulseHz - AIR_AUDIO_LIMITS.no2MinPulseHz),
    no2CutoffHz:
      AIR_AUDIO_LIMITS.no2MinCutoffHz +
      no2Norm *
        (AIR_AUDIO_LIMITS.no2MaxCutoffHz - AIR_AUDIO_LIMITS.no2MinCutoffHz),
    ozoneGain:
      AIR_AUDIO_LIMITS.ozoneMinGain +
      ozoneNorm *
        (AIR_AUDIO_LIMITS.ozoneMaxGain - AIR_AUDIO_LIMITS.ozoneMinGain),
    ozoneCutoffHz:
      AIR_AUDIO_LIMITS.ozoneMinCutoffHz +
      ozoneNorm *
        (AIR_AUDIO_LIMITS.ozoneMaxCutoffHz -
          AIR_AUDIO_LIMITS.ozoneMinCutoffHz),
    pan: airPanForLongitude(sample.city.lon),
    hasPm25: sample.values.pm25 !== null,
    hasNo2: sample.values.no2 !== null,
    hasOzone: sample.values.ozone !== null,
  };
}

export interface AirMappingRow {
  variable: string;
  sound: string;
  explanation: string;
}

export const AIR_MAPPING_ROWS: AirMappingRow[] = [
  {
    variable: "Geographic longitude",
    sound: "Stereo position",
    explanation:
      "Western cities sit left, eastern cities right. This is a map-to-stereo convention, not a literal direction in a physical sound field.",
  },
  {
    variable: "PM2.5",
    sound: "Low filtered haze",
    explanation:
      "Higher concentration opens a low noise band and raises its presence. It is not a loudness-equals-danger scale.",
  },
  {
    variable: "NO₂",
    sound: "Reedy pulse",
    explanation:
      "Higher concentration quickens a mid pulse and opens its filter. The pulse is an identity and a rate, not a note chosen from a scale.",
  },
  {
    variable: "O₃",
    sound: "Bright high band",
    explanation:
      "Higher ozone opens a higher band. Seasonal gaps remain silent; the instrument does not invent winter ozone.",
  },
  {
    variable: "Hour of day",
    sound: "Time",
    explanation:
      "The selected UTC hour is played in order. The map and the reading always name the same timestamp.",
  },
];

export function describeAirRanges(ranges: AirNormalization): string {
  return `PM2.5 ${ranges.pm25.min.toFixed(1)}–${ranges.pm25.max.toFixed(1)} µg/m³; NO₂ ${ranges.no2.min.toFixed(1)}–${ranges.no2.max.toFixed(1)} ppb; O₃ ${ranges.ozone.min.toFixed(3)}–${ranges.ozone.max.toFixed(3)} ppm.`;
}
