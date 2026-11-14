/**
 * A deliberately small subset of the NASA SVS Page API.
 *
 * Source shape verified against https://svs.gsfc.nasa.gov/api/3912 on
 * 14 November 2026. Optional fields stay optional because the SVS API does not
 * guarantee them for every record.
 */

export interface SvsPerson {
  name: string;
  employer: string;
}

export interface SvsCreditRole {
  role: string;
  people: SvsPerson[];
}

export interface SvsDataset {
  name: string;
  common_name: string;
  platform: string | null;
  sensor: string | null;
  type: string;
  organizations: string[];
  description: string;
  credit: string;
  url: string;
  date_range: string | null;
}

export interface SvsMediaInstance {
  id: number;
  url: string;
  filename: string;
  media_type: string;
  alt_text?: string;
  width: number;
  height: number;
  pixels?: number;
}

export interface SvsMediaItem {
  id: number;
  type: string;
  title: string | null;
  caption: string | null;
  instance: SvsMediaInstance;
}

export interface SvsMediaGroup {
  id: number;
  url: string;
  widget: string;
  title: string;
  caption: string;
  description: string;
  items: SvsMediaItem[];
  extra_data: Record<string, unknown> | null;
}

export interface SvsVisualization {
  id: number;
  url: string;
  page_type: string;
  title: string;
  description: string;
  release_date: string;
  update_date: string;
  main_image: SvsMediaInstance | null;
  main_video: SvsMediaInstance | null;
  main_credits: {
    "Visualizations by"?: SvsPerson[];
  };
  progress: string;
  media_groups: SvsMediaGroup[];
  credits: SvsCreditRole[];
  datasets: SvsDataset[];
  keywords: string[];
  missions: string[];
  series: string[];
}
