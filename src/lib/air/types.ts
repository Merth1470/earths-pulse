export type AirPollutantId = "pm25" | "no2" | "ozone";

export interface AirCitySeries {
  pm25: Array<number | null>;
  no2: Array<number | null>;
  ozone: Array<number | null>;
}

export interface AirMonitor {
  name: string;
  siteId: string;
  lat: number;
  lon: number;
  measurementType: "ground-level monitoring station";
  coLocated: true;
}

export interface AirCity {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  monitor: AirMonitor;
  pocs: Record<AirPollutantId, string>;
  methods: Partial<Record<AirPollutantId, string>>;
  completeness: Record<AirPollutantId, number>;
  series: AirCitySeries;
}

export interface AirPollutantMeta {
  code: string;
  name: string;
  label: string;
  unit: string;
  description: string;
  limits: string;
  temporalResolution: "hourly";
  measurementType: "ground-level monitor";
}

export interface AirNormalization {
  pm25: { min: number; max: number; unit: string };
  no2: { min: number; max: number; unit: string };
  ozone: { min: number; max: number; unit: string };
}

export interface AirStats {
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  p02: number | null;
  p98: number | null;
  validHours: number;
  totalHours: number;
}

export interface AirDatasetMeta {
  title: string;
  period: { start: string; end: string; label: string };
  temporalResolution: "hourly";
  timeBasis: "UTC";
  hourCount: number;
  cityCount: number;
  measurementType: string;
  selection: string;
  units: Record<AirPollutantId, string>;
  pollutants: Record<AirPollutantId, AirPollutantMeta>;
  source: {
    provider: string;
    product: string;
    url: string;
    documentation: string;
    coverage: string;
    license: string;
  };
  normalization: AirNormalization;
  statistics: Record<AirPollutantId, AirStats>;
  limitations: string[];
  provenanceNote: string;
}

export interface AirDataset {
  meta: AirDatasetMeta;
  cities: AirCity[];
}

export interface AirSample {
  city: AirCity;
  hourIndex: number;
  timestamp: Date;
  values: Record<AirPollutantId, number | null>;
}

export type AirLayerId = AirPollutantId;
