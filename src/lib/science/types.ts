/**
 * Scientific data contracts.
 *
 * These types are deliberately independent of React, Next.js, and the NASA SVS
 * API. A future Python/NetCDF pipeline can emit data that satisfies them, and a
 * future API route can serialize them without changing the visualization or
 * audio layers.
 *
 * No numeric values belong in this file. Ranges and measurements must come from
 * a verified dataset record, never from a guess or a rendered image.
 */

/** Where a value came from. Provenance is never collapsed into a single label. */
export type ProvenanceLayer =
  | "scientific-data"
  | "rendered-visualization"
  | "derived"
  | "synthetic";

/** Availability of a dataset, variable, or subsystem in the current build. */
export type DataStatus =
  | "available"
  | "not-connected"
  | "not-implemented"
  | "unavailable"
  | "pending";

export type DataUnit =
  | "degrees-celsius"
  | "meters-per-second"
  | "degrees-east"
  | "degrees-north"
  | "dimensionless"
  | "unknown";

export interface TemporalCoverage {
  /** ISO 8601 instant, UTC. */
  start: string;
  /** ISO 8601 instant, UTC. */
  end: string;
  /** Native temporal sampling, when known (for example "monthly mean"). */
  resolution?: string;
}

export interface SpatialCoverage {
  /** Western bound in degrees east, [-180, 180]. */
  west: number;
  /** Eastern bound in degrees east, [-180, 180]. */
  east: number;
  /** Southern bound in degrees north, [-90, 90]. */
  south: number;
  /** Northern bound in degrees north, [-90, 90]. */
  north: number;
  /** Native horizontal sampling, when known. */
  resolution?: string;
  /** Grid description, when known. */
  grid?: string;
}

export interface ScientificVariable {
  id: string;
  label: string;
  /** Short symbol used by the source dataset, for example "theta" or "u". */
  symbol?: string;
  unit: DataUnit;
  /** Plain-language description of what the variable represents. */
  description: string;
  provenance: ProvenanceLayer;
  status: DataStatus;
  /** Physical range, only when a verified source provides it. */
  validRange?: {
    min: number;
    max: number;
    unit: DataUnit;
    source: string;
  };
}

export interface ScientificDataset {
  id: string;
  title: string;
  provider: string;
  model?: string;
  variables: ScientificVariable[];
  temporal: TemporalCoverage;
  spatial: SpatialCoverage;
  provenance: ProvenanceLayer;
  sourceUrl?: string;
  citation?: string;
  /** Known access constraints that affect this application. */
  accessNote?: string;
}

/** A value mapped into the normalized domain used by the audio layer. */
export interface NormalizedSample {
  variableId: string;
  /** Normalized value in [0, 1]. */
  value: number;
  /** The unmodified source value, retained for inspection. */
  sourceValue: number;
  unit: DataUnit;
  provenance: ProvenanceLayer;
}

/** A safe, serializable frame boundary between science and presentation. */
export interface ScientificFrame {
  datasetId: string;
  /** ISO 8601 instant, UTC. */
  timestamp: string;
  samples: NormalizedSample[];
  provenance: ProvenanceLayer;
}
