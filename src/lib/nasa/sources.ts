import type { ScientificDataset } from "@/lib/science/types";

/**
 * Verified NASA SVS record metadata.
 *
 * Every field below was read from https://svs.gsfc.nasa.gov/api/3912 on
 * 14 November 2026. No values are inferred, simulated, or generated.
 */
export const NASA_SVS_RECORD = {
  id: 3912,
  title: "Global Sea Surface Currents and Temperature",
  publisher: "NASA Scientific Visualization Studio",
  pageUrl: "https://svs.gsfc.nasa.gov/3912/",
  apiUrl: "https://svs.gsfc.nasa.gov/api/3912",
  releaseDate: "2012-03-16",
  updatedDate: "2025-02-18",
  releaseLabel: "16 Mar 2012",
  period: {
    start: "2007-03-25T12:00:00Z",
    end: "2008-03-03T12:00:00Z",
    label: "25 Mar 2007 — 03 Mar 2008",
    shortLabel: "2007.03.25 — 2008.03.03",
  },
  model: {
    name: "ECCO2",
    fullName:
      "Estimating the Circulation and Climate of the Ocean, Phase II",
    solver: "MITgcm",
    resolution: "18–30 km horizontal, cube-sphere, 50 vertical levels",
  },
  datasets: [
    {
      name: "ECCO2 High Resolution Ocean and Sea Ice Model",
      type: "Model",
      organization: "NASA/JPL",
    },
    {
      name: "GTOPO30 Topography and Bathymetry",
      type: "Data compilation",
      organization: "USGS",
    },
  ],
  credits: {
    visualization: [
      { name: "Greg Shirah", employer: "NASA/GSFC" },
      { name: "Horace Mitchell", employer: "NASA/GSFC" },
      { name: "Eric Sokolowsky", employer: "Global Science and Technology, Inc." },
    ],
    producer: "Michael Starobin, HTSI",
    scientists: [
      { name: "Hong Zhang", employer: "UCLA" },
      { name: "Dimitris Menemenlis", employer: "NASA/JPL CalTech" },
    ],
  },
  still: {
    src: "/assets/nasa/ecco2-global-currents-sst-2048.jpg",
    width: 2048,
    height: 1024,
    bytes: 1_026_047,
    mediaType: "image/jpeg",
    frame: 25000,
    timestamp: "2007-06-19T12:00:00Z",
    timestampLabel: "19 Jun 2007 / 12:00Z",
    alt: "A flat global map of Earth's oceans. Continents appear dark gray. Fine, swirling current filaments cover the ocean in bands of blue, green, yellow, orange, and red, with the warmest colors near the equator and western boundary currents.",
    caption:
      "Single frame from the animation, 19 June 2007 12:00 UTC. Surface current flow colored by sea surface temperature; not a live view.",
    credit: "NASA Scientific Visualization Studio / Greg Shirah",
  },
  license: {
    label: "NASA media usage guidelines",
    url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    note: "NASA SVS states that its content is in the public domain unless otherwise noted. This record does not note licensed music, and the project uses only one rendered still, not the video or audio.",
  },
  validatedOn: "14 Nov 2026",
} as const;

/**
 * ECCO2 as it relates to this visualization.
 *
 * This is a descriptive record, not loaded data. Every variable is explicitly
 * "not-connected": Stage 1 has no numerical ECCO2 fields. The exact model
 * release behind the 2012 render remains unresolved and is documented in
 * docs/DATA_SOURCE_REPORT.md.
 */
export const ECCO2_CONTEXT: ScientificDataset = {
  id: "ecco2-cube92",
  title: "ECCO2 ocean and sea-ice state estimate (legacy product)",
  provider: "ECCO consortium / NASA JPL",
  model: "MITgcm",
  temporal: {
    start: NASA_SVS_RECORD.period.start,
    end: NASA_SVS_RECORD.period.end,
    resolution: "Rendered animation covers one model year",
  },
  spatial: {
    west: -180,
    east: 180,
    south: -90,
    north: 90,
    resolution: "18–30 km horizontal, cube-sphere",
    grid: "ECCO2 cube-sphere, 50 vertical levels",
  },
  provenance: "scientific-data",
  sourceUrl: "https://ecco-group.org/products.htm",
  citation:
    "ECCO Consortium. ECCO2 / ECCO Cube92. Dataset description accessed 14 November 2026.",
  accessNote:
    "The NASA SVS API publishes rendered media, not numerical ECCO2 fields. The legacy ECCO JPL data host was unreachable during validation; PO.DAAC access requires NASA Earthdata Login and the current ECCO V4r4 product is not the same release used for this 2012 visualization.",
  variables: [
    {
      id: "sea_surface_temperature",
      label: "Sea surface temperature",
      symbol: "SST",
      unit: "degrees-celsius",
      description:
        "Temperature at the ocean surface in the ECCO2 model output. NASA's render encodes it as color. The bundled frame has no embedded colorbar, and a rendered color scale would still not provide validated field values. Exact values require the numerical ECCO2 data.",
      provenance: "scientific-data",
      status: "not-connected",
    },
    {
      id: "eastward_surface_velocity",
      label: "Eastward surface velocity",
      symbol: "u",
      unit: "meters-per-second",
      description:
        "Zonal component of modeled surface current velocity. NASA's animation traces it as moving flow.",
      provenance: "scientific-data",
      status: "not-connected",
    },
    {
      id: "northward_surface_velocity",
      label: "Northward surface velocity",
      symbol: "v",
      unit: "meters-per-second",
      description:
        "Meridional component of modeled surface current velocity. NASA's animation traces it as moving flow.",
      provenance: "scientific-data",
      status: "not-connected",
    },
  ],
};

export const ECCO2_ACCESS_LINKS = [
  {
    label: "ECCO product overview",
    href: "https://ecco-group.org/products.htm",
    note: "Legacy ECCO2 product description and ECCO Cube92 period, domain, and resolution.",
  },
  {
    label: "ECCO datasets at PO.DAAC",
    href: "https://ecco-group.org/datasets.htm",
    note: "Current ECCO data distribution. Most products require NASA Earthdata Login.",
  },
  {
    label: "NASA SVS record 3912",
    href: "https://svs.gsfc.nasa.gov/3912/",
    note: "Rendered visualization, media downloads, and credits.",
  },
  {
    label: "NASA SVS Page API",
    href: "https://svs.gsfc.nasa.gov/api/3912",
    note: "Machine-readable metadata used to verify this record.",
  },
] as const;
