#!/usr/bin/env node
/**
 * Build the air-quality bundle from the US EPA AirData pre-generated hourly
 * files for 2023. Eight cities are represented by one co-located ground
 * monitor that reports PM2.5, NO2, and ozone at the same site. This keeps the
 * three pollutant layers comparable without pretending they are city-wide.
 *
 * Inputs are cached in scripts/.cache/air. The output preserves the actual
 * hourly resolution; missing hours remain null. No values are interpolated.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, "scripts/.cache/air");
const OUT = path.join(ROOT, "public/data/air-quality-2023.json");
const YEAR = 2023;
const HOURS = 8760; // 2023 is not a leap year.
const START = Date.UTC(YEAR, 0, 1, 0, 0, 0);

const POLLUTANTS = {
  pm25: {
    code: "88101",
    name: "PM2.5",
    label: "Fine particulate matter",
    unit: "µg/m³",
    sourceUnit: "Micrograms/cubic meter (LC)",
    decimals: 1,
    file: `hourly_88101_${YEAR}.zip`,
    description:
      "Mass concentration of particles with an aerodynamic diameter of 2.5 µm or less, measured at a ground monitor.",
    limits:
      "A point monitor is not a city-wide average. PM2.5 composition and size distribution are not measured here.",
  },
  no2: {
    code: "42602",
    name: "NO₂",
    label: "Nitrogen dioxide",
    unit: "ppb",
    sourceUnit: "Parts per billion",
    decimals: 1,
    file: `hourly_42602_${YEAR}.zip`,
    description:
      "Mixing ratio of nitrogen dioxide at a ground monitor, reported in parts per billion.",
    limits:
      "A point monitor is not a city-wide average. NO₂ is a precursor to ozone and other secondary pollutants; this value is not a health diagnosis.",
  },
  ozone: {
    code: "44201",
    name: "O₃",
    label: "Ground-level ozone",
    unit: "ppm",
    sourceUnit: "Parts per million",
    decimals: 3,
    file: `hourly_44201_${YEAR}.zip`,
    description:
      "Mixing ratio of ozone at a ground monitor, reported in parts per million. This is ground-level ozone, not the stratospheric ozone layer.",
    limits:
      "Ozone monitoring often runs seasonally, so winter gaps can be normal. A point monitor is not a city-wide average.",
  },
};

const CITIES = [
  {
    id: "los-angeles",
    city: "Los Angeles",
    state: "CA",
    stateCode: "06",
    county: "037",
    site: "1103",
    name: "Los Angeles-North Main Street",
    lat: 34.06659,
    lon: -118.22688,
    pocs: { pm25: "3", no2: "1", ozone: "1" },
  },
  {
    id: "seattle",
    city: "Seattle",
    state: "WA",
    stateCode: "53",
    county: "033",
    site: "0080",
    name: "Seattle - Beacon Hill",
    lat: 47.568236,
    lon: -122.308628,
    pocs: { pm25: "5", no2: "1", ozone: "1" },
  },
  {
    id: "denver",
    city: "Denver",
    state: "CO",
    stateCode: "08",
    county: "031",
    site: "0026",
    name: "La Casa",
    lat: 39.77949,
    lon: -105.00518,
    pocs: { pm25: "3", no2: "1", ozone: "1" },
  },
  {
    id: "houston",
    city: "Houston",
    state: "TX",
    stateCode: "48",
    county: "201",
    site: "1034",
    name: "Houston East",
    lat: 29.768033,
    lon: -95.220574,
    pocs: { pm25: "1", no2: "1", ozone: "2" },
  },
  {
    id: "minneapolis",
    city: "Minneapolis",
    state: "MN",
    stateCode: "27",
    county: "053",
    site: "0962",
    name: "Near Road I-35/I-94",
    lat: 44.965242,
    lon: -93.254759,
    pocs: { pm25: "3", no2: "1", ozone: "1" },
  },
  {
    id: "new-york",
    city: "New York",
    state: "NY",
    stateCode: "36",
    county: "081",
    site: "0124",
    name: "Queens College 2",
    lat: 40.73614,
    lon: -73.82153,
    pocs: { pm25: "4", no2: "1", ozone: "1" },
  },
  {
    id: "phoenix",
    city: "Phoenix",
    state: "AZ",
    stateCode: "04",
    county: "013",
    site: "0019",
    name: "West Phoenix",
    lat: 33.48378,
    lon: -112.14256,
    pocs: { pm25: "3", no2: "1", ozone: "1" },
  },
  {
    id: "philadelphia",
    city: "Philadelphia",
    state: "PA",
    stateCode: "42",
    county: "101",
    site: "0048",
    name: "North East Waste (NEW)",
    lat: 39.991389,
    lon: -75.080833,
    pocs: { pm25: "4", no2: "1", ozone: "1" },
  },
];

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

function round(value, places) {
  return Number(value.toFixed(places));
}

function stats(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) {
    return { count: 0, min: null, max: null, mean: null, p02: null, p98: null };
  }
  const sorted = [...clean].sort((a, b) => a - b);
  const percentile = (p) => {
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

function readZipLines(zipPath, onLine) {
  return new Promise((resolve, reject) => {
    const child = spawn("unzip", ["-p", zipPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const lines = readline.createInterface({ input: child.stdout });
    lines.on("line", onLine);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`unzip exited with ${code} for ${zipPath}`));
    });
  });
}

async function main() {
  const series = Object.fromEntries(
    CITIES.map((city) => [
      city.id,
      {
        pm25: new Array(HOURS).fill(null),
        no2: new Array(HOURS).fill(null),
        ozone: new Array(HOURS).fill(null),
      },
    ]),
  );
  const monitorKey = (state, county, site, poc) =>
    `${state}|${county}|${site}|${poc}`;

  const methods = {};
  for (const [pollutant, definition] of Object.entries(POLLUTANTS)) {
    const zipPath = path.join(CACHE, definition.file);
    if (!fs.existsSync(zipPath)) {
      throw new Error(
        `Missing ${zipPath}. Download ${definition.file} from https://aqs.epa.gov/aqsweb/airdata/download_files.html`,
      );
    }

    const wanted = new Map();
    for (const city of CITIES) {
      wanted.set(
        monitorKey(city.stateCode, city.county, city.site, city.pocs[pollutant]),
        city.id,
      );
    }

    let header = null;
    let index = null;
    let records = 0;
    let accepted = 0;
    let rejectedUnit = 0;
    const acceptedByCity = {};

    await readZipLines(zipPath, (line) => {
      if (!header) {
        header = parseCsvLine(line).map((name) => name.replace(/^"|"$/g, ""));
        index = Object.fromEntries(header.map((name, position) => [name, position]));
        return;
      }
      if (!line) return;
      records += 1;
      const row = parseCsvLine(line);
      const key = monitorKey(
        row[index["State Code"]],
        row[index["County Code"]],
        row[index["Site Num"]],
        row[index["POC"]],
      );
      const cityId = wanted.get(key);
      if (!cityId) return;
      if (row[index["Parameter Code"]] !== definition.code) return;
      const unit = row[index["Units of Measure"]];
      if (unit !== definition.sourceUnit) {
        rejectedUnit += 1;
        return;
      }
      const date = row[index["Date GMT"]];
      const time = row[index["Time GMT"]];
      if (!date || !time) return;
      const parsed = Date.parse(`${date}T${time}:00Z`);
      if (!Number.isFinite(parsed)) return;
      const hour = Math.round((parsed - START) / 3_600_000);
      if (hour < 0 || hour >= HOURS) return;
      const value = finite(row[index["Sample Measurement"]]);
      if (value === null) return;
      series[cityId][pollutant][hour] = round(
        value,
        definition.decimals,
      );
      methods[cityId] ??= {};
      methods[cityId][pollutant] = row[index["Method Name"]] || "";
      acceptedByCity[cityId] = (acceptedByCity[cityId] ?? 0) + 1;
      accepted += 1;
    });

    if (!header) throw new Error(`No header in ${definition.file}`);
    console.log(
      `${definition.name}: ${records.toLocaleString()} rows scanned, ${accepted.toLocaleString()} selected, ${rejectedUnit} rejected units`,
    );
    if (accepted < 1000) {
      throw new Error(`Too few ${definition.name} observations for a usable layer.`);
    }
  }

  const pollutantStats = {};
  for (const [pollutant, definition] of Object.entries(POLLUTANTS)) {
    const values = CITIES.flatMap((city) => series[city.id][pollutant]);
    pollutantStats[pollutant] = {
      ...stats(values),
      validHours: values.filter((value) => value !== null).length,
      totalHours: HOURS * CITIES.length,
    };
    if (pollutantStats[pollutant].validHours < 10000) {
      throw new Error(
        `${definition.name}: only ${pollutantStats[pollutant].validHours} valid city-hours; expected more.`,
      );
    }
  }

  const normalization = Object.fromEntries(
    Object.entries(POLLUTANTS).map(([pollutant, definition]) => [
      pollutant,
      {
        min: pollutantStats[pollutant].p02,
        max: Math.max(
          pollutantStats[pollutant].p02 + 0.001,
          pollutantStats[pollutant].p98,
        ),
        unit: definition.unit,
      },
    ]),
  );

  const outCities = CITIES.map((city) => {
    const citySeries = series[city.id];
    const completeness = Object.fromEntries(
      Object.entries(POLLUTANTS).map(([pollutant]) => {
        const valid = citySeries[pollutant].filter((value) => value !== null).length;
        return [pollutant, round(valid / HOURS, 4)];
      }),
    );
    return {
      id: city.id,
      name: city.city,
      state: city.state,
      lat: city.lat,
      lon: city.lon,
      monitor: {
        name: city.name,
        siteId: `${city.stateCode}/${city.county}/${city.site}`,
        lat: city.lat,
        lon: city.lon,
        measurementType: "ground-level monitoring station",
        coLocated: true,
      },
      pocs: city.pocs,
      methods: methods[city.id] ?? {},
      completeness,
      series: citySeries,
    };
  });

  const bundle = {
    meta: {
      title: "The Sound of a City — US ground-monitor air quality",
      period: {
        start: "2023-01-01T00:00:00Z",
        end: "2023-12-31T23:00:00Z",
        label: "2023",
      },
      temporalResolution: "hourly",
      timeBasis: "UTC",
      hourCount: HOURS,
      cityCount: CITIES.length,
      measurementType:
        "Ground-level monitoring-station measurements. These are not satellite columns and not city-wide averages.",
      selection:
        "One co-located monitor per city reports all three pollutants. The monitor is identified by state/county/site and POC in the data record.",
      units: {
        pm25: "µg/m³",
        no2: "ppb",
        ozone: "ppm",
      },
      pollutants: Object.fromEntries(
        Object.entries(POLLUTANTS).map(([pollutant, definition]) => [
          pollutant,
          {
            code: definition.code,
            name: definition.name,
            label: definition.label,
            unit: definition.unit,
            description: definition.description,
            limits: definition.limits,
            temporalResolution: "hourly",
            measurementType: "ground-level monitor",
          },
        ]),
      ),
      source: {
        provider: "U.S. Environmental Protection Agency",
        product: "AirData pre-generated hourly files",
        url: "https://aqs.epa.gov/aqsweb/airdata/download_files.html",
        documentation:
          "https://aqs.epa.gov/aqsweb/airdata/FileFormats.html",
        coverage: "United States, 2023",
        license:
          "U.S. federal government data; attribution to the U.S. EPA Air Quality System is requested.",
      },
      normalization,
      statistics: pollutantStats,
      limitations: [
        "Eight US cities only; this is not global coverage.",
        "A single point monitor is not a city-wide average and is not street-level precision for the whole city.",
        "These are ground-level measurements, not satellite-derived atmospheric columns.",
        "The stations are co-located for comparability, but local siting and measurement methods still differ.",
        "Ozone is often measured seasonally; missing winter hours are not zero.",
        "2023 is historical data, not live air quality and not a forecast.",
        "The data do not establish health effects, pollution sources, or compliance with any air-quality standard.",
      ],
      provenanceNote:
        "Built by scripts/build-air-quality-data.mjs from EPA AirData hourly files. Each city uses one co-located site with PM2.5, NO2, and ozone. No value is interpolated.",
    },
    cities: outCities,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(bundle)}\n`);
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB)`,
  );
  for (const [pollutant, value] of Object.entries(pollutantStats)) {
    console.log(
      `${POLLUTANTS[pollutant].name}: ${value.validHours.toLocaleString()} valid city-hours; ${value.min}–${value.max} ${POLLUTANTS[pollutant].unit}; p98 ${value.p98}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
