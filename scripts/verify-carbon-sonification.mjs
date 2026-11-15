#!/usr/bin/env node
/** Validate the pure carbon sonification mapping. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  CARBON_AUDIO_LIMITS,
  mapCarbonYear,
} from "../src/lib/carbon/mapping.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/carbon-1959-2024.json"), "utf8"),
);
const ranges = data.meta.normalization;

function sampleAt(index) {
  const year = data.years[index];
  const get = (key) => data.series[key][index];
  return {
    year,
    co2Ppm: get("co2Ppm"),
    co2AnnualChangePpm: get("co2AnnualChangePpm"),
    fossilGtC: get("fossilGtC"),
    landUseGtC: get("landUseGtC"),
    emissionsGtC: get("emissionsGtC"),
    atmosphericGrowthGtC: get("atmosphericGrowthGtC"),
    oceanSinkGtC: get("oceanSinkGtC"),
    landSinkGtC: get("landSinkGtC"),
    cementSinkGtC: get("cementSinkGtC"),
    sinkGtC: get("sinkGtC"),
    imbalanceGtC: get("imbalanceGtC"),
  };
}

const first = sampleAt(0);
const last = sampleAt(data.years.length - 1);
const low = mapCarbonYear(first, ranges);
const high = mapCarbonYear(last, ranges);
const landUseHighIndex = data.series.landUseGtC.indexOf(
  Math.max(...data.series.landUseGtC),
);
const landUseHigh = mapCarbonYear(sampleAt(landUseHighIndex), ranges);
const landUseLowIndex = data.series.landUseGtC.indexOf(
  Math.min(...data.series.landUseGtC),
);
const landUseLow = mapCarbonYear(sampleAt(landUseLowIndex), ranges);
assert.equal(low.hasChange, false, "1959 has no annual change");
assert.equal(high.hasChange, true, "2024 has an annual change");
assert.ok(high.atmosphereHz > low.atmosphereHz);
assert.ok(high.fossilPulseHz > low.fossilPulseHz);
assert.ok(high.oceanGain > low.oceanGain);
assert.ok(high.landGain > low.landGain);
assert.ok(high.atmosphereCutoffHz > low.atmosphereCutoffHz);
assert.ok(high.fossilGain > low.fossilGain);
assert.ok(landUseHigh.landUseGain > landUseLow.landUseGain);
assert.ok(high.balanceGain > 0);
assert.ok(
  high.atmosphereHz >= CARBON_AUDIO_LIMITS.atmosphereMinHz &&
    high.atmosphereHz <= CARBON_AUDIO_LIMITS.atmosphereMaxHz,
);

// Concentration and its rate of change are independent controls.
const sameConcentration = { ...last, co2AnnualChangePpm: 0.5 };
const otherChange = { ...last, co2AnnualChangePpm: 3.0 };
const slow = mapCarbonYear(sameConcentration, ranges);
const fast = mapCarbonYear(otherChange, ranges);
assert.equal(slow.atmosphereHz, fast.atmosphereHz);
assert.ok(fast.atmosphereTremoloHz > slow.atmosphereTremoloHz);

// A negative flux flips direction, not magnitude.
const source = { ...last, oceanSinkGtC: -Math.abs(last.oceanSinkGtC) };
const sink = mapCarbonYear(last, ranges);
const sourceParams = mapCarbonYear(source, ranges);
assert.equal(sourceParams.oceanDirection, -1);
assert.equal(sink.oceanDirection, 1);
assert.equal(sourceParams.oceanNorm, sink.oceanNorm);
assert.ok(
  sourceParams.panOcean * sourceParams.oceanDirection !==
    sink.panOcean * sink.oceanDirection,
);

// Determinism.
assert.deepEqual(mapCarbonYear(last, ranges), high);

for (const value of Object.values(high)) {
  if (typeof value === "number") assert.ok(Number.isFinite(value));
}

console.log("Carbon sonification verified");
console.log(
  `  atmosphere        ${low.atmosphereHz.toFixed(1)} … ${high.atmosphereHz.toFixed(1)} Hz; tremolo ${low.atmosphereTremoloHz.toFixed(2)} … ${high.atmosphereTremoloHz.toFixed(2)} Hz`,
);
console.log(
  `  fossil pulse      ${low.fossilPulseHz.toFixed(2)} … ${high.fossilPulseHz.toFixed(2)} Hz`,
);
console.log(
  `  ocean/land gains  ${low.oceanGain.toFixed(3)} … ${high.oceanGain.toFixed(3)} / ${low.landGain.toFixed(3)} … ${high.landGain.toFixed(3)}`,
);
console.log("  concentration and change are independent; negative flux direction is supported");
