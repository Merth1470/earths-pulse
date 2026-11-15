"use client";

import { useState } from "react";

import { carbonYearAt, formatGtC, formatPpm } from "@/lib/carbon/dataset";
import type { CarbonDataset } from "@/lib/carbon/types";

interface CarbonCompareProps {
  dataset: CarbonDataset;
  onHear: (year: number) => void;
}

const FIELDS = [
  { key: "co2Ppm", label: "CO₂ concentration", unit: "ppm" },
  { key: "fossilGtC", label: "Fossil emissions", unit: "GtC/yr" },
  { key: "landUseGtC", label: "Land-use emissions", unit: "GtC/yr" },
  { key: "oceanSinkGtC", label: "Ocean sink", unit: "GtC/yr" },
  { key: "landSinkGtC", label: "Land sink", unit: "GtC/yr" },
  { key: "imbalanceGtC", label: "Budget residual", unit: "GtC/yr" },
] as const;

export function CarbonCompare({ dataset, onHear }: CarbonCompareProps) {
  const [yearA, setYearA] = useState(dataset.years[0]);
  const [yearB, setYearB] = useState(dataset.years.at(-1) ?? dataset.years[0]);
  const a = carbonYearAt(dataset, dataset.years.indexOf(yearA));
  const b = carbonYearAt(dataset, dataset.years.indexOf(yearB));

  return (
    <details className="carbon-compare">
      <summary>
        <span>Compare two supported years</span>
        <span className="carbon-compare-summary">
          {a.year} → {b.year}
        </span>
      </summary>
      <div className="carbon-compare-body">
        <div className="carbon-compare-controls">
          <label>
            Period A
            <select
              onChange={(event) => setYearA(Number(event.currentTarget.value))}
              value={yearA}
            >
              {dataset.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label>
            Period B
            <select
              onChange={(event) => setYearB(Number(event.currentTarget.value))}
              value={yearB}
            >
              {dataset.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table className="record-table compact-table">
            <caption className="sr-only">
              Side-by-side carbon values for {a.year} and {b.year}
            </caption>
            <thead>
              <tr>
                <th scope="col">Variable</th>
                <th scope="col">{a.year}</th>
                <th scope="col">{b.year}</th>
                <th scope="col">Difference</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field) => {
                const valueA = a[field.key];
                const valueB = b[field.key];
                const difference = valueB - valueA;
                return (
                  <tr key={field.key}>
                    <th scope="row">{field.label}</th>
                    <td>
                      {field.key === "co2Ppm"
                        ? formatPpm(valueA)
                        : formatGtC(valueA, 2)}
                    </td>
                    <td>
                      {field.key === "co2Ppm"
                        ? formatPpm(valueB)
                        : formatGtC(valueB, 2)}
                    </td>
                    <td className="record-mono">
                      {difference > 0 ? "+" : ""}
                      {difference.toFixed(2)} {field.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="carbon-compare-note">
          These are annual global estimates with different uncertainties. The
          difference is arithmetic, not a trend test or a causal attribution.
          Audition one year, then the other, to compare the same five voices.
        </p>
        <div className="carbon-compare-actions">
          <button className="button-secondary" onClick={() => onHear(a.year)} type="button">
            Hear {a.year}
          </button>
          <button className="button-secondary" onClick={() => onHear(b.year)} type="button">
            Hear {b.year}
          </button>
        </div>
      </div>
    </details>
  );
}
