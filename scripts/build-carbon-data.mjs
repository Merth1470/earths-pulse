#!/usr/bin/env node
/**
 * Build the carbon-cycle bundle from two public, citable sources:
 *
 *  1. NOAA Global Monitoring Laboratory, Mauna Loa annual mean CO2 (ppm).
 *  2. Global Carbon Budget 2025, global annual carbon budget (GtC/yr),
 *     distributed as CSV by openclimatedata/global-carbon-budget.
 *
 * The output is a small JSON file for the browser. It does not interpolate,
 * smooth, or invent values. The common period is the intersection of both
 * records: 1959–2024.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, "scripts/.cache/carbon");
const OUT = path.join(ROOT, "public/data/carbon-1959-2024.json");

const NOAA_URL =
  "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv";
const GCB_URL =
  "https://raw.githubusercontent.com/openclimatedata/global-carbon-budget/main/data/global-carbon-budget-2025-global-carbon-budget.csv";

const GCB_COLUMNS = {
  fossilGtC: "fossil emissions excluding carbonation",
  landUseGtC: "land-use change emissions",
  atmosphericGrowthGtC: "atmospheric growth",
  oceanSinkGtC: "ocean sink",
  landSinkGtC: "land sink",
  cementSinkGtC: "cement carbonation sink",
  imbalanceGtC: "budget imbalance",
};

function ensureCache() {
  fs.mkdirSync(CACHE, { recursive: true });
}

async function cacheFile(url, filename) {
  const target = path.join(CACHE, filename);
  if (fs.existsSync(target) && fs.statSync(target).size > 100) return target;
  const response = await fetch(url, {
    headers: { "user-agent": "EarthsPulse/1.0 data-build" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}

function dataLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, places = 3) {
  return Number(value.toFixed(places));
}

function stats(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  const sorted = [...clean].sort((a, b) => a - b);
  const percentile = (p) => {
    if (!sorted.length) return null;
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };
  return {
    count: clean.length,
    min: round(sorted[0], 4),
    max: round(sorted[sorted.length - 1], 4),
    mean: round(clean.reduce((sum, value) => sum + value, 0) / clean.length, 4),
    p02: round(percentile(0.02), 4),
    p98: round(percentile(0.98), 4),
  };
}

async function main() {
  ensureCache();
  const noaaPath = await cacheFile(NOAA_URL, "co2_annmean_mlo.csv");
  const gcbPath = await cacheFile(GCB_URL, "global-carbon-budget-2025.csv");

  const noaaText = fs.readFileSync(noaaPath, "utf8");
  const noaaRows = dataLines(noaaText);
  const noaaHeader = parseCsvLine(noaaRows[0]);
  const noaaIndex = Object.fromEntries(noaaHeader.map((name, index) => [name, index]));
  const co2ByYear = new Map();
  for (const line of noaaRows.slice(1)) {
    const row = parseCsvLine(line);
    const year = finite(row[noaaIndex.year]);
    const mean = finite(row[noaaIndex.mean]);
    if (year !== null && mean !== null) co2ByYear.set(year, mean);
  }

  const gcbText = fs.readFileSync(gcbPath, "utf8");
  const gcbRows = dataLines(gcbText);
  const gcbHeader = parseCsvLine(gcbRows[0]);
  const gcbIndex = Object.fromEntries(gcbHeader.map((name, index) => [name, index]));
  const gcbByYear = new Map();
  for (const line of gcbRows.slice(1)) {
    const row = parseCsvLine(line);
    const year = finite(row[gcbIndex.Year]);
    if (year === null) continue;
    const entry = {};
    let complete = true;
    for (const [key, column] of Object.entries(GCB_COLUMNS)) {
      const value = finite(row[gcbIndex[column]]);
      if (value === null) {
        complete = false;
        break;
      }
      entry[key] = value;
    }
    if (complete) gcbByYear.set(year, entry);
  }

  const years = [...gcbByYear.keys()]
    .filter((year) => co2ByYear.has(year))
    .sort((a, b) => a - b);

  if (years.length < 50) {
    throw new Error(`Only ${years.length} common years found; expected a long series.`);
  }

  const series = {
    co2Ppm: [],
    co2AnnualChangePpm: [],
    fossilGtC: [],
    landUseGtC: [],
    emissionsGtC: [],
    atmosphericGrowthGtC: [],
    oceanSinkGtC: [],
    landSinkGtC: [],
    cementSinkGtC: [],
    sinkGtC: [],
    imbalanceGtC: [],
  };

  for (let index = 0; index < years.length; index += 1) {
    const year = years[index];
    const budget = gcbByYear.get(year);
    const co2 = co2ByYear.get(year);
    const emissions = budget.fossilGtC + budget.landUseGtC;
    const sinks =
      budget.oceanSinkGtC + budget.landSinkGtC + budget.cementSinkGtC;
    series.co2Ppm.push(round(co2, 2));
    series.co2AnnualChangePpm.push(
      index === 0 ? null : round(co2 - co2ByYear.get(years[index - 1]), 2),
    );
    series.fossilGtC.push(round(budget.fossilGtC, 4));
    series.landUseGtC.push(round(budget.landUseGtC, 4));
    series.emissionsGtC.push(round(emissions, 4));
    series.atmosphericGrowthGtC.push(round(budget.atmosphericGrowthGtC, 4));
    series.oceanSinkGtC.push(round(budget.oceanSinkGtC, 4));
    series.landSinkGtC.push(round(budget.landSinkGtC, 4));
    series.cementSinkGtC.push(round(budget.cementSinkGtC, 4));
    series.sinkGtC.push(round(sinks, 4));
    series.imbalanceGtC.push(round(budget.imbalanceGtC, 4));
  }

  const statsBySeries = Object.fromEntries(
    Object.entries(series).map(([key, values]) => [key, stats(values)]),
  );

  const last = years.length - 1;
  const normalization = {
    co2Ppm: {
      min: statsBySeries.co2Ppm.p02,
      max: statsBySeries.co2Ppm.p98,
    },
    fossilGtC: {
      min: statsBySeries.fossilGtC.p02,
      max: statsBySeries.fossilGtC.p98,
    },
    landUseGtC: {
      min: statsBySeries.landUseGtC.p02,
      max: statsBySeries.landUseGtC.p98,
    },
    oceanSinkGtC: {
      min: 0,
      max: statsBySeries.oceanSinkGtC.p98,
    },
    landSinkGtC: {
      min: 0,
      max: statsBySeries.landSinkGtC.p98,
    },
    imbalanceGtC: {
      min: -Math.max(
        Math.abs(statsBySeries.imbalanceGtC.p02),
        Math.abs(statsBySeries.imbalanceGtC.p98),
      ),
      max: Math.max(
        Math.abs(statsBySeries.imbalanceGtC.p02),
        Math.abs(statsBySeries.imbalanceGtC.p98),
      ),
    },
  };

  const bundle = {
    meta: {
      title: "The Invisible Breath — global carbon budget",
      period: { start: years[0], end: years[years.length - 1], label: `${years[0]}–${years[years.length - 1]}` },
      temporalResolution: "annual",
      spatialResolution: "global",
      yearCount: years.length,
      units: {
        co2Ppm: "ppm CO₂ (Mauna Loa annual mean)",
        co2AnnualChangePpm: "ppm CO₂ per year",
        fossilGtC: "GtC per year",
        landUseGtC: "GtC per year",
        emissionsGtC: "GtC per year",
        atmosphericGrowthGtC: "GtC per year",
        oceanSinkGtC: "GtC per year",
        landSinkGtC: "GtC per year",
        cementSinkGtC: "GtC per year",
        sinkGtC: "GtC per year",
        imbalanceGtC: "GtC per year",
      },
      sources: [
        {
          id: "noaa-mlo-co2",
          provider: "NOAA Global Monitoring Laboratory",
          product: "Mauna Loa CO₂ annual mean",
          url: NOAA_URL,
          variable: "Atmospheric CO₂ concentration",
          unit: "ppm",
          resolution: "annual mean of monthly in-situ measurements",
          coverage: `${years[0]}–2025 (this bundle uses ${years[0]}–${years[years.length - 1]})`,
          citation:
            "Lan, X., et al. Trends in Atmospheric Carbon Dioxide. NOAA Global Monitoring Laboratory.",
        },
        {
          id: "gcb-2025",
          provider: "Global Carbon Project / Global Carbon Budget 2025",
          product: "Global Carbon Budget 2025 v1.0, global summary",
          url: GCB_URL,
          doi: "https://doi.org/10.18160/gcp-2025",
          variable:
            "Fossil and industrial emissions, land-use change emissions, atmospheric growth, ocean sink, land sink, cement carbonation sink, and budget imbalance",
          unit: "GtC per year (1 GtC = 1 PgC = 3.664 GtCO₂)",
          resolution: "annual, global",
          coverage: "1959–2024",
          citation:
            "Friedlingstein, P., et al. (2025). Global Carbon Budget 2025. Earth System Science Data / Global Carbon Project.",
        },
      ],
      definitions: {
        concentration:
          "Atmospheric CO₂ concentration is the amount of CO₂ in the atmosphere, expressed here as a annual mean mixing ratio in ppm. It is not an emission rate.",
        emission:
          "An emission is a flux of carbon into the atmosphere over a period. Fossil and industrial emissions and land-use change emissions are reported separately.",
        flux:
          "A flux is a transfer between reservoirs over a period. Positive ocean and land sinks mean a transfer from the atmosphere into that reservoir.",
        stock:
          "A stock is the amount stored in a reservoir at a moment. This bundle does not estimate ocean, land, or geological carbon stocks.",
        imbalance:
          "The budget imbalance is emissions minus the sum of atmospheric growth, ocean sink, land sink, and cement carbonation. It measures the imperfection of the budget, not a physical flux.",
      },
      normalization,
      statistics: statsBySeries,
      latest: {
        year: years[last],
        co2Ppm: series.co2Ppm[last],
        co2AnnualChangePpm: series.co2AnnualChangePpm[last],
        fossilGtC: series.fossilGtC[last],
        landUseGtC: series.landUseGtC[last],
        emissionsGtC: series.emissionsGtC[last],
        oceanSinkGtC: series.oceanSinkGtC[last],
        landSinkGtC: series.landSinkGtC[last],
        atmosphericGrowthGtC: series.atmosphericGrowthGtC[last],
        imbalanceGtC: series.imbalanceGtC[last],
      },
      limitations: [
        "Global annual values, not a map and not a national inventory.",
        "The atmospheric concentration is measured at Mauna Loa, Hawaii; it is a benchmark station, not a global spatial mean.",
        "The ocean and land sinks are estimates from model ensembles and data products, not direct flux measurements everywhere.",
        "The budget components have uncertainties of roughly ±0.4 GtC/yr for the ocean sink, ±0.5 GtC/yr for the land sink, ±0.7 GtC/yr for land-use emissions, and ±5% for fossil emissions.",
        "The global ocean sink is positive throughout this series; the source direction is represented in the interface but is not present in this global annual record.",
      ],
      provenanceNote:
        "Built by scripts/build-carbon-data.mjs from the NOAA GML annual mean and the openclimatedata CSV mirror of Global Carbon Budget 2025. No values are interpolated or synthesized.",
    },
    years,
    series,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(bundle)}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
  console.log(`Years ${years[0]}–${years[years.length - 1]}; ${years.length} records`);
  console.log(
    `2024: CO₂ ${series.co2Ppm[last]} ppm; fossil ${series.fossilGtC[last]} GtC/yr; ocean sink ${series.oceanSinkGtC[last]} GtC/yr; land sink ${series.landSinkGtC[last]} GtC/yr.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
