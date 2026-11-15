"use client";

import { formatLatitude, formatLongitude } from "@/lib/ocean/dataset";
import { TRANSECTS } from "@/lib/ocean/regions";
import type { OceanFrameMeta, TransectDefinition } from "@/lib/ocean/types";

interface FieldBarProps {
  transect: TransectDefinition;
  monthIndex: number;
  frames: OceanFrameMeta[];
  disabled?: boolean;
  onTransect: (id: string) => void;
  onMonth: (index: number) => void;
}

export function FieldBar({
  transect,
  monthIndex,
  frames,
  disabled,
  onTransect,
  onMonth,
}: FieldBarProps) {
  return (
    <div className="field-bar">
      <div className="field-control">
        <label htmlFor="field-region">Region</label>
        <select
          data-ep-select=""
          disabled={disabled}
          id="field-region"
          onChange={(event) => onTransect(event.target.value)}
          value={transect.id}
        >
          {TRANSECTS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field-control">
        <label htmlFor="field-month">Month</label>
        <select
          disabled={disabled}
          id="field-month"
          onChange={(event) => onMonth(Number(event.target.value))}
          value={monthIndex}
        >
          {frames.map((frame) => (
            <option key={frame.month} value={frame.index}>
              {frame.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field-route">
        <span className="field-route-label">Transect</span>
        <span className="field-route-value">
          {formatLatitude(transect.lat)} · {formatLongitude(transect.lonStart)} →{" "}
          {formatLongitude(transect.lonEnd)}
        </span>
      </div>

      <p className="field-hint">
        The route is a straight sampling line at one latitude, heard west to
        east. It is not a drifter track or a front.
      </p>
    </div>
  );
}
