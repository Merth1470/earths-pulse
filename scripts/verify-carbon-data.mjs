#!/usr/bin/env node
/**
 * Validate the bundled carbon data without network access.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILE = path.join(ROOT, "public/data/carbon-1959-2024.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const { meta, years, series } = data;

assert.equal(meta.period.start, 1959);
assert.equal(meta.period.end, 2024);
assert.equal(meta.yearCount, 66);
assert.equal(years.length, 66);
assert.equal(years[0], 1959);
assert.equal(years.at(-1), 2024);
assert.equal(meta.temporalResolution, "annual");
assert.equal(meta.spatialResolution, "global");
assert.equal(meta.sources.length, 2);
assert.equal(meta.sources[0].id, "noaa-mlo-co2");
assert.equal(meta.sources[1].id, "gcb-2025");
assert.ok(meta.sources[1].doi.includes("gcp-2025"));

const keys = [
  "co2Ppm",
  "co2AnnualChangePpm",
  "fossilGtC",
  "landUseGtC",
  "emissionsGtC",
  "atmosphericGrowthGtC",
  "oceanSinkGtC",
  "landSinkGtC",
  "cementSinkGtC",
  "sinkGtC",
  "imbalanceGtC",
];
for (const key of keys) {
  assert.ok(Array.isArray(series[key]), `${key} must be an array`);
  assert.equal(series[key].length, 66, `${key} must have 66 years`);
}

assert.equal(series.co2AnnualChangePpm[0], null);
for (let index = 0; index < years.length; index += 1) {
  for (const key of keys) {
    const value = series[key][index];
    if (key === "co2AnnualChangePpm" && index === 0) continue;
    assert.ok(
      Number.isFinite(value),
      `${key} at ${years[index]} must be finite`,
    );
  }
  assert.ok(
    Math.abs(
      series.emissionsGtC[index] -
        (series.fossilGtC[index] + series.landUseGtC[index]),
    ) < 0.001,
    `emissions identity at ${years[index]}`,
  );
  assert.ok(
    Math.abs(
      series.sinkGtC[index] -
        (series.oceanSinkGtC[index] +
          series.landSinkGtC[index] +
          series.cementSinkGtC[index]),
    ) < 0.002,
    `sink identity at ${years[index]}`,
  );
  assert.ok(
    Math.abs(
      series.imbalanceGtC[index] -
        (series.emissionsGtC[index] -
          (series.atmosphericGrowthGtC[index] + series.sinkGtC[index])),
    ) < 0.01,
    `budget identity at ${years[index]}`,
  );
}

for (let index = 1; index < series.co2Ppm.length; index += 1) {
  assert.ok(
    series.co2Ppm[index] >= series.co2Ppm[index - 1],
    `Mauna Loa annual mean must not decrease at ${years[index]}`,
  );
}

const last = years.length - 1;
assert.equal(series.co2Ppm[last], 424.61);
assert.equal(series.fossilGtC[last], 10.5345);
assert.equal(series.oceanSinkGtC[last], 3.3889);
assert.equal(series.landSinkGtC[last], 1.9422);
assert.ok(series.oceanSinkGtC.every((value) => value > 0));
assert.ok(series.co2Ppm[0] > 300 && series.co2Ppm[last] < 450);
assert.ok(series.landUseGtC.every((value) => value > 0));
assert.ok(
  series.imbalanceGtC.some((value) => value < 0),
  "the budget should include both signs of the residual",
);
assert.ok(meta.normalization.co2Ppm.min < meta.normalization.co2Ppm.max);
assert.ok(meta.normalization.oceanSinkGtC.max > 0);
assert.ok(
  meta.limitations.some((line) => line.includes("Mauna Loa")),
  "the station limitation must be present",
);
assert.ok(
  meta.definitions.stock.includes("does not estimate"),
  "stocks must be explicitly excluded",
);

console.log("Carbon data verified");
console.log(`  years             ${years[0]}–${years.at(-1)} (${years.length})`);
console.log(
  `  CO2               ${series.co2Ppm[0]} … ${series.co2Ppm[last]} ppm`,
);
console.log(
  `  emissions         ${Math.min(...series.emissionsGtC).toFixed(2)} … ${Math.max(...series.emissionsGtC).toFixed(2)} GtC/yr`,
);
console.log(
  `  ocean sink        ${Math.min(...series.oceanSinkGtC).toFixed(2)} … ${Math.max(...series.oceanSinkGtC).toFixed(2)} GtC/yr`,
);
console.log(
  `  land sink         ${Math.min(...series.landSinkGtC).toFixed(2)} … ${Math.max(...series.landSinkGtC).toFixed(2)} GtC/yr`,
);
