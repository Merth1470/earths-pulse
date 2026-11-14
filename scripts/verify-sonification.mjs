/**
 * Verify the sonification mapping is deterministic, monotonic, and silent on
 * missing data. Run: npm run verify:mapping
 */
import assert from "node:assert/strict";

import {
  AUDIO_LIMITS,
  mapSample,
  normalized,
} from "../src/lib/audio/mapping.ts";

const ranges = {
  sst: { min: -1.77, max: 29.61 },
  speed: { min: 0, max: 0.536 },
};

const sample = (overrides) => ({
  lon: 0,
  lat: 0,
  sst: 20,
  u: 0.1,
  v: 0.1,
  speed: Math.hypot(0.1, 0.1),
  bearing: 45,
  ...overrides,
});

const cold = mapSample(sample({ sst: 2, speed: 0.05, u: 0.02, v: 0 }), ranges);
const warm = mapSample(sample({ sst: 28, speed: 0.5, u: 0.4, v: 0 }), ranges);
const westward = mapSample(sample({ sst: 20, speed: 0.4, u: -0.4, v: 0 }), ranges);
const northward = mapSample(sample({ sst: 20, speed: 0.2, u: 0, v: 0.2 }), ranges);
const southward = mapSample(sample({ sst: 20, speed: 0.2, u: 0, v: -0.2 }), ranges);

assert.ok(cold && warm && westward && northward && southward);
assert.ok(warm.toneHz > cold.toneHz, "warmer water must raise pitch");
assert.ok(warm.toneCutoffHz > cold.toneCutoffHz, "warmer water must brighten the filter");
assert.ok(warm.pulseRateHz > cold.pulseRateHz, "faster water must pulse faster");
assert.ok(warm.pulseDepth > cold.pulseDepth, "faster water must pulse harder");
assert.ok(warm.textureCutoffHz > cold.textureCutoffHz);
assert.ok(warm.pan > 0.5, "eastward flow must move right");
assert.ok(westward.pan < -0.5, "westward flow must move left");
assert.ok(northward.pulseHz > southward.pulseHz, "northward flow must lift the pulse");
assert.ok(
  Math.abs(warm.toneHz - mapSample(sample({ sst: 28, speed: 0.5, u: 0.4, v: 0 }), ranges).toneHz) < 1e-9,
  "same input must produce the same output",
);
assert.equal(
  mapSample(sample({ sst: null, u: null, v: null, speed: null, bearing: null }), ranges),
  null,
  "a sample with no temperature and no velocity must be silent",
);
const flowOnly = mapSample(sample({ sst: null, speed: 0.3, u: 0.3, v: 0 }), ranges);
const temperatureOnly = mapSample(
  sample({ sst: 18, speed: null, u: null, v: null, bearing: null }),
  ranges,
);
assert.equal(flowOnly?.hasTemperature, false, "a missing SST must silence the tone");
assert.equal(flowOnly?.hasFlow, true);
assert.equal(temperatureOnly?.hasFlow, false, "missing velocity must silence flow voices");
assert.equal(temperatureOnly?.hasTemperature, true);
assert.equal(normalized(15, 0, 30), 0.5);
assert.equal(normalized(Number.NaN, 0, 30), 0);
assert.ok(AUDIO_LIMITS.toneMinHz < AUDIO_LIMITS.toneMaxHz);
assert.ok(cold.toneHz >= AUDIO_LIMITS.toneMinHz);
assert.ok(warm.toneHz <= AUDIO_LIMITS.toneMaxHz + 1e-9);

console.log("Sonification mapping verified");
console.log(`  tone             ${cold.toneHz.toFixed(1)} … ${warm.toneHz.toFixed(1)} Hz`);
console.log(`  pulse rate       ${cold.pulseRateHz.toFixed(2)} … ${warm.pulseRateHz.toFixed(2)} Hz`);
console.log(`  pan              ${westward.pan.toFixed(2)} … ${warm.pan.toFixed(2)}`);
console.log("  missing sample   silent (null mapping)");
console.log("  determinism      exact repeat");
