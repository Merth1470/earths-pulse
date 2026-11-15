"use client";

import type { AirCity, AirDataset, AirPollutantId } from "@/lib/air/types";
import {
  AIR_POLLUTANT_IDS,
  AIR_POLLUTANT_SHORT,
  airTimestampLabel,
  formatAirValue,
} from "@/lib/air/dataset";

interface AirCompareProps {
  dataset: AirDataset;
  city: AirCity;
  compareCity: AirCity | null;
  hourIndex: number;
  onCompare: (cityId: string) => void;
  onSelect: (cityId: string) => void;
}

export function AirCompare({
  dataset,
  city,
  compareCity,
  hourIndex,
  onCompare,
  onSelect,
}: AirCompareProps) {
  const timestamp = airTimestampLabel(
    new Date(new Date(dataset.meta.period.start).getTime() + hourIndex * 3_600_000),
  );

  return (
    <details className="air-compare">
      <summary>
        <span>Compare two cities</span>
        <span className="air-compare-summary">
          {city.name}
          {compareCity ? ` → ${compareCity.name}` : " · choose a second"}
        </span>
      </summary>
      <div className="air-compare-body">
        <label className="air-compare-select">
          <span>Second city</span>
          <select
            onChange={(event) => onCompare(event.currentTarget.value)}
            value={compareCity?.id ?? ""}
          >
            <option value="">No comparison</option>
            {dataset.cities
              .filter((option) => option.id !== city.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}, {option.state}
                </option>
              ))}
          </select>
        </label>

        {compareCity ? (
          <>
            <div className="table-wrap">
              <table className="record-table compact-table">
                <caption className="sr-only">
                  Same-hour pollutant comparison for {city.name} and{" "}
                  {compareCity.name}, {timestamp}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">{city.name}</th>
                    <th scope="col">{compareCity.name}</th>
                    <th scope="col">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {AIR_POLLUTANT_IDS.map((pollutant: AirPollutantId) => {
                    const a = city.series[pollutant][hourIndex];
                    const b = compareCity.series[pollutant][hourIndex];
                    const difference =
                      a !== null && b !== null ? b - a : null;
                    const unit = dataset.meta.pollutants[pollutant].unit;
                    return (
                      <tr key={pollutant}>
                        <th scope="row">{AIR_POLLUTANT_SHORT[pollutant]}</th>
                        <td>{formatAirValue(pollutant, a)}</td>
                        <td>{formatAirValue(pollutant, b)}</td>
                        <td className="record-mono">
                          {difference === null
                            ? "Missing"
                            : `${difference > 0 ? "+" : ""}${difference.toFixed(
                                pollutant === "ozone" ? 3 : 1,
                              )} ${unit}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="air-compare-note">
              Both values come from ground-level monitors at the same UTC hour,
              but each city has its own siting and method. This is a comparison,
              not a ranking, a city-wide average, or a health determination.
            </p>
            <div className="carbon-compare-actions">
              <button className="button-secondary" onClick={() => onSelect(city.id)} type="button">
                Hear {city.name}
              </button>
              <button
                className="button-secondary"
                onClick={() => onSelect(compareCity.id)}
                type="button"
              >
                Hear {compareCity.name}
              </button>
            </div>
          </>
        ) : (
          <p className="air-compare-note">
            Choose a second monitor to compare the same hour side by side.
            Both must have a valid value; missing values are never ranked.
          </p>
        )}
      </div>
    </details>
  );
}
