export const PROJECT = {
  name: "Earth's Pulse",
  tagline: "Listen to what you cannot see.",
  description:
    "An interactive scientific sonification instrument that translates global ocean near-surface currents and sea surface temperature into sound. Built from public OSCAR and NOAA OISST fields, with an explicit, reproducible mapping.",
  challenge: "NASA Space Apps Challenge",
  stage: {
    number: "02",
    label: "Ocean sonification",
    audioState: "Web Audio engine",
    dataState: "OSCAR + OISST, 2012 subset",
    validatedOn: "14 Nov 2026",
  },
  links: {
    nasaMediaGuidelines: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    eccoProducts: "https://ecco-group.org/products.htm",
    eccoDatasets: "https://ecco-group.org/datasets.htm",
    oscar: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar",
    oisst: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg",
    spaceApps: "https://www.spaceappschallenge.org/",
  },
  nav: [
    { href: "/", label: "Explore" },
    { href: "/about", label: "About" },
    { href: "/accessibility", label: "Accessibility" },
    { href: "/data-sources", label: "Data Sources" },
  ],
} as const;

export type ProjectNavItem = (typeof PROJECT.nav)[number];
