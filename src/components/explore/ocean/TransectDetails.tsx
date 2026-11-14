import {
  formatBearing,
  formatLatitude,
  formatLongitude,
  formatSpeed,
  formatSst,
} from "@/lib/ocean/dataset";
import type {
  OceanFrameMeta,
  TransectDefinition,
  TransectSample,
} from "@/lib/ocean/types";

interface TransectDetailsProps {
  samples: TransectSample[];
  transect: TransectDefinition;
  frame: OceanFrameMeta;
}

export function TransectDetails({
  samples,
  transect,
  frame,
}: TransectDetailsProps) {
  const rows = samples.filter((_, index) => index % 4 === 0);

  return (
    <details className="transect-details">
      <summary>
        <span>Traceable transect readings</span>
        <span className="transect-summary-meta">
          {rows.length} rows · {frame.label} · {formatLatitude(transect.lat)}
        </span>
      </summary>
      <div className="transect-table-wrap">
        <table>
          <caption>
            Values sampled along the {transect.label} transect for {frame.label}.
            Every fourth listening step is shown. Missing source cells are not
            filled or smoothed.
          </caption>
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Longitude</th>
              <th scope="col">SST</th>
              <th scope="col">Current speed</th>
              <th scope="col">Flows toward</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((sample) => (
              <tr key={sample.index}>
                <td data-label="Step">{String(sample.index + 1).padStart(2, "0")}</td>
                <td data-label="Longitude">
                  {formatLongitude(sample.displayLon)}
                </td>
                <td data-label="SST">
                  {sample.sst === null ? "Missing" : formatSst(sample.sst)}
                </td>
                <td data-label="Current speed">
                  {sample.speed === null ? "Missing" : formatSpeed(sample.speed)}
                </td>
                <td data-label="Flows toward">
                  {sample.bearing === null
                    ? "Missing"
                    : formatBearing(sample.bearing)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="transect-note">
        Rows are bilinear samples of the 1.5° shared grid. The full transect has{" "}
        {samples.length} points; the table thins them for reading. OSCAR
        currents are a 15 m near-surface product, and OISST is a daily blended
        analysis.
      </p>
    </details>
  );
}
