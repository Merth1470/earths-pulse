import type {
  AirCity,
  AirDataset,
  AirDatasetMeta,
  AirLayerId,
  AirPollutantId,
  AirSample,
} from "./types";

export class AirDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AirDataError";
  }
}

export const AIR_POLLUTANT_IDS: AirPollutantId[] = ["pm25", "no2", "ozone"];

export const AIR_POLLUTANT_SHORT: Record<AirPollutantId, string> = {
  pm25: "PM2.5",
  no2: "NO₂",
  ozone: "O₃",
};

export const AIR_POLLUTANT_LABELS: Record<AirPollutantId, string> = {
  pm25: "Fine particulate matter",
  no2: "Nitrogen dioxide",
  ozone: "Ground-level ozone",
};

export const AIR_LAYERS: Array<{
  id: AirLayerId;
  label: string;
  scientific: string;
  sonification: string;
  limitation: string;
}> = [
  {
    id: "pm25",
    label: "PM2.5",
    scientific:
      "Mass concentration of particles 2.5 µm or smaller at a ground monitor, in µg/m³.",
    sonification:
      "A low, filtered haze. Concentration opens the filter and raises a soft noise band; it is a mapped level, not a loudness warning.",
    limitation:
      "A single point monitor is not a city-wide average. The sound does not encode particle composition or health risk.",
  },
  {
    id: "no2",
    label: "NO₂",
    scientific:
      "Nitrogen dioxide mixing ratio at a ground monitor, in parts per billion (ppb).",
    sonification:
      "A reedy pulse. Concentration raises the pulse rate and opens a mid filter; the pitch is a voice identity, not a chemical measurement.",
    limitation:
      "A point monitor near a road or industrial site can differ sharply from the rest of a city.",
  },
  {
    id: "ozone",
    label: "O₃",
    scientific:
      "Ground-level ozone mixing ratio at a ground monitor, in parts per million (ppm). This is not the stratospheric ozone layer.",
    sonification:
      "A bright, high band. Concentration raises its cutoff and presence. Ozone is often measured seasonally, so winter silence can mean no sample.",
    limitation:
      "A point monitor; seasonal operation and missing hours are preserved rather than filled. Not a health or compliance determination.",
  },
];

const BASE = "/data/air-quality-2023.json";
const HOUR_MS = 3_600_000;

export async function loadAirDataset(url = BASE): Promise<AirDataset> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AirDataError(
        `Air-quality data request failed (${response.status}).`,
      );
    }
    const dataset = (await response.json()) as AirDataset;
    validateAirDataset(dataset);
    return dataset;
  } catch (error) {
    if (error instanceof AirDataError) throw error;
    throw new AirDataError(
      "The bundled air-quality record could not be retrieved. Check the connection and retry.",
    );
  }
}

function validateAirDataset(dataset: AirDataset) {
  const meta = dataset.meta as AirDatasetMeta;
  if (!meta || !Array.isArray(dataset.cities) || dataset.cities.length === 0) {
    throw new AirDataError("Air-quality metadata or city list is incomplete.");
  }
  if (meta.hourCount !== 8760) {
    throw new AirDataError("Air-quality dataset is not an 8,760-hour year.");
  }
  for (const city of dataset.cities) {
    for (const pollutant of AIR_POLLUTANT_IDS) {
      if (
        !Array.isArray(city.series[pollutant]) ||
        city.series[pollutant].length !== meta.hourCount
      ) {
        throw new AirDataError(
          `Air-quality series ${city.id}/${pollutant} is incomplete.`,
        );
      }
    }
  }
}

export function airCityAt(dataset: AirDataset, index: number): AirCity {
  return dataset.cities[
    Math.max(0, Math.min(dataset.cities.length - 1, Math.trunc(index)))
  ];
}

export function airCityById(dataset: AirDataset, id: string): AirCity {
  return dataset.cities.find((city) => city.id === id) ?? dataset.cities[0];
}

export function airStart(dataset: AirDataset): Date {
  return new Date(dataset.meta.period.start);
}

export function airTimeAt(dataset: AirDataset, hourIndex: number): Date {
  return new Date(airStart(dataset).getTime() + hourIndex * HOUR_MS);
}

export function clampHour(dataset: AirDataset, hourIndex: number): number {
  return Math.max(0, Math.min(dataset.meta.hourCount - 1, Math.trunc(hourIndex)));
}

export function airSampleAt(
  dataset: AirDataset,
  city: AirCity,
  hourIndex: number,
): AirSample {
  const index = clampHour(dataset, hourIndex);
  const values = {
    pm25: city.series.pm25[index],
    no2: city.series.no2[index],
    ozone: city.series.ozone[index],
  } as Record<AirPollutantId, number | null>;
  return {
    city,
    hourIndex: index,
    timestamp: airTimeAt(dataset, index),
    values,
  };
}

export function airDayCount(dataset: AirDataset): number {
  return Math.floor(dataset.meta.hourCount / 24);
}

export function airDayStartHour(dayIndex: number): number {
  return Math.max(0, Math.trunc(dayIndex)) * 24;
}

export function airHourOfDay(hourIndex: number): number {
  return ((hourIndex % 24) + 24) % 24;
}

export function airDayIndex(hourIndex: number): number {
  return Math.floor(hourIndex / 24);
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const SHORT_DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
});

export function airDayLabel(dataset: AirDataset, dayIndex: number): string {
  const date = new Date(
    airStart(dataset).getTime() + Math.max(0, dayIndex) * 24 * HOUR_MS,
  );
  return DAY_FORMAT.format(date);
}

export function airDayShortLabel(dataset: AirDataset, dayIndex: number): string {
  const date = new Date(
    airStart(dataset).getTime() + Math.max(0, dayIndex) * 24 * HOUR_MS,
  );
  return SHORT_DAY_FORMAT.format(date);
}

export function airTimestampLabel(timestamp: Date): string {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(timestamp);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp);
  return `${date} · ${time} UTC`;
}

export function formatAirValue(
  pollutant: AirPollutantId,
  value: number | null,
): string {
  if (value === null || !Number.isFinite(value)) return "Missing";
  if (pollutant === "ozone") return `${value.toFixed(3)} ppm`;
  if (pollutant === "no2") return `${value.toFixed(1)} ppb`;
  return `${value.toFixed(1)} µg/m³`;
}

export function airValueNumber(
  pollutant: AirPollutantId,
  value: number | null,
): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (pollutant === "ozone") return value.toFixed(3);
  return value.toFixed(1);
}

export function airUnit(pollutant: AirPollutantId): string {
  return pollutant === "pm25"
    ? "µg/m³"
    : pollutant === "no2"
      ? "ppb"
      : "ppm";
}

export function describeAirSample(sample: AirSample): string {
  const label = airTimestampLabel(sample.timestamp);
  const pm = formatAirValue("pm25", sample.values.pm25);
  const no2 = formatAirValue("no2", sample.values.no2);
  const ozone = formatAirValue("ozone", sample.values.ozone);
  return `At ${sample.city.name}, ${sample.city.state}, on ${label}, the co-located ground monitor reports PM2.5 ${pm}, nitrogen dioxide ${no2}, and ground-level ozone ${ozone}. These are station measurements, not a city-wide average or a satellite column.`;
}
