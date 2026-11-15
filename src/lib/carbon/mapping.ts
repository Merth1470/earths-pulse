import type { CarbonNormalization, CarbonYear } from "./types";

/**
 * Pure, inspectable carbon sonification mapping.
 *
 * Concentration, emissions, sinks, and the budget residual never share one
 * scale. Each has its own source, unit, normalization, and voice.
 */
export interface CarbonSoundParameters {
  co2Norm: number;
  changeNorm: number;
  fossilNorm: number;
  landUseNorm: number;
  oceanNorm: number;
  landNorm: number;
  imbalanceNorm: number;

  atmosphereHz: number;
  atmosphereCutoffHz: number;
  atmosphereTremoloHz: number;
  atmosphereGain: number;

  fossilPulseHz: number;
  fossilGain: number;
  fossilCutoffHz: number;

  landUsePulseHz: number;
  landUseGain: number;
  landUseCutoffHz: number;

  oceanGain: number;
  oceanCutoffHz: number;
  oceanSwellHz: number;
  oceanDirection: 1 | -1;

  landGain: number;
  landCutoffHz: number;
  landDirection: 1 | -1;

  balanceHz: number;
  balanceGain: number;
  balanceDirection: 1 | -1;

  panAtmosphere: number;
  panFossil: number;
  panLandUse: number;
  panOcean: number;
  panLand: number;
  panBalance: number;
}

export const CARBON_AUDIO_LIMITS = {
  atmosphereMinHz: 110,
  atmosphereMaxHz: 220,
  atmosphereMinCutoffHz: 320,
  atmosphereMaxCutoffHz: 1620,
  tremoloMinHz: 0.06,
  tremoloMaxHz: 0.56,
  fossilPulseMinHz: 0.8,
  fossilPulseMaxHz: 4.2,
  landUsePulseMinHz: 0.25,
  landUsePulseMaxHz: 1.35,
  fossilCutoffMinHz: 500,
  fossilCutoffMaxHz: 1700,
  landUseCutoffMinHz: 180,
  landUseCutoffMaxHz: 680,
  oceanCutoffMinHz: 260,
  oceanCutoffMaxHz: 1260,
  oceanSwellMinHz: 0.05,
  oceanSwellMaxHz: 0.23,
  landCutoffMinHz: 500,
  landCutoffMaxHz: 2100,
  balanceMinHz: 55,
  balanceMaxHz: 78,
  changeReferencePpm: 3,
  panLimit: 0.65,
} as const;

function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function norm(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max <= min) return 0;
  return clamp((value - min) / (max - min));
}

function signed(value: number): 1 | -1 {
  return value < 0 ? -1 : 1;
}

export function mapCarbonYear(
  sample: CarbonYear,
  ranges: CarbonNormalization,
): CarbonSoundParameters {
  const co2Norm = norm(
    sample.co2Ppm,
    ranges.co2Ppm.min,
    ranges.co2Ppm.max,
  );
  const changeNorm = clamp(
    Math.abs(sample.co2AnnualChangePpm ?? 0) /
      CARBON_AUDIO_LIMITS.changeReferencePpm,
  );
  const fossilNorm = norm(
    sample.fossilGtC,
    ranges.fossilGtC.min,
    ranges.fossilGtC.max,
  );
  const landUseNorm = norm(
    sample.landUseGtC,
    ranges.landUseGtC.min,
    ranges.landUseGtC.max,
  );
  const oceanNorm = norm(
    Math.abs(sample.oceanSinkGtC),
    ranges.oceanSinkGtC.min,
    ranges.oceanSinkGtC.max,
  );
  const landNorm = norm(
    Math.abs(sample.landSinkGtC),
    ranges.landSinkGtC.min,
    ranges.landSinkGtC.max,
  );
  const imbalanceNorm = norm(
    Math.abs(sample.imbalanceGtC),
    ranges.imbalanceGtC.min,
    ranges.imbalanceGtC.max,
  );

  return {
    co2Norm,
    changeNorm,
    fossilNorm,
    landUseNorm,
    oceanNorm,
    landNorm,
    imbalanceNorm,

    atmosphereHz:
      CARBON_AUDIO_LIMITS.atmosphereMinHz *
      Math.pow(2, co2Norm),
    atmosphereCutoffHz:
      CARBON_AUDIO_LIMITS.atmosphereMinCutoffHz +
      co2Norm *
        (CARBON_AUDIO_LIMITS.atmosphereMaxCutoffHz -
          CARBON_AUDIO_LIMITS.atmosphereMinCutoffHz),
    atmosphereTremoloHz:
      CARBON_AUDIO_LIMITS.tremoloMinHz +
      changeNorm *
        (CARBON_AUDIO_LIMITS.tremoloMaxHz - CARBON_AUDIO_LIMITS.tremoloMinHz),
    atmosphereGain: 0.07 + co2Norm * 0.035,

    fossilPulseHz:
      CARBON_AUDIO_LIMITS.fossilPulseMinHz +
      fossilNorm *
        (CARBON_AUDIO_LIMITS.fossilPulseMaxHz -
          CARBON_AUDIO_LIMITS.fossilPulseMinHz),
    fossilGain: 0.035 + fossilNorm * 0.055,
    fossilCutoffHz:
      CARBON_AUDIO_LIMITS.fossilCutoffMinHz +
      fossilNorm *
        (CARBON_AUDIO_LIMITS.fossilCutoffMaxHz -
          CARBON_AUDIO_LIMITS.fossilCutoffMinHz),

    landUsePulseHz:
      CARBON_AUDIO_LIMITS.landUsePulseMinHz +
      landUseNorm *
        (CARBON_AUDIO_LIMITS.landUsePulseMaxHz -
          CARBON_AUDIO_LIMITS.landUsePulseMinHz),
    landUseGain: 0.018 + landUseNorm * 0.04,
    landUseCutoffHz:
      CARBON_AUDIO_LIMITS.landUseCutoffMinHz +
      landUseNorm *
        (CARBON_AUDIO_LIMITS.landUseCutoffMaxHz -
          CARBON_AUDIO_LIMITS.landUseCutoffMinHz),

    oceanGain: 0.014 + oceanNorm * 0.047,
    oceanCutoffHz:
      CARBON_AUDIO_LIMITS.oceanCutoffMinHz +
      oceanNorm *
        (CARBON_AUDIO_LIMITS.oceanCutoffMaxHz -
          CARBON_AUDIO_LIMITS.oceanCutoffMinHz),
    oceanSwellHz:
      CARBON_AUDIO_LIMITS.oceanSwellMinHz +
      oceanNorm *
        (CARBON_AUDIO_LIMITS.oceanSwellMaxHz -
          CARBON_AUDIO_LIMITS.oceanSwellMinHz),
    oceanDirection: signed(sample.oceanSinkGtC),

    landGain: 0.012 + landNorm * 0.043,
    landCutoffHz:
      CARBON_AUDIO_LIMITS.landCutoffMinHz +
      landNorm *
        (CARBON_AUDIO_LIMITS.landCutoffMaxHz -
          CARBON_AUDIO_LIMITS.landCutoffMinHz),
    landDirection: signed(sample.landSinkGtC),

    balanceHz:
      CARBON_AUDIO_LIMITS.balanceMinHz +
      imbalanceNorm *
        (CARBON_AUDIO_LIMITS.balanceMaxHz -
          CARBON_AUDIO_LIMITS.balanceMinHz),
    balanceGain: 0.004 + imbalanceNorm * 0.023,
    balanceDirection: signed(sample.imbalanceGtC),

    panAtmosphere: 0,
    panFossil: 0.25,
    panLandUse: -0.45,
    panOcean: -0.2,
    panLand: 0.42,
    panBalance: 0,
  };
}

export interface CarbonMappingRow {
  variable: string;
  sound: string;
  explanation: string;
}

export const CARBON_MAPPING_ROWS: CarbonMappingRow[] = [
  {
    variable: "Atmospheric CO₂ concentration",
    sound: "Harmonic pitch",
    explanation:
      "The annual mean concentration sets the drone across one octave. Higher concentration means higher pitch; it does not mean more emissions in that year.",
  },
  {
    variable: "Year-to-year CO₂ change",
    sound: "Slow tremolo",
    explanation:
      "The annual change sets a slow amplitude modulation. This keeps the level and its rate of change audible as separate properties.",
  },
  {
    variable: "Fossil and industrial emissions",
    sound: "Regular pulse",
    explanation:
      "A faster, brighter pulse indicates more fossil carbon entering the atmosphere. The pulse is a rate, not a concentration.",
  },
  {
    variable: "Land-use change emissions",
    sound: "Slower, darker pulse",
    explanation:
      "A separate low pulse carries land-use emissions. Its slower and darker character keeps it distinguishable from fossil emissions.",
  },
  {
    variable: "Ocean exchange",
    sound: "Filtered tide",
    explanation:
      "A larger net ocean sink opens the tide and quickens its swell. Positive flux is atmosphere to ocean; a negative source would invert the character.",
  },
  {
    variable: "Land uptake",
    sound: "High, leaf-like band",
    explanation:
      "A larger net land sink raises a higher band. This is net land–atmosphere exchange, not a claim about photosynthesis or soil alone.",
  },
  {
    variable: "Carbon balance residual",
    sound: "Low anchor",
    explanation:
      "The accounting residual sets a quiet low tone. It is deliberately subordinate and near-silent when the components almost balance.",
  },
];
