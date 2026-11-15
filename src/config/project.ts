export const PROJECT = {
  name: "Earth's Pulse",
  tagline: "Listen to what you cannot see.",
  description:
    "A three-part scientific sonification platform for ocean circulation, the global carbon cycle, and atmospheric pollution. Every sound is derived from a public measurement with an explicit, inspectable mapping.",
  challenge: "NASA Space Apps Challenge",
  stage: {
    number: "03",
    label: "Three experiences",
    audioState: "Three Web Audio engines",
    dataState: "Ocean · carbon · air quality",
    validatedOn: "14 Nov 2026",
  },
  links: {
    nasaMediaGuidelines: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    eccoProducts: "https://ecco-group.org/products.htm",
    eccoDatasets: "https://ecco-group.org/datasets.htm",
    oscar: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar",
    oisst: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg",
    spaceApps: "https://www.spaceappschallenge.org/",
    noaaGml: "https://gml.noaa.gov/ccgg/trends/",
    globalCarbonBudget: "https://globalcarbonbudget.org/",
    epaAirData: "https://aqs.epa.gov/aqsweb/airdata/download_files.html",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/ocean", label: "Ocean" },
    { href: "/carbon", label: "Carbon Cycle" },
    { href: "/air-quality", label: "Air Quality" },
    { href: "/about", label: "About" },
  ],
} as const;

export type ProjectNavItem = (typeof PROJECT.nav)[number];
