#!/usr/bin/env node
/** Validate the pure air-quality mapping. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  AIR_AUDIO_LIMITS,
  airPanForLongitude,
  mapAirSample,
} from "../src/lib/air/mapping.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/air-quality-2023.json"), "utf8"),
);
const ranges = data.meta.normalization;
const city = data.cities[0];

function makeSample(values, lon = city.lon) {
  return {
    city: { ...city, lon },
    hourIndex: 0,
    timestamp: new Date(data.meta.period.start),
    values,
  };
}

const low = mapAirSample(
  makeSample({ pm25: ranges.pm25.min, no2: ranges.no2.min, ozone: ranges.ozone.min }),
  ranges,
);
const high = mapAirSample(
  makeSample({ pm25: ranges.pm25.max, no2: ranges.no2.max, ozone: ranges.ozone.max }),
  ranges,
);
assert.ok(high.pm25Gain > low.pm25Gain);
assert.ok(high.pm25CutoffHz > low.pm25CutoffHz);
assert.ok(high.no2PulseHz > low.no2PulseHz);
assert.ok(high.no2CutoffHz > low.no2CutoffHz);
assert.ok(high.ozoneGain > low.ozoneGain);
assert.ok(high.ozoneCutoffHz > low.ozoneCutoffHz);
assert.ok(high.pm25Gain <= 0.1 && high.no2Gain <= 0.1 && high.ozoneGain <= 0.06);

// Missing values must silence their voice, not become zero.
const missing = mapAirSample(
  makeSample({ pm25: null, no2: null, ozone: null }),
  ranges,
);
assert.equal(missing.hasPm25, false);
assert.equal(missing.hasNo2, false);
assert.equal(missing.hasOzone, false);

// Western cities left, eastern cities right; the map is a convention.
assert.ok(airPanForLongitude(-122) < 0);
assert.ok(airPanForLongitude(-75) > 0);
assert.ok(Math.abs(airPanForLongitude(-122)) <= AIR_AUDIO_LIMITS.panLimit);
assert.equal(airPanForLongitude(-122), airPanForLongitude(-122));

// Determinism.
assert.deepEqual(
  mapAirSample(makeSample({ pm25: 12.3, no2: 24.5, ozone: 0.045 }), ranges),
  mapAirSample(makeSample({ pm25: 12.3, no2: 24.5, ozone: 0.045 }), ranges),
);

for (const value of Object.values(high)) {
  if (typeof value === "number") assert.ok(Number.isFinite(value));
}

console.log("Air-quality sonification verified");
console.log(
  `  PM2.5             cutoff ${low.pm25CutoffHz.toFixed(0)} … ${high.pm25CutoffHz.toFixed(0)} Hz; gain ${low.pm25Gain.toFixed(3)} … ${high.pm25Gain.toFixed(3)}`,
);
console.log(
  `  NO2               pulse ${low.no2PulseHz.toFixed(2)} … ${high.no2PulseHz.toFixed(2)} Hz`,
);
console.log(
  `  O3                cutoff ${low.ozoneCutoffHz.toFixed(0)} … ${high.ozoneCutoffHz.toFixed(0)} Hz`,
);
console.log(
  `  stereo            west ${airPanForLongitude(-122).toFixed(2)}, east ${airPanForLongitude(-75).toFixed(2)}`,
);
console.log("  missing pollutants silence their voices; mapping is deterministic");
