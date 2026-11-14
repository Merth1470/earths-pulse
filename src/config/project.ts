export const PROJECT = {
  name: "Earth's Pulse",
  tagline: "Listen to what you cannot see.",
  description:
    "An interactive scientific sonification platform that translates NASA Earth observation and model data into sound. Stage 1 establishes the visual and scientific foundation.",
  challenge: "NASA Space Apps Challenge",
  stage: {
    number: "01",
    label: "Visual foundation",
    audioState: "Not implemented",
    dataState: "Rendered visualization only",
    validatedOn: "14 Nov 2026",
  },
  links: {
    nasaMediaGuidelines: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    eccoProducts: "https://ecco-group.org/products.htm",
    eccoDatasets: "https://ecco-group.org/datasets.htm",
    spaceApps: "https://www.spaceappschallenge.org/",
  },
  nav: [
    { href: "/", label: "Explore" },
    { href: "/about", label: "About" },
    { href: "/data-sources", label: "Data Sources" },
  ],
} as const;

export type ProjectNavItem = (typeof PROJECT.nav)[number];
