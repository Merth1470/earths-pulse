/**
 * Fetch a small, real, global ocean subset for Earth's Pulse.
 *
 * Sources (public, no authentication, validated 2026-11-14):
 *   - OSCAR surface currents, 1/3°, 5-day composites (Earth & Space Research,
 *     NASA-funded; mirrored by NOAA CoastWatch ERDDAP as `jplOscar`).
 *   - NOAA OISST v2.1 daily sea surface temperature, 0.25° (`ncdcOisst21Agg`).
 *
 * The script selects one composite per month in 2012, resamples onto a shared
 * 1.5° grid, and writes a compact Int16 binary plus a JSON metadata sidecar.
 * Missing values are preserved as a sentinel; nothing is interpolated across
 * land or invented to fill gaps.
 *
 * Run: node scripts/fetch-ocean-data.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ERDDAP = "https://coastwatch.pfeg.noaa.gov/erddap/griddap";
const OUT_DIR = path.resolve("public/data");
const OUT_JSON = path.join(OUT_DIR, "ocean-2012.json");
const OUT_BIN = path.join(OUT_DIR, "ocean-2012.bin");

const GRID = {
  lonStart: -179.25,
  lonStep: 1.5,
  lonCount: 240,
  latStart: 78.75,
  latStep: -1.5,
  latCount: 106,
};

const MONTHS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];
const MONTH_LABELS = [
  "Jan 2012", "Feb 2012", "Mar 2012", "Apr 2012", "May 2012", "Jun 2012",
  "Jul 2012", "Aug 2012", "Sep 2012", "Oct 2012", "Nov 2012", "Dec 2012",
];

const FILL = -32768;
const SST_SCALE = 0.01;
const VELOCITY_SCALE = 0.001;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchCsv(url, attempt = 1) {
  const response = await fetch(url, {
    headers: { "user-agent": "earths-pulse-data-pipeline/1.0" },
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    const body = await response.text();
    if (attempt < 4 && response.status >= 500) {
      console.warn(`  retry ${attempt} after ${response.status}`);
      await sleep(4000 * attempt);
      return fetchCsv(url, attempt + 1);
    }
    throw new Error(`ERDDAP ${response.status}: ${body.slice(0, 300)}`);
  }
  const text = await response.text();
  if (text.startsWith("Error {")) {
    throw new Error(`ERDDAP error: ${text.slice(0, 400)}`);
  }
  return parseCsv(text);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const cells = line.split(",");
    const row = {};
    for (let c = 0; c < header.length; c += 1) {
      const raw = cells[c];
      const value = raw === undefined || raw === "" || raw === "NaN" ? NaN : Number(raw);
      row[header[c]] = Number.isNaN(value) && raw !== "NaN" ? raw : value;
    }
    rows.push(row);
  }
  return { header, rows };
}

function uniqueSorted(values) {
  return [...new Set(values.map((v) => Math.round(v * 1e6) / 1e6))].sort((a, b) => a - b);
}

/**
 * Build an axis-ordered grid from long-format rows.
 * Missing cells stay NaN and are never replaced with neighboring values.
 */
function toGrid(rows, latKey, lonKey, valueKeys) {
  const lats = uniqueSorted(rows.map((r) => r[latKey]));
  const lons = uniqueSorted(rows.map((r) => r[lonKey]));
  const latIndex = new Map(lats.map((v, i) => [Math.round(v * 1e6) / 1e6, i]));
  const lonIndex = new Map(lons.map((v, i) => [Math.round(v * 1e6) / 1e6, i]));
  const nLat = lats.length;
  const nLon = lons.length;
  const data = Object.fromEntries(
    valueKeys.map((key) => [key, new Float32Array(nLat * nLon).fill(NaN)]),
  );
  for (const row of rows) {
    const y = latIndex.get(Math.round(row[latKey] * 1e6) / 1e6);
    const x = lonIndex.get(Math.round(row[lonKey] * 1e6) / 1e6);
    if (y === undefined || x === undefined) continue;
    for (const key of valueKeys) {
      const value = row[key];
      if (Number.isFinite(value)) data[key][y * nLon + x] = value;
    }
  }
  return { lats, lons, nLat, nLon, data };
}

function bilinear(grid, lat, lon, key, lonDomain = "native") {
  const { lats, lons, nLat, nLon, data } = grid;
  let targetLon = lon;
  if (lonDomain === "oscar") {
    targetLon = lon < 20 ? lon + 360 : lon;
  } else {
    targetLon = ((lon % 360) + 360) % 360;
  }

  let y = lowerIndex(lats, lat);
  if (y === null) return null;
  let x = lowerIndexWrapped(lons, targetLon, lonDomain === "oscar" ? 20 : 0);
  if (x === null) return null;

  const y0 = Math.max(0, Math.min(nLat - 1, y));
  const y1 = Math.max(0, Math.min(nLat - 1, y + 1));
  const x0 = ((x % nLon) + nLon) % nLon;
  const x1 = (x0 + 1) % nLon;
  const ty = y1 === y0 ? 0 : (lat - lats[y0]) / (lats[y1] - lats[y0]);
  let tx;
  if (lonDomain === "oscar") {
    const span = lons[x1] > lons[x0] ? lons[x1] - lons[x0] : 360 + lons[x1] - lons[x0];
    tx = span === 0 ? 0 : (((targetLon - lons[x0]) % 360) + 360) % 360 / span;
  } else {
    const span = x1 === 0 ? 360 + lons[0] - lons[nLon - 1] : lons[x1] - lons[x0];
    const delta = targetLon >= lons[x0] ? targetLon - lons[x0] : targetLon + 360 - lons[x0];
    tx = span === 0 ? 0 : delta / span;
  }

  const samples = [
    { v: data[key][y0 * nLon + x0], w: (1 - ty) * (1 - tx) },
    { v: data[key][y0 * nLon + x1], w: (1 - ty) * tx },
    { v: data[key][y1 * nLon + x0], w: ty * (1 - tx) },
    { v: data[key][y1 * nLon + x1], w: ty * tx },
  ].filter((s) => Number.isFinite(s.v) && !(key === "sst" && s.v <= -9));

  if (samples.length === 0) return null;
  const weight = samples.reduce((sum, s) => sum + s.w, 0);
  if (weight <= 0) return null;
  return samples.reduce((sum, s) => sum + s.v * s.w, 0) / weight;
}

function lowerIndex(axis, value) {
  if (axis.length === 0) return null;
  const ascending = axis[axis.length - 1] >= axis[0];
  if (ascending) {
    if (value < axis[0] || value > axis[axis.length - 1]) return null;
    let lo = 0;
    let hi = axis.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (axis[mid] <= value) lo = mid;
      else hi = mid - 1;
    }
    return Math.min(lo, axis.length - 2);
  }
  if (value > axis[0] || value < axis[axis.length - 1]) return null;
  let lo = 0;
  let hi = axis.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (axis[mid] >= value) lo = mid;
    else hi = mid - 1;
  }
  return Math.min(lo, axis.length - 2);
}

function lowerIndexWrapped(axis, value, offset) {
  if (axis.length === 0) return null;
  const first = axis[0];
  const last = axis[axis.length - 1];
  if (value < first || value > last) {
    // Only valid for a 360° wrapping axis.
    const span = last - first;
    if (span < 359) return null;
    value = first + (((value - offset) % 360) + 360) % 360;
  }
  return lowerIndex(axis, value);
}

function nearestTime(times, target) {
  let best = null;
  let bestDelta = Infinity;
  for (const time of times) {
    const delta = Math.abs(Date.parse(time) - Date.parse(target));
    if (delta < bestDelta) {
      best = time;
      bestDelta = delta;
    }
  }
  return { time: best, deltaDays: bestDelta / 86_400_000 };
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[index];
}

function stats(values) {
  const valid = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (valid.length === 0) return { min: null, max: null, p02: null, p98: null, mean: null };
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return {
    min: valid[0],
    max: valid[valid.length - 1],
    p02: percentile(valid, 2),
    p98: percentile(valid, 98),
    mean: sum / valid.length,
    count: valid.length,
  };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log("Reading OSCAR and OISST time axes…");
  const oscarTimes = (await fetchCsv(`${ERDDAP}/jplOscar.csv?time`)).rows
    .map((r) => r.time)
    .filter((t) => typeof t === "string");
  const oisstTimes = (await fetchCsv(`${ERDDAP}/ncdcOisst21Agg.csv?time`)).rows
    .map((r) => r.time)
    .filter((t) => typeof t === "string");

  const frameMeta = [];
  const sstFrames = [];
  const uFrames = [];
  const vFrames = [];
  const allSst = [];
  const allSpeed = [];
  let cells = 0;

  for (let m = 0; m < 12; m += 1) {
    if (m > 0) await sleep(1200);
    const target = `2012-${MONTHS[m]}-15T12:00:00Z`;
    const oscarTime = nearestTime(oscarTimes, target);
    if (!oscarTime.time || oscarTime.deltaDays > 15) {
      throw new Error(`No OSCAR composite near ${target}`);
    }
    const oisstTime = nearestTime(oisstTimes, target);
    if (!oisstTime.time || oisstTime.deltaDays > 1.5) {
      throw new Error(`No OISST day near ${target}`);
    }

    console.log(
      `[${m + 1}/12] OSCAR ${oscarTime.time} · OISST ${oisstTime.time}`,
    );

    const oscarUrl =
      `${ERDDAP}/jplOscar.csv?` +
      `u[(${oscarTime.time})][(15.0)][(-80):4:(80)][(20):4:(420)],` +
      `v[(${oscarTime.time})][(15.0)][(-80):4:(80)][(20):4:(420)]`;
    const oisstUrl =
      `${ERDDAP}/ncdcOisst21Agg.csv?` +
      `sst[(${oisstTime.time})][(0.0)][(-89.875):6:(89.75)][(0.125):6:(359.875)]`;

    const [oscar, oisst] = await Promise.all([
      fetchCsv(oscarUrl),
      fetchCsv(oisstUrl),
    ]);

    const ocean = toGrid(oscar.rows, "latitude", "longitude", ["u", "v"]);
    const temp = toGrid(oisst.rows, "latitude", "longitude", ["sst"]);

    const sst = new Float32Array(GRID.lonCount * GRID.latCount).fill(NaN);
    const u = new Float32Array(GRID.lonCount * GRID.latCount).fill(NaN);
    const v = new Float32Array(GRID.lonCount * GRID.latCount).fill(NaN);

    for (let y = 0; y < GRID.latCount; y += 1) {
      const lat = GRID.latStart + y * GRID.latStep;
      for (let x = 0; x < GRID.lonCount; x += 1) {
        const lon = GRID.lonStart + x * GRID.lonStep;
        const i = y * GRID.lonCount + x;
        const s = bilinear(temp, lat, lon, "sst", "oisst");
        const uu = bilinear(ocean, lat, lon, "u", "oscar");
        const vv = bilinear(ocean, lat, lon, "v", "oscar");
        if (s !== null) {
          sst[i] = s;
          allSst.push(s);
        }
        if (uu !== null && vv !== null) {
          u[i] = uu;
          v[i] = vv;
          allSpeed.push(Math.hypot(uu, vv));
        }
      }
    }

    sstFrames.push(sst);
    uFrames.push(u);
    vFrames.push(v);
    cells += sst.length;

    frameMeta.push({
      index: m,
      month: `2012-${MONTHS[m]}`,
      label: MONTH_LABELS[m],
      oscarTime: oscarTime.time,
      oisstTime: oisstTime.time,
      stats: {
        sst: stats(sst),
        speed: stats(
          Array.from(u, (uu, i) => (Number.isFinite(uu) && Number.isFinite(v[i]) ? Math.hypot(uu, v[i]) : NaN)),
        ),
      },
    });
  }

  const globalSst = stats(allSst);
  const globalSpeed = stats(allSpeed);

  const buffer = new Int16Array(12 * 3 * GRID.lonCount * GRID.latCount);
  const quantizeSst = (value) =>
    Number.isFinite(value) ? Math.max(-32767, Math.min(32767, Math.round(value / SST_SCALE))) : FILL;
  const quantizeVelocity = (value) =>
    Number.isFinite(value) ? Math.max(-32767, Math.min(32767, Math.round(value / VELOCITY_SCALE))) : FILL;

  let offset = 0;
  for (let m = 0; m < 12; m += 1) {
    for (let i = 0; i < sstFrames[m].length; i += 1) buffer[offset++] = quantizeSst(sstFrames[m][i]);
    for (let i = 0; i < uFrames[m].length; i += 1) buffer[offset++] = quantizeVelocity(uFrames[m][i]);
    for (let i = 0; i < vFrames[m].length; i += 1) buffer[offset++] = quantizeVelocity(vFrames[m][i]);
  }

  await fs.writeFile(OUT_BIN, Buffer.from(buffer.buffer));

  const metadata = {
    schemaVersion: 1,
    id: "oscar-oisst-2012",
    title: "Global surface currents and sea surface temperature, 2012",
    subtitle: "One representative composite per month, regridded to 1.5°",
    generatedAt: new Date().toISOString(),
    period: {
      start: "2012-01-01T00:00:00Z",
      end: "2012-12-31T23:59:59Z",
      label: "January — December 2012",
      note: "Historical reanalysis and satellite products. Not live, not current conditions.",
    },
    grid: {
      projection: "equirectangular",
      lonStart: GRID.lonStart,
      lonStep: GRID.lonStep,
      lonCount: GRID.lonCount,
      latStart: GRID.latStart,
      latStep: GRID.latStep,
      latCount: GRID.latCount,
      rowOrder: "north-to-south",
    },
    variables: {
      sst: {
        id: "sea_surface_temperature",
        label: "Sea surface temperature",
        symbol: "SST",
        unit: "degrees-celsius",
        unitLabel: "°C",
        scale: SST_SCALE,
        fill: FILL,
        product: "NOAA OISST v2.1 (0.25° daily)",
      },
      u: {
        id: "eastward_surface_velocity",
        label: "Eastward surface velocity",
        symbol: "u",
        unit: "meters-per-second",
        unitLabel: "m/s",
        scale: VELOCITY_SCALE,
        fill: FILL,
        product: "OSCAR surface currents (1/3°, 5-day composite)",
      },
      v: {
        id: "northward_surface_velocity",
        label: "Northward surface velocity",
        symbol: "v",
        unit: "meters-per-second",
        unitLabel: "m/s",
        scale: VELOCITY_SCALE,
        fill: FILL,
        product: "OSCAR surface currents (1/3°, 5-day composite)",
      },
    },
    normalization: {
      sst: {
        min: globalSst.p02,
        max: globalSst.p98,
        method: "2nd–98th percentile of all 2012 grid cells",
      },
      speed: {
        min: 0,
        max: globalSpeed.p98,
        method: "98th percentile of current speed in all 2012 grid cells",
      },
    },
    stats: {
      sst: globalSst,
      speed: globalSpeed,
      cellsPerFrame: GRID.lonCount * GRID.latCount,
      cellsTotal: cells,
    },
    frames: frameMeta,
    binary: {
      path: "/data/ocean-2012.bin",
      bytes: buffer.byteLength,
      dtype: "int16-le",
      layout:
        "frame-major, then variable-major (sst, u, v), then north-to-south row-major",
      fill: FILL,
    },
    sources: [
      {
        id: "oscar",
        name: "OSCAR Sea Surface Velocity, 1/3°, L4, Global, 5 Day Composite",
        provider: "Earth & Space Research (NASA-funded)",
        institution: "Earth & Space Research",
        access: "NOAA CoastWatch ERDDAP · jplOscar",
        url: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar",
        citation:
          "Bonjean, F. and G.S.E. Lagerloef (2002). Diagnostic model and analysis of the surface currents in the tropical Pacific Ocean. Journal of Physical Oceanography, 32, 2938–2954.",
        variables: ["u", "v"],
        depth: "15 m",
        resolution: "1/3° · 5-day composite",
        license:
          "Publicly redistributed by NOAA CoastWatch ERDDAP; ESR and NOAA provide no warranty of accuracy for legal use.",
      },
      {
        id: "oisst",
        name: "NOAA Optimum Interpolation Sea Surface Temperature (OISST) v2.1",
        provider: "NOAA National Centers for Environmental Information",
        access: "NOAA CoastWatch ERDDAP · ncdcOisst21Agg",
        url: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg",
        citation:
          "Huang, B., et al. (2021). Improvements of the Daily Optimum Interpolation Sea Surface Temperature (DOISST) Version 2.1. Journal of Climate, 34, 2923–2939.",
        variables: ["sst"],
        depth: "0 m",
        resolution: "0.25° · daily",
        license: "U.S. Government work; public domain.",
      },
    ],
    processing: [
      "Nearest 5-day OSCAR composite and nearest daily OISST field to the 15th of each month.",
      "Bilinear resampling onto a shared 1.5° equirectangular grid.",
      "Coastal cells where any source corner is missing are left missing; no fill or smoothing across land.",
      "Quantized to Int16 with documented scales; missing is -32768.",
    ],
    limitations: [
      "OSCAR is a satellite-derived surface current analysis, not a direct measurement at every point; it combines geostrophic, Ekman, and buoyancy components.",
      "OISST v2.1 blends satellite and in-situ observations; it is a gridded product, not a single instrument reading.",
      "One composite per month is a sample of 2012, not a continuous time series.",
      "The NASA SVS record 3912 render is a separate ECCO2 visualization from 2007–2008 and is not the numerical source for this dataset.",
    ],
  };

  await fs.writeFile(OUT_JSON, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log("\nWrote:");
  console.log(`  ${OUT_BIN} — ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  ${OUT_JSON}`);
  console.log(
    `SST ${globalSst.min?.toFixed(2)}…${globalSst.max?.toFixed(2)} °C · p2/p98 ${globalSst.p02?.toFixed(2)}/${globalSst.p98?.toFixed(2)}`,
  );
  console.log(
    `Speed max ${globalSpeed.max?.toFixed(3)} m/s · p98 ${globalSpeed.p98?.toFixed(3)} m/s`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
