import type { ReactNode } from "react";

function OceanMini() {
  return (
    <svg aria-hidden="true" className="experience-visual" viewBox="0 0 320 170">
      <rect className="ev-bg" height="170" width="320" />
      <g className="ev-grid">
        <path d="M0 43 H320 M0 86 H320 M0 129 H320" />
        <path d="M80 0 V170 M160 0 V170 M240 0 V170" />
      </g>
      <g className="ev-ocean-lines">
        <path d="M-10 112 C50 84 96 132 156 106 S254 82 330 112" />
        <path d="M-10 126 C54 98 102 144 166 119 S260 99 330 126" />
        <path d="M-10 97 C44 72 96 116 150 95 S250 74 330 98" />
      </g>
      <g className="ev-currents">
        <path d="M72 94 C102 73 130 83 162 68" />
        <path d="M172 118 C198 103 224 110 252 94" />
        <path d="M52 133 C84 126 110 136 136 126" />
        <path d="M196 64 C216 53 236 58 258 46" />
      </g>
      <circle className="ev-selected" cx="156" cy="106" r="4" />
      <circle className="ev-selected-ring" cx="156" cy="106" r="10" />
      <text className="ev-label" x="16" y="24">OCEAN · 2012</text>
      <text className="ev-value" x="16" y="157">SST → pitch · speed → pulse · stereo</text>
    </svg>
  );
}

function CarbonMini() {
  return (
    <svg aria-hidden="true" className="experience-visual" viewBox="0 0 320 170">
      <rect className="ev-bg" height="170" width="320" />
      <g className="ev-grid">
        <path d="M0 43 H320 M0 86 H320 M0 129 H320" />
        <path d="M80 0 V170 M160 0 V170 M240 0 V170" />
      </g>
      <rect className="ev-box ev-box--atmo" height="38" width="116" x="102" y="18" />
      <text className="ev-label" x="112" y="34">ATMOSPHERE</text>
      <text className="ev-value" x="112" y="49">424.6 ppm</text>
      <rect className="ev-box" height="34" width="88" x="20" y="118" />
      <text className="ev-label" x="30" y="133">OCEAN</text>
      <text className="ev-value" x="30" y="147">+3.39</text>
      <rect className="ev-box" height="34" width="88" x="212" y="118" />
      <text className="ev-label" x="222" y="133">LAND</text>
      <text className="ev-value" x="222" y="147">+1.94</text>
      <rect className="ev-box ev-box--fossil" height="28" width="88" x="116" y="126" />
      <text className="ev-label" x="126" y="144">FOSSIL</text>
      <g className="ev-arrows">
        <path d="M160 124 V58" markerEnd="url(#mini-arrow-source)" />
        <path d="M105 58 C78 80 63 96 60 114" markerEnd="url(#mini-arrow-sink)" />
        <path d="M215 58 C244 80 260 96 264 114" markerEnd="url(#mini-arrow-sink)" />
      </g>
      <defs>
        <marker id="mini-arrow-source" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
          <path d="M0,0 L6,3 L0,6 Z" className="ev-arrow-source" />
        </marker>
        <marker id="mini-arrow-sink" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
          <path d="M0,0 L6,3 L0,6 Z" className="ev-arrow-sink" />
        </marker>
      </defs>
      <text className="ev-value" x="16" y="24">ANNUAL · 1959–2024</text>
    </svg>
  );
}

const MINI_CITIES: Array<[string, number, number]> = [
  ["LA", -118.23, 34.07],
  ["SEA", -122.31, 47.57],
  ["DEN", -105.01, 39.78],
  ["HOU", -95.22, 29.77],
  ["MIN", -93.25, 44.97],
  ["NYC", -73.82, 40.74],
  ["PHX", -112.14, 33.48],
  ["PHL", -75.08, 39.99],
];

function miniProject(lon: number, lat: number) {
  return {
    x: 24 + ((lon + 130) / 65) * 272,
    y: 24 + ((50 - lat) / 27) * 112,
  };
}

function AirMini() {
  return (
    <svg aria-hidden="true" className="experience-visual" viewBox="0 0 320 170">
      <rect className="ev-bg" height="170" width="320" />
      <g className="ev-grid">
        <path d="M0 43 H320 M0 86 H320 M0 129 H320" />
        <path d="M80 0 V170 M160 0 V170 M240 0 V170" />
      </g>
      <text className="ev-label" x="16" y="20">US GROUND MONITORS · 2023</text>
      {MINI_CITIES.map(([name, lon, lat], index) => {
        const { x, y } = miniProject(lon, lat);
        return (
          <g key={name}>
            <circle
              className={index === 5 ? "ev-selected" : "ev-station"}
              cx={x}
              cy={y}
              r={index === 5 ? 4 : 2.5}
            />
            {index === 5 ? (
              <circle className="ev-selected-ring" cx={x} cy={y} r="10" />
            ) : null}
            <text className="ev-station-label" x={x + 7} y={y + 3}>
              {name}
            </text>
          </g>
        );
      })}
      <path className="ev-stereo" d="M36 154 H284" />
      <text className="ev-label" x="36" y="147">WEST</text>
      <text className="ev-label" x="258" y="147">EAST</text>
    </svg>
  );
}

export interface ExperienceVisualProps {
  kind: "ocean" | "carbon" | "air";
  children?: ReactNode;
}

export function ExperienceVisual({ kind }: ExperienceVisualProps) {
  if (kind === "ocean") return <OceanMini />;
  if (kind === "carbon") return <CarbonMini />;
  return <AirMini />;
}
