export type CarbonSeriesId =
  | "co2Ppm"
  | "co2AnnualChangePpm"
  | "fossilGtC"
  | "landUseGtC"
  | "emissionsGtC"
  | "atmosphericGrowthGtC"
  | "oceanSinkGtC"
  | "landSinkGtC"
  | "cementSinkGtC"
  | "sinkGtC"
  | "imbalanceGtC";

export interface CarbonSource {
  id: string;
  provider: string;
  product: string;
  url: string;
  doi?: string;
  variable: string;
  unit: string;
  resolution: string;
  coverage: string;
  citation: string;
}

export interface CarbonRange {
  min: number;
  max: number;
}

export interface CarbonNormalization {
  co2Ppm: CarbonRange;
  fossilGtC: CarbonRange;
  landUseGtC: CarbonRange;
  oceanSinkGtC: CarbonRange;
  landSinkGtC: CarbonRange;
  imbalanceGtC: CarbonRange;
}

export interface CarbonSeriesStats {
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  p02: number | null;
  p98: number | null;
}

export interface CarbonDatasetMeta {
  title: string;
  period: { start: number; end: number; label: string };
  temporalResolution: "annual";
  spatialResolution: "global";
  yearCount: number;
  units: Record<CarbonSeriesId, string>;
  sources: CarbonSource[];
  definitions: Record<
    "concentration" | "emission" | "flux" | "stock" | "imbalance",
    string
  >;
  normalization: CarbonNormalization;
  statistics: Record<CarbonSeriesId, CarbonSeriesStats>;
  latest: CarbonYear;
  limitations: string[];
  provenanceNote: string;
}

export interface CarbonDataset {
  meta: CarbonDatasetMeta;
  years: number[];
  series: Record<CarbonSeriesId, Array<number | null>>;
}

export interface CarbonYear {
  year: number;
  /** Annual mean atmospheric CO₂ at Mauna Loa, ppm. */
  co2Ppm: number;
  /** Change in annual mean from the previous year, ppm/yr. */
  co2AnnualChangePpm: number | null;
  /** Fossil fuel and industrial emissions, GtC/yr, positive into atmosphere. */
  fossilGtC: number;
  /** Land-use change emissions, GtC/yr, positive into atmosphere. */
  landUseGtC: number;
  /** Fossil + land-use emissions, GtC/yr. */
  emissionsGtC: number;
  /** Annual atmospheric CO₂ growth, GtC/yr. */
  atmosphericGrowthGtC: number;
  /** Ocean sink, GtC/yr; positive = atmosphere to ocean. */
  oceanSinkGtC: number;
  /** Land sink, GtC/yr; positive = atmosphere to land. */
  landSinkGtC: number;
  /** Cement carbonation sink, GtC/yr. */
  cementSinkGtC: number;
  /** Ocean + land + cement sinks, GtC/yr. */
  sinkGtC: number;
  /** Budget residual, GtC/yr. Not a physical flux. */
  imbalanceGtC: number;
}

export type CarbonLayerId =
  | "atmosphere"
  | "emissions"
  | "ocean"
  | "land"
  | "balance";

export type CarbonFlowId =
  | "atmosphere"
  | "fossil"
  | "landUse"
  | "ocean"
  | "land"
  | "imbalance";

export interface CarbonLayerDefinition {
  id: CarbonLayerId;
  label: string;
  shortLabel: string;
  scientific: string;
  sonification: string;
  limitation: string;
}
