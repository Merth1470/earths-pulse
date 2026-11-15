import type { CarbonYear } from "@/lib/carbon/types";

export type CarbonFlowSelection =
  | "atmosphere"
  | "fossil"
  | "landUse"
  | "ocean"
  | "land"
  | "imbalance";

interface CarbonDiagramProps {
  sample: CarbonYear;
  selected: CarbonFlowSelection;
  emissionScale: number;
  sinkScale: number;
}

function width(value: number, scale: number, base = 2, span = 8) {
  const normalized = Math.max(0, Math.min(1, Math.abs(value) / Math.max(scale, 0.01)));
  return base + normalized * span;
}

function fmt(value: number, digits = 2) {
  return `${value.toFixed(digits)}`;
}

/**
 * A conceptual reservoir-and-flow diagram. It is not a geographic map and the
 * boxes are not to scale. Flow stroke width is proportional to annual GtC/yr;
 * atmospheric concentration is shown separately because it is a state, not a
 * flow. Stocks are not estimated in this dataset.
 */
export function CarbonDiagram({
  sample,
  selected,
  emissionScale,
  sinkScale,
}: CarbonDiagramProps) {
  const fossilWidth = width(sample.fossilGtC, emissionScale);
  const landUseWidth = width(sample.landUseGtC, emissionScale);
  const oceanWidth = width(sample.oceanSinkGtC, sinkScale);
  const landWidth = width(sample.landSinkGtC, sinkScale);
  const oceanDirection = sample.oceanSinkGtC < 0 ? "up" : "down";
  const landDirection = sample.landSinkGtC < 0 ? "up" : "down";

  const flowClass = (id: CarbonFlowSelection) =>
    `carbon-flow carbon-flow--${id}${selected === id ? " is-selected" : ""} carbon-flow--${id === "fossil" || id === "landUse" ? "source" : "sink"}`;

  return (
    <svg
      aria-labelledby="carbon-diagram-title carbon-diagram-desc"
      className="carbon-diagram"
      role="img"
      viewBox="0 0 900 500"
    >
      <title id="carbon-diagram-title">
        Global carbon reservoirs and annual flows for {sample.year}
      </title>
      <desc id="carbon-diagram-desc">
        A conceptual diagram, not a map. The atmosphere holds {fmt(sample.co2Ppm, 1)} ppm
        CO₂. Fossil and industrial emissions add {fmt(sample.fossilGtC)} gigatonnes of
        carbon per year, and land-use change adds {fmt(sample.landUseGtC)}. The ocean
        takes up {fmt(sample.oceanSinkGtC)}, and land takes up {fmt(sample.landSinkGtC)}.
        The accounting residual is {sample.imbalanceGtC >= 0 ? "plus" : "minus"} {fmt(Math.abs(sample.imbalanceGtC))}.
        Reservoir stocks other than the atmospheric concentration are not estimated in
        this dataset.
      </desc>

      <defs>
        <marker id="carbon-arrow-sink" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent-cyan)" />
        </marker>
        <marker id="carbon-arrow-source" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--blocked)" />
        </marker>
        <marker id="carbon-arrow-muted" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-tertiary)" />
        </marker>
      </defs>

      <g className="carbon-diagram-grid" aria-hidden="true">
        <path d="M0 155 H900 M0 315 H900" />
        <path d="M180 0 V500 M450 0 V500 M750 0 V500" />
      </g>

      <g className={`carbon-reservoir carbon-reservoir--atmosphere${selected === "atmosphere" || selected === "imbalance" ? " is-selected" : ""}`}>
        <rect height="98" rx="2" width="320" x="290" y="40" />
        <text className="carbon-reservoir-kicker" x="310" y="67">
          Atmosphere
        </text>
        <text className="carbon-reservoir-value" x="310" y="94">
          {fmt(sample.co2Ppm, 1)} ppm CO₂
        </text>
        <text className="carbon-reservoir-note" x="310" y="116">
          annual mean · Mauna Loa
        </text>
        <text className="carbon-reservoir-note" x="310" y="131">
          growth {sample.atmosphericGrowthGtC >= 0 ? "+" : ""}
          {fmt(sample.atmosphericGrowthGtC)} GtC/yr
        </text>
      </g>

      <g className={`carbon-reservoir carbon-reservoir--ocean${selected === "ocean" ? " is-selected" : ""}`}>
        <rect height="112" rx="2" width="270" x="50" y="315" />
        <text className="carbon-reservoir-kicker" x="70" y="343">
          Ocean
        </text>
        <text className="carbon-reservoir-value" x="70" y="370">
          {sample.oceanSinkGtC >= 0 ? "+" : ""}
          {fmt(sample.oceanSinkGtC)} GtC/yr
        </text>
        <text className="carbon-reservoir-note" x="70" y="392">
          sink · into ocean
        </text>
        <text className="carbon-reservoir-note" x="70" y="407">
          stock not estimated
        </text>
      </g>

      <g className={`carbon-reservoir carbon-reservoir--land${selected === "land" ? " is-selected" : ""}`}>
        <rect height="112" rx="2" width="270" x="580" y="315" />
        <text className="carbon-reservoir-kicker" x="600" y="343">
          Land ecosystems
        </text>
        <text className="carbon-reservoir-value" x="600" y="370">
          {sample.landSinkGtC >= 0 ? "+" : ""}
          {fmt(sample.landSinkGtC)} GtC/yr
        </text>
        <text className="carbon-reservoir-note" x="600" y="392">
          sink · into land
        </text>
        <text className="carbon-reservoir-note" x="600" y="407">
          stock not estimated
        </text>
      </g>

      <g className={`carbon-reservoir carbon-reservoir--fossil${selected === "fossil" ? " is-selected" : ""}`}>
        <rect height="76" rx="2" width="230" x="335" y="340" />
        <text className="carbon-reservoir-kicker" x="355" y="366">
          Fossil carbon
        </text>
        <text className="carbon-reservoir-value" x="355" y="390">
          {fmt(sample.fossilGtC)} GtC/yr
        </text>
        <text className="carbon-reservoir-note" x="355" y="407">
          to atmosphere
        </text>
      </g>

      <g className={flowClass("fossil")} aria-hidden="true">
        <path
          d="M450 338 V142"
          markerEnd="url(#carbon-arrow-source)"
          strokeWidth={fossilWidth}
        />
        <text className="carbon-flow-label" x="470" y="255">
          fossil + industry
        </text>
        <text className="carbon-flow-value" x="470" y="275">
          {fmt(sample.fossilGtC)} GtC/yr
        </text>
      </g>

      <g className={flowClass("landUse")} aria-hidden="true">
        <path
          d="M610 313 C610 240 600 190 570 142"
          markerEnd="url(#carbon-arrow-source)"
          strokeWidth={landUseWidth}
        />
        <text className="carbon-flow-label" x="640" y="190">
          land-use change
        </text>
        <text className="carbon-flow-value" x="640" y="210">
          {fmt(sample.landUseGtC)} GtC/yr
        </text>
      </g>

      <g
        className={flowClass("ocean")}
        aria-hidden="true"
        data-direction={oceanDirection}
      >
        <path
          d={
            oceanDirection === "down"
              ? "M285 142 C220 205 200 265 190 310"
              : "M190 312 C200 265 220 205 285 142"
          }
          markerEnd={
            oceanDirection === "down"
              ? "url(#carbon-arrow-sink)"
              : "url(#carbon-arrow-source)"
          }
          strokeWidth={oceanWidth}
        />
        <text className="carbon-flow-label" x="78" y="205">
          ocean exchange
        </text>
        <text className="carbon-flow-value" x="78" y="225">
          {sample.oceanSinkGtC >= 0 ? "+" : ""}
          {fmt(sample.oceanSinkGtC)} GtC/yr
        </text>
      </g>

      <g
        className={flowClass("land")}
        aria-hidden="true"
        data-direction={landDirection}
      >
        <path
          d={
            landDirection === "down"
              ? "M615 142 C680 205 710 260 720 310"
              : "M720 312 C710 260 680 205 615 142"
          }
          markerEnd={
            landDirection === "down"
              ? "url(#carbon-arrow-sink)"
              : "url(#carbon-arrow-source)"
          }
          strokeWidth={landWidth}
        />
        <text className="carbon-flow-label" x="740" y="260">
          land uptake
        </text>
        <text className="carbon-flow-value" x="740" y="280">
          {sample.landSinkGtC >= 0 ? "+" : ""}
          {fmt(sample.landSinkGtC)} GtC/yr
        </text>
      </g>

      <g className={`carbon-flow carbon-flow--balance${selected === "imbalance" ? " is-selected" : ""}`} aria-hidden="true">
        <text className="carbon-balance-kicker" x="650" y="58">
          Budget residual
        </text>
        <text className="carbon-balance-value" x="650" y="84">
          {sample.imbalanceGtC >= 0 ? "+" : ""}
          {fmt(sample.imbalanceGtC)} GtC/yr
        </text>
      </g>

      <text className="carbon-diagram-caption" x="50" y="458">
        Conceptual reservoirs, not to scale. Stroke width follows annual flux.
      </text>
      <text className="carbon-diagram-caption" x="50" y="478">
        Stocks are not estimated in this dataset.
      </text>
    </svg>
  );
}
