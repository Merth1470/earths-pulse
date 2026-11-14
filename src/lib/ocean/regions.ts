import type { TransectDefinition } from "./types";

/**
 * Listening routes.
 *
 * Each route is a straight zonal transect at one latitude across a named ocean
 * region. These are sampling paths chosen for the experience, not observed
 * drifter tracks, fronts, or boundaries.
 */
export const TRANSECTS: TransectDefinition[] = [
  {
    id: "gulf-stream",
    label: "Gulf Stream",
    shortLabel: "Gulf Stream",
    lat: 38,
    lonStart: -78,
    lonEnd: -30,
    description:
      "A west-to-east crossing of the North Atlantic at 38°N, from the US seaboard toward the Azores.",
    whyItMatters:
      "The Gulf Stream is a warm western boundary current. It carries heat poleward and is one of the most energetic surface flows in the Atlantic.",
  },
  {
    id: "equatorial-pacific",
    label: "Equatorial Pacific",
    shortLabel: "Eq. Pacific",
    lat: 0,
    lonStart: 160,
    lonEnd: 280,
    description:
      "An eastward crossing of the equatorial Pacific from 160°E to 80°W, spanning the warm pool and the cold tongue.",
    whyItMatters:
      "Equatorial currents redistribute heat across the Pacific. Their year-to-year changes are central to El Niño and La Niña.",
  },
  {
    id: "agulhas",
    label: "Agulhas Current",
    shortLabel: "Agulhas",
    lat: -34,
    lonStart: 18,
    lonEnd: 60,
    description:
      "A west-to-east crossing south of Africa at 34°S, from the Cape Basin into the Indian Ocean.",
    whyItMatters:
      "The Agulhas is a fast western boundary current. Its rings and leakage feed warm, salty water into the South Atlantic.",
  },
  {
    id: "southern-ocean",
    label: "Southern Ocean",
    shortLabel: "Southern Ocean",
    lat: -55,
    lonStart: -180,
    lonEnd: 180,
    description:
      "A full circumpolar crossing at 55°S, following the latitude band of the Antarctic Circumpolar Current.",
    whyItMatters:
      "The Antarctic Circumpolar Current connects the major ocean basins and is the largest current system on Earth by volume transport.",
  },
];

export const DEFAULT_TRANSECT = TRANSECTS[0];

export function transectById(id: string): TransectDefinition {
  return TRANSECTS.find((transect) => transect.id === id) ?? DEFAULT_TRANSECT;
}
