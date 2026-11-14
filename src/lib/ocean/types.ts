/**
 * Ocean dataset contracts.
 *
 * Values are real, gridded, historical fields. The browser receives a reduced
 * subset from /public/data, never a raw multi-terabyte NetCDF collection.
 * Missing cells are first-class: they are never coerced to zero.
 */

export type OceanVariableId = "sst" | "u" | "v";

export interface OceanGrid {
  projection: "equirectangular";
  lonStart: number;
  lonStep: number;
  lonCount: number;
  latStart: number;
  latStep: number;
  latCount: number;
  rowOrder: "north-to-south" | "south-to-north";
}

export interface OceanVariableMeta {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  unitLabel: string;
  scale: number;
  fill: number;
  product: string;
}

export interface OceanSource {
  id: string;
  name: string;
  provider: string;
  institution?: string;
  access: string;
  url: string;
  citation: string;
  variables: OceanVariableId[];
  depth: string;
  resolution: string;
  license: string;
}

export interface OceanFrameStats {
  min: number | null;
  max: number | null;
  p02: number | null;
  p98: number | null;
  mean: number | null;
  count?: number;
}

export interface OceanFrameMeta {
  index: number;
  month: string;
  label: string;
  oscarTime: string;
  oisstTime: string;
  stats: {
    sst: OceanFrameStats;
    speed: OceanFrameStats;
  };
}

export interface OceanDatasetMeta {
  schemaVersion: 1;
  id: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
    label: string;
    note: string;
  };
  grid: OceanGrid;
  variables: Record<OceanVariableId, OceanVariableMeta>;
  normalization: {
    sst: { min: number; max: number; method: string };
    speed: { min: number; max: number; method: string };
  };
  stats: {
    sst: OceanFrameStats;
    speed: OceanFrameStats;
    cellsPerFrame: number;
    cellsTotal: number;
  };
  frames: OceanFrameMeta[];
  binary: {
    path: string;
    bytes: number;
    dtype: "int16-le";
    layout: string;
    fill: number;
  };
  sources: OceanSource[];
  processing: string[];
  limitations: string[];
}

/** Decoded, ready-to-sample dataset held in memory. */
export interface OceanDataset {
  meta: OceanDatasetMeta;
  /** Little-endian Int16 values, frame-major, sst/u/v, row-major. */
  values: Int16Array;
  /** Which frame indexes are loaded. */
  loaded: boolean;
}

export interface OceanSample {
  /** Longitude in degrees east, normalized to [-180, 180]. */
  lon: number;
  /** Latitude in degrees north. */
  lat: number;
  sst: number | null;
  u: number | null;
  v: number | null;
  /** Derived from u and v; null when either component is missing. */
  speed: number | null;
  /** Compass bearing the current flows toward, degrees clockwise from north. */
  bearing: number | null;
}

export interface TransectDefinition {
  id: string;
  label: string;
  shortLabel: string;
  lat: number;
  lonStart: number;
  lonEnd: number;
  description: string;
  whyItMatters: string;
}

export interface TransectSample extends OceanSample {
  /** Index along the transect, 0-based. */
  index: number;
  /** Fractional position along the transect, [0, 1]. */
  progress: number;
  /** Longitude label before normalization, may exceed 180 for Pacific crossings. */
  displayLon: number;
}
