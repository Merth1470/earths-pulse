import type {
  CarbonDataset,
  CarbonDatasetMeta,
  CarbonLayerDefinition,
  CarbonYear,
} from "./types";

export class CarbonDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarbonDataError";
  }
}

export const CARBON_LAYERS: CarbonLayerDefinition[] = [
  {
    id: "atmosphere",
    label: "Atmospheric CO₂",
    shortLabel: "Atmosphere",
    scientific:
      "Annual mean CO₂ concentration measured at Mauna Loa, Hawaii, in parts per million. It is a concentration, not an emission.",
    sonification:
      "A sustained harmonic drone. Absolute concentration sets pitch; the year-to-year change sets a slow tremolo, so level and rate of change remain separate.",
    limitation:
      "One benchmark station, not a global spatial mean. The drone conveys a mapped value, not a chemical property of the air.",
  },
  {
    id: "emissions",
    label: "Carbon emissions",
    shortLabel: "Emissions",
    scientific:
      "Fossil-fuel and industrial emissions plus land-use change emissions, in gigatonnes of carbon per year (GtC/yr). Both are flows into the atmosphere.",
    sonification:
      "Two rhythmic voices: a regular fossil pulse and a slower, darker land-use pulse. Higher emissions increase the pulse rate; the two categories keep separate timbres.",
    limitation:
      "Global annual estimates, not a country or facility inventory. Land-use change is the mean of three bookkeeping models.",
  },
  {
    id: "ocean",
    label: "Ocean exchange",
    shortLabel: "Ocean",
    scientific:
      "Global ocean CO₂ sink, in GtC/yr. Positive values mean a flux from the atmosphere into the ocean. The series is a net sink in every year shown.",
    sonification:
      "A filtered-noise tide. Magnitude opens the filter and raises the swell. A negative source would darken and reverse the spatial character, but this global record contains no net-source year.",
    limitation:
      "A global annual estimate from ocean biogeochemistry models and fCO₂ data products, not a local flux measurement.",
  },
  {
    id: "land",
    label: "Land uptake",
    shortLabel: "Land",
    scientific:
      "Global land CO₂ sink, in GtC/yr. Positive values mean a net flux from the atmosphere into land ecosystems. It is net exchange, not photosynthesis or soil respiration alone.",
    sonification:
      "A higher, leaf-like band. Larger net uptake raises the band and its brightness; the mapping does not claim to separate vegetation from soil.",
    limitation:
      "A model-based global net land sink with large interannual variability. It is not a measurement of an individual forest or field.",
  },
  {
    id: "balance",
    label: "Carbon balance",
    shortLabel: "Balance",
    scientific:
      "The budget imbalance is emissions minus atmospheric growth, ocean sink, land sink, and cement carbonation, in GtC/yr. It is a residual of the accounting, not a physical flux.",
    sonification:
      "A low anchor tone. Its pitch and quiet pulse follow the absolute residual; near zero it becomes almost silent. It is deliberately the least prominent voice.",
    limitation:
      "The residual is not a discovery of missing carbon and should not be read as a flux. The components carry uncertainties of roughly ±0.4–0.7 GtC/yr.",
  },
];

export const CARBON_LAYER_IDS = CARBON_LAYERS.map((layer) => layer.id);

const BASE = "/data/carbon-1959-2024.json";

export async function loadCarbonDataset(url = BASE): Promise<CarbonDataset> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new CarbonDataError(
        `Carbon data request failed (${response.status}).`,
      );
    }
    const dataset = (await response.json()) as CarbonDataset;
    validateCarbonDataset(dataset);
    return dataset;
  } catch (error) {
    if (error instanceof CarbonDataError) throw error;
    throw new CarbonDataError(
      "The bundled carbon record could not be retrieved. Check the connection and retry.",
    );
  }
}

function validateCarbonDataset(dataset: CarbonDataset) {
  const meta = dataset.meta as CarbonDatasetMeta;
  if (!meta || !Array.isArray(dataset.years) || dataset.years.length < 2) {
    throw new CarbonDataError("Carbon metadata or year list is incomplete.");
  }
  if (dataset.years.length !== meta.yearCount) {
    throw new CarbonDataError("Carbon year count does not match metadata.");
  }
  for (const key of [
    "co2Ppm",
    "fossilGtC",
    "landUseGtC",
    "emissionsGtC",
    "oceanSinkGtC",
    "landSinkGtC",
    "imbalanceGtC",
  ] as const) {
    if (
      !Array.isArray(dataset.series[key]) ||
      dataset.series[key].length !== dataset.years.length
    ) {
      throw new CarbonDataError(`Carbon series "${key}" is incomplete.`);
    }
  }
}

export function carbonYearIndex(dataset: CarbonDataset, year: number): number {
  const index = dataset.years.indexOf(year);
  return index === -1 ? dataset.years.length - 1 : index;
}

export function carbonYearAt(
  dataset: CarbonDataset,
  index: number,
): CarbonYear {
  const safeIndex = Math.max(
    0,
    Math.min(dataset.years.length - 1, Math.trunc(index)),
  );
  const year = dataset.years[safeIndex];
  const value = (key: keyof CarbonDataset["series"]) => {
    const result = dataset.series[key][safeIndex];
    if (result === null || !Number.isFinite(result)) {
      throw new CarbonDataError(
        `Carbon series "${key}" is missing at ${year}.`,
      );
    }
    return result;
  };
  const change = dataset.series.co2AnnualChangePpm[safeIndex];
  return {
    year,
    co2Ppm: value("co2Ppm"),
    co2AnnualChangePpm:
      change === null || !Number.isFinite(change) ? null : change,
    fossilGtC: value("fossilGtC"),
    landUseGtC: value("landUseGtC"),
    emissionsGtC: value("emissionsGtC"),
    atmosphericGrowthGtC: value("atmosphericGrowthGtC"),
    oceanSinkGtC: value("oceanSinkGtC"),
    landSinkGtC: value("landSinkGtC"),
    cementSinkGtC: value("cementSinkGtC"),
    sinkGtC: value("sinkGtC"),
    imbalanceGtC: value("imbalanceGtC"),
  };
}

export function formatPpm(value: number): string {
  return `${value.toFixed(1)} ppm`;
}

export function formatPpmChange(value: number | null): string {
  if (value === null) return "not available";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} ppm/yr`;
}

export function formatGtC(value: number, digits = 2): string {
  return `${value.toFixed(digits)} GtC/yr`;
}

export function formatGtCSigned(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)} GtC/yr`;
}

export function describeCarbonYear(sample: CarbonYear): string {
  const change = formatPpmChange(sample.co2AnnualChangePpm);
  return `In ${sample.year}, atmospheric CO₂ at Mauna Loa averaged ${formatPpm(
    sample.co2Ppm,
  )}, a change of ${change}. Fossil and industrial emissions were ${formatGtC(
    sample.fossilGtC,
  )}; land-use change emissions were ${formatGtC(
    sample.landUseGtC,
  )}. The ocean took up ${formatGtC(
    sample.oceanSinkGtC,
  )} and land took up ${formatGtC(
    sample.landSinkGtC,
  )}. The budget residual was ${formatGtCSigned(
    sample.imbalanceGtC,
  )}; it is an accounting residual, not a physical flux.`;
}

export function describeFlow(
  flow: "atmosphere" | "fossil" | "landUse" | "ocean" | "land" | "imbalance",
  sample: CarbonYear,
): { title: string; value: string; definition: string } {
  switch (flow) {
    case "atmosphere":
      return {
        title: "Atmosphere",
        value: `${formatPpm(sample.co2Ppm)} · ${formatPpmChange(sample.co2AnnualChangePpm)}`,
        definition:
          "Annual mean concentration at Mauna Loa. A concentration is a state, not a flow.",
      };
    case "fossil":
      return {
        title: "Fossil and industrial emissions",
        value: formatGtC(sample.fossilGtC),
        definition:
          "Carbon released to the atmosphere by fossil-fuel combustion and industrial processes. Positive into the atmosphere.",
      };
    case "landUse":
      return {
        title: "Land-use change emissions",
        value: formatGtC(sample.landUseGtC),
        definition:
          "Carbon released by land-use change, averaged across three bookkeeping models. Positive into the atmosphere.",
      };
    case "ocean":
      return {
        title: "Ocean sink",
        value: formatGtC(sample.oceanSinkGtC),
        definition:
          "Positive means a net flux from the atmosphere into the ocean. This global annual series is a sink in every year shown.",
      };
    case "land":
      return {
        title: "Land sink",
        value: formatGtC(sample.landSinkGtC),
        definition:
          "Positive means a net flux from the atmosphere into land ecosystems. It is net exchange, not a single biological process.",
      };
    case "imbalance":
      return {
        title: "Budget imbalance",
        value: formatGtCSigned(sample.imbalanceGtC),
        definition:
          "Emissions minus atmospheric growth and the three sinks. A residual of data and models, not a physical flux.",
      };
  }
}
