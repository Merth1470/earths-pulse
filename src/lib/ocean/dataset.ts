import type {
  OceanDataset,
  OceanDatasetMeta,
  OceanFrameMeta,
  OceanSample,
  OceanVariableId,
  TransectDefinition,
  TransectSample,
} from "./types";

const COMPASS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

export class OceanDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OceanDataError";
  }
}

export async function loadOceanDataset(
  metaUrl = "/data/ocean-2012.json",
  binaryUrl = "/data/ocean-2012.bin",
): Promise<OceanDataset> {
  const [metaResponse, binaryResponse] = await Promise.all([
    fetch(metaUrl),
    fetch(binaryUrl),
  ]);

  if (!metaResponse.ok) {
    throw new OceanDataError(
      `Ocean metadata request failed (${metaResponse.status}).`,
    );
  }
  if (!binaryResponse.ok) {
    throw new OceanDataError(
      `Ocean field request failed (${binaryResponse.status}).`,
    );
  }

  const meta = (await metaResponse.json()) as OceanDatasetMeta;
  const buffer = await binaryResponse.arrayBuffer();

  validateMeta(meta);

  const cells = meta.grid.lonCount * meta.grid.latCount;
  const expectedBytes = meta.frames.length * 3 * cells * 2;
  if (buffer.byteLength !== expectedBytes) {
    throw new OceanDataError(
      `Ocean field size ${buffer.byteLength} does not match the declared ${expectedBytes} bytes.`,
    );
  }

  return {
    meta,
    values: new Int16Array(buffer),
    loaded: true,
  };
}

function validateMeta(meta: OceanDatasetMeta) {
  if (meta.schemaVersion !== 1) {
    throw new OceanDataError("Unsupported ocean dataset schema.");
  }
  if (!meta.grid || meta.grid.lonCount < 2 || meta.grid.latCount < 2) {
    throw new OceanDataError("Ocean grid metadata is incomplete.");
  }
  if (!Array.isArray(meta.frames) || meta.frames.length === 0) {
    throw new OceanDataError("Ocean dataset contains no frames.");
  }
  for (const key of ["sst", "u", "v"] as const) {
    if (!meta.variables[key] || !Number.isFinite(meta.variables[key].scale)) {
      throw new OceanDataError(`Ocean variable "${key}" is missing a scale.`);
    }
  }
}

function cellOffset(meta: OceanDatasetMeta, frame: number, variable: OceanVariableId) {
  const cells = meta.grid.lonCount * meta.grid.latCount;
  const variableIndex = variable === "sst" ? 0 : variable === "u" ? 1 : 2;
  return frame * cells * 3 + variableIndex * cells;
}

function readValue(
  dataset: OceanDataset,
  frame: number,
  variable: OceanVariableId,
  cell: number,
): number | null {
  const meta = dataset.meta;
  const raw = dataset.values[cellOffset(meta, frame, variable) + cell];
  if (raw === meta.binary.fill || !Number.isFinite(raw)) return null;
  return raw * meta.variables[variable].scale;
}

function sampleVariable(
  dataset: OceanDataset,
  frame: number,
  variable: OceanVariableId,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  fx: number,
  fy: number,
): number | null {
  const { lonCount } = dataset.meta.grid;
  const corners: Array<[number, number]> = [
    [y0 * lonCount + x0, (1 - fx) * (1 - fy)],
    [y0 * lonCount + x1, fx * (1 - fy)],
    [y1 * lonCount + x0, (1 - fx) * fy],
    [y1 * lonCount + x1, fx * fy],
  ];

  let weighted = 0;
  let weight = 0;
  for (const [cell, w] of corners) {
    const value = readValue(dataset, frame, variable, cell);
    if (value === null || w <= 0) continue;
    weighted += value * w;
    weight += w;
  }
  return weight > 0 ? weighted / weight : null;
}

/** Normalize a longitude into [-180, 180). */
export function normalizeLon(lon: number): number {
  const wrapped = ((lon + 180) % 360 + 360) % 360 - 180;
  return wrapped === -180 && lon > 0 ? 180 : wrapped;
}

/**
 * Bilinear sample of one ocean frame. Missing source cells are excluded from
 * the weighted mean rather than replaced by zero.
 */
export function sampleOcean(
  dataset: OceanDataset,
  frameIndex: number,
  lon: number,
  lat: number,
): OceanSample {
  const { grid } = dataset.meta;
  const frame = Math.max(0, Math.min(dataset.meta.frames.length - 1, frameIndex));
  const lonNorm = normalizeLon(lon);
  const latClamped = Math.max(
    grid.latStart + Math.min(0, (grid.latCount - 1) * grid.latStep),
    Math.min(
      grid.latStart + Math.max(0, (grid.latCount - 1) * grid.latStep),
      lat,
    ),
  );

  const x = (lonNorm - grid.lonStart) / grid.lonStep;
  const x0 = ((Math.floor(x) % grid.lonCount) + grid.lonCount) % grid.lonCount;
  const x1 = (x0 + 1) % grid.lonCount;
  const fx = x - Math.floor(x);

  let y = (latClamped - grid.latStart) / grid.latStep;
  y = Math.max(0, Math.min(grid.latCount - 1, y));
  const y0 = Math.min(Math.floor(y), grid.latCount - 2);
  const y1 = y0 + 1;
  const fy = y - y0;

  const sst = sampleVariable(dataset, frame, "sst", x0, x1, y0, y1, fx, fy);
  const u = sampleVariable(dataset, frame, "u", x0, x1, y0, y1, fx, fy);
  const v = sampleVariable(dataset, frame, "v", x0, x1, y0, y1, fx, fy);

  const speed = u !== null && v !== null ? Math.hypot(u, v) : null;
  const bearing =
    u !== null && v !== null
      ? ((Math.atan2(u, v) * 180) / Math.PI + 360) % 360
      : null;

  return { lon: lonNorm, lat: latClamped, sst, u, v, speed, bearing };
}

/**
 * Build the listening route: a straight zonal transect at a fixed latitude.
 * It is a deliberate sampling path, not a drifter trajectory or a front.
 */
export function buildTransect(
  dataset: OceanDataset,
  frameIndex: number,
  transect: TransectDefinition,
  steps = 48,
): TransectSample[] {
  const count = Math.max(2, steps);
  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    const displayLon =
      transect.lonStart + (transect.lonEnd - transect.lonStart) * progress;
    const sample = sampleOcean(
      dataset,
      frameIndex,
      displayLon,
      transect.lat,
    );
    return {
      ...sample,
      index,
      progress,
      displayLon,
    };
  });
}

export interface TransectSummary {
  stepCount: number;
  oceanSteps: number;
  sstMin: number | null;
  sstMax: number | null;
  sstMean: number | null;
  speedMax: number | null;
  strongest: TransectSample | null;
}

export function summarizeTransect(samples: TransectSample[]): TransectSummary {
  const withSst = samples.filter((s) => s.sst !== null);
  const withSpeed = samples.filter((s) => s.speed !== null);
  const sstValues = withSst.map((s) => s.sst as number);
  const strongest =
    withSpeed.reduce<TransectSample | null>(
      (best, sample) =>
        best === null || (sample.speed as number) > (best.speed as number)
          ? sample
          : best,
      null,
    );

  return {
    stepCount: samples.length,
    oceanSteps: withSst.length,
    sstMin: sstValues.length ? Math.min(...sstValues) : null,
    sstMax: sstValues.length ? Math.max(...sstValues) : null,
    sstMean: sstValues.length
      ? sstValues.reduce((sum, value) => sum + value, 0) / sstValues.length
      : null,
    speedMax: strongest?.speed ?? null,
    strongest,
  };
}

export function frameAt(dataset: OceanDataset, index: number): OceanFrameMeta {
  return dataset.meta.frames[
    Math.max(0, Math.min(dataset.meta.frames.length - 1, index))
  ];
}

export function formatLongitude(lon: number, digits = 1): string {
  const norm = normalizeLon(lon);
  if (Math.abs(norm) < 0.05) return `${(0).toFixed(digits)}°`;
  return `${Math.abs(norm).toFixed(digits)}° ${norm > 0 ? "E" : "W"}`;
}

export function formatLatitude(lat: number, digits = 1): string {
  if (Math.abs(lat) < 0.05) return "0.0°";
  return `${Math.abs(lat).toFixed(digits)}° ${lat > 0 ? "N" : "S"}`;
}

export function formatSst(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)} °C`;
}

export function formatSpeed(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)} m/s`;
}

export function compassPoint(bearing: number): string {
  const index = Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16;
  return COMPASS[index];
}

export function formatBearing(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(0)}° ${compassPoint(value)}`;
}

export function formatSampleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Plain-language reading grounded only in the sampled values.
 * Used by the visible readout and browser speech synthesis.
 */
export function describeSample(
  sample: TransectSample | null,
  transect: TransectDefinition,
  frame: OceanFrameMeta,
): string {
  if (!sample) {
    return `No ocean sample is available on the ${transect.label} transect for ${frame.label}.`;
  }

  const position = `${formatLongitude(sample.displayLon)}, ${formatLatitude(sample.lat)}`;
  if (sample.sst === null && sample.speed === null) {
    return `At ${position}, this transect crosses land or a gap in the source fields. No temperature or current value is reported.`;
  }
  if (sample.sst === null) {
    return `At ${position}, current speed is ${formatSpeed(sample.speed)} toward ${formatBearing(sample.bearing)}. Sea surface temperature is missing in the source field here.`;
  }
  if (sample.speed === null) {
    return `At ${position}, sea surface temperature is ${formatSst(sample.sst)}. Current velocity is missing in the source field here.`;
  }

  return `At ${position}, sea surface temperature is ${formatSst(sample.sst)}. The current flows toward ${formatBearing(sample.bearing)} at ${formatSpeed(sample.speed)}.`;
}
