"use client";

import {
  airDayCount,
  airDayLabel,
  airDayShortLabel,
  airHourOfDay,
  airTimestampLabel,
  airTimeAt,
} from "@/lib/air/dataset";
import type { AirDataset } from "@/lib/air/types";

interface AirTimelineProps {
  dataset: AirDataset;
  hourIndex: number;
  validHours: number;
  onDay: (dayIndex: number) => void;
  onHour: (hourIndex: number) => void;
}

export function AirTimeline({
  dataset,
  hourIndex,
  validHours,
  onDay,
  onHour,
}: AirTimelineProps) {
  const dayIndex = Math.floor(hourIndex / 24);
  const hour = airHourOfDay(hourIndex);
  const timestamp = airTimeAt(dataset, hourIndex);

  return (
    <section aria-labelledby="air-time-title" className="air-time-panel">
      <div className="air-time-head">
        <div>
          <h2 className="panel-title" id="air-time-title">
            Time
          </h2>
          <p className="air-time-current">{airTimestampLabel(timestamp)}</p>
        </div>
        <span className="air-time-resolution">hourly · UTC · no interpolation</span>
      </div>

      <label className="air-day-select" htmlFor="air-day">
        <span>Day</span>
        <select
          id="air-day"
          onChange={(event) => {
            const nextDay = Number(event.currentTarget.value);
            onDay(nextDay);
          }}
          value={dayIndex}
        >
          {Array.from({ length: airDayCount(dataset) }, (_, index) => (
            <option key={index} value={index}>
              {airDayLabel(dataset, index)}
            </option>
          ))}
        </select>
      </label>

      <label className="air-hour-control">
        <span>
          Hour <span className="air-hour-value">{String(hour).padStart(2, "0")}:00 UTC</span>
        </span>
        <input
          aria-valuetext={`${String(hour).padStart(2, "0")}:00 UTC, ${airDayShortLabel(
            dataset,
            dayIndex,
          )}`}
          max={23}
          min={0}
          onChange={(event) => onHour(dayIndex * 24 + Number(event.currentTarget.value))}
          step={1}
          type="range"
          value={hour}
        />
      </label>

      <div className="air-hour-marks" aria-hidden="true">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
      <p className="air-time-note">
        {validHours} of 24 hourly samples present for this city on this day.
        Missing hours stay missing; they are not filled from a daily average.
      </p>
    </section>
  );
}
