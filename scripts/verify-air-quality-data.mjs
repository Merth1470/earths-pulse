#!/usr/bin/env node
/**
 * Validate the bundled 2023 air-quality data without network access.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILE = path.join(ROOT, "public/data/air-quality-2023.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const { meta, cities } = data;

assert.equal(meta.period.label, "2023");
assert.equal(meta.temporalResolution, "hourly");
assert.equal(meta.timeBasis, "UTC");
assert.equal(meta.hourCount, 8760);
assert.equal(meta.cityCount, 8);
assert.equal(meta.measurementType.includes("Ground-level"), true);
assert.equal(meta.measurementType.includes("not satellite"), true);
assert.equal(meta.source.provider, "U.S. Environmental Protection Agency");
assert.equal(cities.length, 8);
assert.equal(new Set(cities.map((city) => city.id)).size, 8);

const pollutants = {
  pm25: { unit: "µg/m³", max: 2000 },
  no2: { unit: "ppb", max: 500 },
  ozone: { unit: "ppm", max: 1 },
};

for (const city of cities) {
  assert.ok(city.name.length > 0);
  assert.ok(city.state.length === 2);
  assert.ok(city.lat >= 24 && city.lat <= 50);
  assert.ok(city.lon >= -125 && city.lon <= -66);
  assert.equal(city.monitor.coLocated, true);
  assert.equal(city.monitor.measurementType, "ground-level monitoring station");
  assert.ok(city.monitor.siteId.match(/^\d{2}\/\d{3}\/\d{4}$/));

  for (const [pollutant, definition] of Object.entries(pollutants)) {
    const values = city.series[pollutant];
    assert.ok(Array.isArray(values), `${city.id} ${pollutant} series`);
    assert.equal(values.length, 8760, `${city.id} ${pollutant} length`);
    const valid = values.filter((value) => value !== null);
    assert.ok(valid.length > 4000, `${city.id} ${pollutant} needs usable data`);
    for (const value of valid) {
      assert.ok(Number.isFinite(value), `${city.id} ${pollutant} finite`);
      assert.ok(
        value >= -20 && value <= definition.max,
        `${city.id} ${pollutant} range (${value})`,
      );
    }
    const expectedCompleteness = valid.length / 8760;
    assert.ok(
      Math.abs(city.completeness[pollutant] - expectedCompleteness) < 0.001,
      `${city.id} ${pollutant} completeness`,
    );
    assert.equal(meta.pollutants[pollutant].unit, definition.unit);
    assert.ok(meta.pollutants[pollutant].measurementType.includes("ground"));
  }
}

for (const [pollutant, definition] of Object.entries(pollutants)) {
  const stats = meta.statistics[pollutant];
  assert.ok(stats.validHours >= 60_000, `${pollutant} valid hours`);
  assert.ok(stats.p02 <= stats.p98, `${pollutant} percentiles`);
  assert.ok(stats.max <= definition.max, `${pollutant} maximum`);
  assert.ok(meta.normalization[pollutant].min < meta.normalization[pollutant].max);
}

assert.ok(
  meta.limitations.some((line) => line.includes("not global coverage")),
  "global-scope limitation",
);
assert.ok(
  meta.limitations.some((line) => line.includes("satellite")),
  "satellite/ground distinction",
);
assert.ok(
  meta.limitations.some((line) => line.includes("not live")),
  "live-data limitation",
);

console.log("Air-quality data verified");
console.log(`  cities            ${cities.map((city) => city.name).join(", ")}`);
for (const [pollutant, stats] of Object.entries(meta.statistics)) {
  console.log(
    `  ${meta.pollutants[pollutant].name.padEnd(6)} ${stats.validHours.toLocaleString()} valid city-hours, ${stats.min}–${stats.max} ${meta.pollutants[pollutant].unit}, p98 ${stats.p98}`,
  );
}
