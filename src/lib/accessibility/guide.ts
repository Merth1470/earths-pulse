/**
 * The spoken guide, kept as data.
 *
 * One module feeds three surfaces: the voice assistant, the visible keyboard
 * dialog, and `aria-keyshortcuts` on the real controls. If a key changes, it
 * changes here once.
 *
 * Every sentence must describe a control that actually exists. Do not add a
 * shortcut to this file without wiring it in `VoiceGuide.tsx`.
 */

export interface KeyRow {
  keys: string;
  label: string;
}

export interface KeyGroup {
  id: string;
  title: string;
  rows: KeyRow[];
  note?: string;
}

export interface RouteShortcut {
  key: string;
  href: string;
  label: string;
}

/** Single-keystroke page jumps. Digits are unused by native controls. */
export const ROUTE_SHORTCUTS: RouteShortcut[] = [
  { key: "1", href: "/ocean", label: "Ocean" },
  { key: "2", href: "/carbon", label: "Carbon Cycle" },
  { key: "3", href: "/air-quality", label: "Air Quality" },
  { key: "4", href: "/about", label: "About" },
  { key: "5", href: "/data-sources", label: "Data sources" },
  { key: "6", href: "/accessibility", label: "Accessibility guide" },
  { key: "0", href: "/", label: "Home" },
];

export function routeShortcutFor(href: string): string | undefined {
  return ROUTE_SHORTCUTS.find((item) => item.href === href)?.key;
}

/** Groups rendered in the keyboard dialog and spoken by the `?` shortcut. */
export const KEY_GROUPS: KeyGroup[] = [
  {
    id: "moving",
    title: "Move and activate",
    rows: [
      { keys: "Tab", label: "Next control" },
      { keys: "Shift + Tab", label: "Previous control" },
      { keys: "Enter or Space", label: "Activate the focused button, link, checkbox, or disclosure" },
      { keys: "Arrow keys", label: "Change a selector or move a slider one step" },
      { keys: "Home / End", label: "Jump a slider to its first or last sample" },
      { keys: "Escape", label: "Stop the voice, close this list" },
    ],
  },
  {
    id: "pages",
    title: "Go to a page",
    rows: ROUTE_SHORTCUTS.map((item) => ({
      keys: item.key,
      label: item.label,
    })),
  },
  {
    id: "guide",
    title: "This guide",
    rows: [
      { keys: "H", label: "Replay the spoken guide for this page" },
      { keys: "?", label: "Open and speak this shortcut list" },
      { keys: "M", label: "Silence or restore the voice" },
    ],
  },
  {
    id: "instrument",
    title: "Inside an instrument",
    rows: [
      { keys: "P", label: "Play or pause the sonification" },
      { keys: "S", label: "Stop and return to the first sample" },
      { keys: "R", label: "Read the current measurement aloud" },
      { keys: "J", label: "Jump to the sample slider, then use the arrow keys" },
      { keys: "V", label: "Jump to the volume slider" },
      { keys: "L", label: "Jump to the first sound-layer switch" },
      { keys: "C", label: "Jump to the first selector on the page" },
    ],
    note:
      "These four instrument shortcuts also work while a slider has focus, so you never have to tab away from the sample you are listening to.",
  },
];

/** Spoken form of a key row, used by the `?` narration. */
function spokenRow(row: KeyRow): string {
  const keys = row.keys
    .replace(" + ", " plus ")
    .replace("Home / End", "Home or End")
    .replace("Enter or Space", "Enter or Space");
  return `${keys}: ${row.label}.`;
}

export function keyGroupSpeech(): string[] {
  return KEY_GROUPS.flatMap((group) => [
    group.title + ".",
    ...group.rows.map(spokenRow),
  ]);
}

/**
 * The opening narration. It names the replay shortcut in the first breath,
 * because a listener who misses the rest needs one key to get it back.
 */
export const GUIDE_INTRO: string[] = [
  "Welcome to Earth's Pulse.",
  "This site turns public scientific measurements of the ocean, the carbon cycle, and city air into sound.",
  "Every control works from the keyboard, so nothing on this site requires a mouse or a screen.",
  "Press the letter H at any time to hear this guide again.",
  "Press the question mark key for the complete list of keyboard shortcuts.",
];

/** The practical how-to. Replayed by H together with the current page guide. */
export const ESSENTIAL_KEYS: string[] = [
  "Here is how to move around.",
  "Press Tab to move to the next control, and Shift plus Tab to move back.",
  "Press Enter or Space to activate the focused button, link, or checkbox.",
  "Arrow keys change a selector or move a slider one step at a time.",
  "Press 1 for the ocean, 2 for the carbon cycle, 3 for air quality, 4 for about, 5 for data sources, 6 for the accessibility guide, and 0 for the home page.",
  "On any instrument, press P to play or pause the sound, S to stop, and R to read the current measurement aloud.",
  "Press J to jump to the sample slider, then use the arrow keys to move one sample at a time.",
  "Press V for volume, L for the sound layers, and C for the first selector on the page.",
  "Press M to silence or restore this voice, and Escape to stop it.",
];

interface RouteGuide {
  title: string;
  lines: string[];
}

const ROUTE_GUIDES: Record<string, RouteGuide> = {
  "/": {
    title: "Home",
    lines: [
      "You are on the home page.",
      "Three experience cards follow: the ocean, the carbon cycle, and the air above a city.",
      "Each card is one link, so press Tab until you hear the experience you want, then press Enter.",
      "You can also press 1, 2, or 3 to go straight to one.",
    ],
  },
  "/ocean": {
    title: "Ocean",
    lines: [
      "You are in the ocean instrument.",
      "It plays a listening route across the 2012 ocean, from west to east, with sea surface temperature and near-surface current.",
      "Press C to jump to the Region selector, then press Tab for the Month selector.",
      "Press P to play.",
      "Press J, then the arrow keys, to step one sample along the route.",
      "The reading panel names the temperature, the current speed, and the compass direction the water flows toward.",
      "Press R to hear the current sample spoken, and S to stop.",
    ],
  },
  "/carbon": {
    title: "Carbon cycle",
    lines: [
      "You are in the carbon instrument.",
      "It plays one annual record per year, from 1959 to 2024, with five separate voices.",
      "Press C to jump to the Year selector, then use the arrow keys to step one year at a time.",
      "Press P to play the annual sequence, and J to move the sample slider.",
      "Press R to hear the selected year read aloud, and L to switch individual voices off and on.",
      "Press S to stop.",
    ],
  },
  "/air-quality": {
    title: "Air quality",
    lines: [
      "You are in the city air instrument.",
      "It plays one day of hourly measurements from a single EPA ground monitor.",
      "Press C to jump to the City selector, then press Tab for the comparison city and the highlighted pollutant.",
      "Press Tab again to reach the day selector, and the hour slider after it.",
      "Press P to play the day, R to hear the selected hour read aloud, and S to stop.",
    ],
  },
  "/about": {
    title: "About",
    lines: [
      "You are on the About page.",
      "It explains the method, the data sources, and the limits of sonification.",
      "Press Tab to read through the sections, or press 5 for data sources and 6 for the accessibility guide.",
    ],
  },
  "/data-sources": {
    title: "Data sources",
    lines: [
      "You are on the Data sources page.",
      "Each record names its provider, period, resolution, units, and limits.",
      "Press Tab to move through the source tables. Wide tables scroll with the arrow keys once they have focus.",
    ],
  },
  "/accessibility": {
    title: "Accessibility",
    lines: [
      "You are on the Accessibility guide.",
      "It describes the nonvisual path for each instrument, the keyboard controls, and the known limits.",
      "Press Tab for the sections, or press H to hear this page's guide again.",
    ],
  },
};

const FALLBACK_GUIDE: RouteGuide = {
  title: "Earth's Pulse",
  lines: [
    "This page is part of Earth's Pulse.",
    "Press Tab to read it, or press 0 for the home page and 1 for the ocean instrument.",
  ],
};

export function routeGuide(pathname: string): RouteGuide {
  return ROUTE_GUIDES[pathname] ?? FALLBACK_GUIDE;
}

/** The full page guide: what this page is, then how to drive it. */
export function pageGuideSpeech(pathname: string): string[] {
  return [...routeGuide(pathname).lines];
}

/** What H replays: the page, then the essential keys, then the replay reminder. */
export function replaySpeech(pathname: string): string[] {
  return [
    ...routeGuide(pathname).lines,
    ...ESSENTIAL_KEYS,
    "Press question mark for the complete shortcut list.",
    "Press H again to repeat this.",
  ];
}

/** What the intro plays on first load. */
export function introSpeech(pathname: string): string[] {
  return [...GUIDE_INTRO, ...routeGuide(pathname).lines];
}

/** What the question mark plays: the opening, then every key. */
export function fullGuideSpeech(): string[] {
  return [
    ...GUIDE_INTRO,
    ...ESSENTIAL_KEYS,
    ...keyGroupSpeech(),
    "Press Escape to close this list.",
  ];
}
