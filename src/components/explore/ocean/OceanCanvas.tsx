"use client";

import { useEffect, useRef } from "react";

import {
  formatLongitude,
  normalizeLon,
} from "@/lib/ocean/dataset";
import type {
  OceanDataset,
  TransectDefinition,
  TransectSample,
} from "@/lib/ocean/types";

interface OceanCanvasProps {
  dataset: OceanDataset;
  monthIndex: number;
  transect: TransectDefinition;
  progress: number;
  currentSample: TransectSample | null;
  reducedMotion: boolean;
  playing: boolean;
}

const DATA_LAT_EDGE = 79.5;
const VISUAL_SST_MIN = -2;
const VISUAL_SST_MAX = 32;
const VISUAL_SPEED_SCALE = 19;
const PARTICLE_LIFETIME = 5.5;

const SST_STOPS: Array<[number, [number, number, number]]> = [
  [-2, [7, 24, 48]],
  [4, [15, 66, 108]],
  [10, [22, 124, 148]],
  [16, [74, 180, 178]],
  [21, [162, 214, 184]],
  [25, [225, 220, 148]],
  [29, [240, 164, 88]],
  [32, [209, 80, 60]],
];

function sstColor(value: number): [number, number, number] {
  const clamped = Math.max(VISUAL_SST_MIN, Math.min(VISUAL_SST_MAX, value));
  for (let i = 1; i < SST_STOPS.length; i += 1) {
    const [stopValue, stopColor] = SST_STOPS[i];
    if (clamped <= stopValue) {
      const [prevValue, prevColor] = SST_STOPS[i - 1];
      const t = (clamped - prevValue) / (stopValue - prevValue);
      return [
        Math.round(prevColor[0] + (stopColor[0] - prevColor[0]) * t),
        Math.round(prevColor[1] + (stopColor[1] - prevColor[1]) * t),
        Math.round(prevColor[2] + (stopColor[2] - prevColor[2]) * t),
      ];
    }
  }
  return SST_STOPS[SST_STOPS.length - 1][1];
}

function project(
  lon: number,
  lat: number,
  width: number,
  height: number,
): [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

type LandRing = Array<[number, number]>;

function ringsFromGeoJson(data: unknown): LandRing[] {
  const rings: LandRing[] = [];
  const features = (data as { features?: Array<{ geometry?: { type?: string; coordinates?: unknown } }> })
    ?.features;
  if (!features) return rings;

  for (const feature of features) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === "Polygon") {
      const coords = geometry.coordinates as Array<Array<[number, number]>>;
      for (const ring of coords) rings.push(ring);
    } else if (geometry.type === "MultiPolygon") {
      const coords = geometry.coordinates as Array<Array<Array<[number, number]>>>;
      for (const polygon of coords) {
        for (const ring of polygon) rings.push(ring);
      }
    }
  }
  return rings;
}

interface Particle {
  lon: number;
  lat: number;
  age: number;
  life: number;
}

export function OceanCanvas({
  dataset,
  monthIndex,
  transect,
  progress,
  currentSample,
  reducedMotion,
  playing,
}: OceanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({
    dataset,
    monthIndex,
    transect,
    progress,
    currentSample,
    reducedMotion,
    playing,
  });
  useEffect(() => {
    propsRef.current = {
      dataset,
      monthIndex,
      transect,
      progress,
      currentSample,
      reducedMotion,
      playing,
    };
  }, [dataset, monthIndex, transect, progress, currentSample, reducedMotion, playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const raster = document.createElement("canvas");
    const trail = document.createElement("canvas");
    const landLayer = document.createElement("canvas");
    const rasterContext = raster.getContext("2d");
    const trailContext = trail.getContext("2d");
    const landContext = landLayer.getContext("2d");
    if (!rasterContext || !trailContext || !landContext) return;

    const canvasEl = canvas as HTMLCanvasElement;
    const context2d = context as CanvasRenderingContext2D;
    const raster2d = rasterContext as CanvasRenderingContext2D;
    const trail2d = trailContext as CanvasRenderingContext2D;
    const land2d = landContext as CanvasRenderingContext2D;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rasterFrame = -1;
    let landRings: LandRing[] = [];
    let particles: Particle[] = [];
    let spawnCells: number[] = [];
    let staticKey = "";
    let lastTime = performance.now();
    let raf = 0;
    let disposed = false;

    const grid = dataset.meta.grid;
    const cells = grid.lonCount * grid.latCount;
    const scale = dataset.meta.variables.sst.scale;
    const fill = dataset.meta.binary.fill;

    function resize() {
      const rect = canvasEl.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      trail.width = canvasEl.width;
      trail.height = canvasEl.height;
      landLayer.width = canvasEl.width;
      landLayer.height = canvasEl.height;
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      context2d.imageSmoothingEnabled = true;
      trail2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      land2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      rasterFrame = -1;
      trail2d.clearRect(0, 0, width, height);
      drawLand();
      buildSpawnCells(propsRef.current.monthIndex);
      seedParticles();
      staticKey = "";
    }

    function drawLand() {
      land2d.clearRect(0, 0, width, height);
      if (landRings.length === 0) return;
      land2d.fillStyle = "#0a121d";
      land2d.strokeStyle = "rgba(155, 200, 216, 0.24)";
      land2d.lineWidth = 0.7;
      for (const ring of landRings) {
        if (ring.length < 2) continue;
        land2d.beginPath();
        for (let i = 0; i < ring.length; i += 1) {
          const [lon, lat] = ring[i];
          const [x, y] = project(lon, lat, width, height);
          if (i === 0) land2d.moveTo(x, y);
          else land2d.lineTo(x, y);
        }
        land2d.closePath();
        land2d.fill();
        land2d.stroke();
      }
    }

    async function loadLand() {
      try {
        const response = await fetch("/data/ne_110m_land.geojson");
        if (!response.ok) return;
        landRings = ringsFromGeoJson(await response.json());
        if (!disposed) drawLand();
      } catch {
        // Coastal outlines are optional; the missing-data mask still shows land.
      }
    }

    function buildSpawnCells(month: number) {
      spawnCells = [];
      const offset = Math.max(0, month) * cells * 3;
      for (let i = 0; i < cells; i += 1) {
        const sst = dataset.values[offset + i];
        const u = dataset.values[offset + cells + i];
        const v = dataset.values[offset + cells * 2 + i];
        if (
          sst !== fill &&
          u !== fill &&
          v !== fill &&
          Number.isFinite(sst) &&
          Number.isFinite(u) &&
          Number.isFinite(v)
        ) {
          spawnCells.push(i);
        }
      }
    }

    function seedParticles() {
      const count = Math.round(
        Math.max(520, Math.min(2100, (width * height) / 1250)),
      );
      particles = Array.from({ length: count }, () => spawnParticle(true));
      trail2d.clearRect(0, 0, width, height);
    }

    function spawnParticle(anywhere = false): Particle {
      const cell =
        spawnCells.length > 0
          ? spawnCells[Math.floor(Math.random() * spawnCells.length)]
          : Math.floor(Math.random() * cells);
      const x = cell % grid.lonCount;
      const y = Math.floor(cell / grid.lonCount);
      const lon =
        normalizeLon(grid.lonStart + x * grid.lonStep + (Math.random() - 0.5) * 1.2);
      const lat = grid.latStart + y * grid.latStep + (Math.random() - 0.5) * 1.2;
      return {
        lon,
        lat,
        age: anywhere ? Math.random() * PARTICLE_LIFETIME : 0,
        life: 2.2 + Math.random() * PARTICLE_LIFETIME,
      };
    }

    function ensureRaster(month: number) {
      if (month === rasterFrame) return;
      rasterFrame = month;
      buildSpawnCells(month);
      raster.width = grid.lonCount;
      raster.height = grid.latCount;
      const image = raster2d.createImageData(grid.lonCount, grid.latCount);
      const offset = month * cells * 3;
      for (let i = 0; i < cells; i += 1) {
        const raw = dataset.values[offset + i];
        const index = i * 4;
        if (raw === fill || !Number.isFinite(raw)) {
          image.data[index + 3] = 0;
          continue;
        }
        const [r, g, b] = sstColor(raw * scale);
        image.data[index] = r;
        image.data[index + 1] = g;
        image.data[index + 2] = b;
        image.data[index + 3] = 255;
      }
      raster2d.putImageData(image, 0, 0);
    }

    function drawRaster(month: number) {
      ensureRaster(month);
      const top = ((90 - DATA_LAT_EDGE) / 180) * height;
      const bottom = ((90 + DATA_LAT_EDGE) / 180) * height;
      context2d.drawImage(raster, 0, top, width, bottom - top);
      context2d.fillStyle = "rgba(5, 10, 18, 0.15)";
      context2d.fillRect(0, top, width, bottom - top);
    }

    function drawGraticule() {
      context2d.save();
      context2d.strokeStyle = "rgba(155, 200, 216, 0.10)";
      context2d.lineWidth = 0.5;
      context2d.setLineDash([2, 4]);
      for (let lon = -150; lon < 180; lon += 30) {
        const [x] = project(lon, 0, width, height);
        context2d.beginPath();
        context2d.moveTo(x, 0);
        context2d.lineTo(x, height);
        context2d.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const [, y] = project(0, lat, width, height);
        context2d.beginPath();
        context2d.moveTo(0, y);
        context2d.lineTo(width, y);
        context2d.stroke();
      }
      context2d.setLineDash([]);
      context2d.strokeStyle = "rgba(155, 200, 216, 0.2)";
      const [, equator] = project(0, 0, width, height);
      context2d.beginPath();
      context2d.moveTo(0, equator);
      context2d.lineTo(width, equator);
      context2d.stroke();

      context2d.fillStyle = "rgba(155, 200, 216, 0.5)";
      context2d.font = '8px "IBM Plex Mono", ui-monospace, monospace';
      context2d.textAlign = "center";
      for (let lon = -180; lon <= 180; lon += 60) {
        const [x] = project(lon, 0, width, height);
        const label = lon === 0 ? "0°" : `${Math.abs(lon)}°${lon > 0 ? "E" : "W"}`;
        context2d.fillText(label, Math.min(width - 16, Math.max(16, x)), height - 6);
      }
      context2d.textAlign = "left";
      for (const lat of [-60, -30, 30, 60]) {
        const [, y] = project(0, lat, width, height);
        context2d.fillText(`${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`, 6, y - 3);
      }
      context2d.restore();
    }

    function drawRegion() {
      const { lonStart, lonEnd, lat } = propsRef.current.transect;
      const ranges: Array<[number, number]> =
        lonEnd >= lonStart
          ? [[normalizeLon(lonStart), normalizeLon(lonEnd)]]
          : [[normalizeLon(lonStart), 180], [-180, normalizeLon(lonEnd)]];

      context2d.save();
      context2d.strokeStyle = "rgba(66, 199, 217, 0.65)";
      context2d.fillStyle = "rgba(66, 199, 217, 0.055)";
      context2d.lineWidth = 0.8;
      context2d.setLineDash([4, 4]);
      for (const [start, end] of ranges) {
        if (end <= start) continue;
        const [x0, yTop] = project(start, lat + 2.4, width, height);
        const [x1, yBottom] = project(end, lat - 2.4, width, height);
        context2d.fillRect(x0, yTop, x1 - x0, yBottom - yTop);
        context2d.strokeRect(x0, yTop, x1 - x0, yBottom - yTop);
      }
      context2d.setLineDash([]);

      const [, ny] = project(0, lat + 2.4, width, height);
      context2d.fillStyle = "rgba(232, 238, 245, 0.8)";
      context2d.font = '8px "IBM Plex Mono", ui-monospace, monospace';
      context2d.textAlign = "left";
      const labelX = 8;
      context2d.fillText(
        `${formatLongitude(lonStart)} → ${formatLongitude(lonEnd)}  /  lat ${lat.toFixed(1)}°`,
        labelX,
        Math.max(14, ny - 6),
      );
      context2d.restore();
    }

    function drawPlayhead() {
      const { transect: active, progress: p, currentSample: sample } = propsRef.current;
      const displayLon = active.lonStart + (active.lonEnd - active.lonStart) * p;
      const lon = normalizeLon(displayLon);
      const [x] = project(lon, 0, width, height);
      const [, y] = project(0, active.lat, width, height);

      context2d.save();
      context2d.strokeStyle = "rgba(66, 199, 217, 0.32)";
      context2d.lineWidth = 1;
      context2d.beginPath();
      context2d.moveTo(x, 0);
      context2d.lineTo(x, height);
      context2d.stroke();

      context2d.beginPath();
      context2d.arc(x, y, 4.2, 0, Math.PI * 2);
      context2d.fillStyle = sample ? "#42c7d9" : "#080d16";
      context2d.fill();
      context2d.strokeStyle = "#e8eef5";
      context2d.lineWidth = 1.2;
      context2d.stroke();
      context2d.restore();
    }

    function stepParticles(dt: number) {
      trail2d.save();
      trail2d.globalCompositeOperation = "destination-out";
      trail2d.fillStyle = "rgba(0, 0, 0, 0.075)";
      trail2d.fillRect(0, 0, width, height);
      trail2d.restore();

      const month = propsRef.current.monthIndex;
      const index = month * cells * 3;
      trail2d.save();
      trail2d.globalCompositeOperation = "lighter";
      trail2d.lineCap = "round";

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        const x = Math.floor((particle.lon - grid.lonStart) / grid.lonStep);
        const y = Math.floor((particle.lat - grid.latStart) / grid.latStep);
        const wrappedX = ((x % grid.lonCount) + grid.lonCount) % grid.lonCount;
        if (y < 0 || y >= grid.latCount) {
          particles[i] = spawnParticle();
          continue;
        }
        const cell = y * grid.lonCount + wrappedX;
        const u = dataset.values[index + cells + cell] * dataset.meta.variables.u.scale;
        const v = dataset.values[index + cells * 2 + cell] * dataset.meta.variables.v.scale;
        const rawSst = dataset.values[index + cell];

        if (
          dataset.values[index + cells + cell] === fill ||
          dataset.values[index + cells * 2 + cell] === fill ||
          rawSst === fill ||
          !Number.isFinite(u) ||
          !Number.isFinite(v)
        ) {
          particles[i] = spawnParticle();
          continue;
        }

        const speed = Math.hypot(u, v);
        const oldX = ((particle.lon + 180) / 360) * width;
        const oldY = ((90 - particle.lat) / 180) * height;

        const cosLat = Math.max(0.28, Math.cos((particle.lat * Math.PI) / 180));
        particle.lon += (u * VISUAL_SPEED_SCALE * dt) / cosLat;
        particle.lat += v * VISUAL_SPEED_SCALE * dt;
        particle.lat = Math.max(-78, Math.min(78, particle.lat));
        particle.age += dt;

        if (particle.lon > 180) particle.lon -= 360;
        if (particle.lon < -180) particle.lon += 360;

        const newX = ((particle.lon + 180) / 360) * width;
        const newY = ((90 - particle.lat) / 180) * height;
        const fade = Math.max(
          0,
          Math.min(1, particle.age / 0.4, (particle.life - particle.age) / 0.8),
        );
        const alpha = Math.min(0.62, 0.12 + speed * 0.85) * fade;

        trail2d.strokeStyle = `rgba(196, 240, 255, ${alpha.toFixed(3)})`;
        trail2d.lineWidth = 0.55 + Math.min(0.7, speed * 0.9);
        trail2d.beginPath();
        trail2d.moveTo(oldX, oldY);
        trail2d.lineTo(newX, newY);
        trail2d.stroke();

        if (particle.age > particle.life || speed < 0.004) {
          particles[i] = spawnParticle();
        }
      }
      trail2d.restore();
    }

    function drawStaticVectors() {
      const month = propsRef.current.monthIndex;
      const index = month * cells * 3;
      context2d.save();
      context2d.strokeStyle = "rgba(196, 240, 255, 0.38)";
      context2d.lineWidth = 0.8;
      const step = 3;
      for (let y = 0; y < grid.latCount; y += step) {
        for (let x = 0; x < grid.lonCount; x += step) {
          const cell = y * grid.lonCount + x;
          const u = dataset.values[index + cells + cell] * dataset.meta.variables.u.scale;
          const v = dataset.values[index + cells * 2 + cell] * dataset.meta.variables.v.scale;
          if (
            dataset.values[index + cells + cell] === fill ||
            dataset.values[index + cells * 2 + cell] === fill ||
            !Number.isFinite(u) ||
            !Number.isFinite(v)
          ) {
            continue;
          }
          const speed = Math.hypot(u, v);
          if (speed < 0.03) continue;
          const lon = normalizeLon(grid.lonStart + x * grid.lonStep);
          const lat = grid.latStart + y * grid.latStep;
          const [cx, cy] = project(lon, lat, width, height);
          const length = Math.min(9, 2 + speed * 14);
          const angle = Math.atan2(u, v);
          const dx = Math.sin(angle) * length;
          const dy = -Math.cos(angle) * length;
          context2d.beginPath();
          context2d.moveTo(cx - dx / 2, cy - dy / 2);
          context2d.lineTo(cx + dx / 2, cy + dy / 2);
          context2d.stroke();
        }
      }
      context2d.restore();
    }

    function draw(now: number) {
      const props = propsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (props.reducedMotion) {
        const key = `${props.monthIndex}|${props.transect.id}|${props.progress.toFixed(3)}|${width}x${height}`;
        if (key === staticKey) return;
        staticKey = key;
      }

      context2d.clearRect(0, 0, width, height);
      context2d.fillStyle = "#05080e";
      context2d.fillRect(0, 0, width, height);

      drawRaster(props.monthIndex);

      if (!props.reducedMotion) {
        stepParticles(dt);
        context2d.save();
        context2d.globalCompositeOperation = "lighter";
        context2d.drawImage(trail, 0, 0, width, height);
        context2d.restore();
      } else {
        drawStaticVectors();
      }

      context2d.drawImage(landLayer, 0, 0, width, height);
      drawGraticule();
      drawRegion();
      drawPlayhead();
    }

    function loop(now: number) {
      if (disposed) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      staticKey = "";
    });
    resizeObserver.observe(canvasEl);

    resize();
    void loadLand();
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [dataset]);

  const frame = dataset.meta.frames[monthIndex];
  const summary = currentSample
    ? currentSample.sst === null
      ? "no temperature value at the playhead"
      : `${currentSample.sst.toFixed(1)} degrees Celsius at the playhead`
    : "the playhead is between samples";

  return (
    <figure className="ocean-plate">
      <div className="ocean-plate-bar">
        <span className="ocean-plate-index">Field / Global</span>
        <span className="ocean-plate-kind">
          <span
            aria-hidden="true"
            className="status-dot status-dot--available"
          />
          Computed from OSCAR + OISST
        </span>
        <span className="ocean-plate-dims">
          {dataset.meta.grid.lonCount} × {dataset.meta.grid.latCount} cells
        </span>
      </div>

      <div className="ocean-plate-viewport">
        <canvas
          ref={canvasRef}
          aria-label={`Global sea surface temperature and surface current field for ${frame.label}. A highlighted zonal transect at ${transect.lat.toFixed(1)} degrees latitude is shown, with ${summary}. Particle motion shows current direction and relative speed, visually accelerated; displacement is not to scale.`}
          className="ocean-canvas"
          role="img"
        />
        <span aria-hidden="true" className="plate-tick plate-tick--tl" />
        <span aria-hidden="true" className="plate-tick plate-tick--tr" />
        <span aria-hidden="true" className="plate-tick plate-tick--bl" />
        <span aria-hidden="true" className="plate-tick plate-tick--br" />
        <span className="ocean-plate-corner">
          {playing ? "Sonification running" : "Field preview"}
        </span>
      </div>

      <div className="ocean-legend" aria-hidden="true">
        <span className="ocean-legend-label">SST</span>
        <span className="ocean-legend-bar" />
        <span className="ocean-legend-range">−2 °C</span>
        <span className="ocean-legend-mid">20</span>
        <span className="ocean-legend-range">32 °C</span>
      </div>

      <figcaption className="ocean-plate-caption">
        <span>
          Sea surface temperature is the raster. Pale lines are advected
          particles following surface current direction; motion is deliberately
          faster than reality so the flow is legible. The highlighted band is a
          listening transect, not a front.
        </span>
        <span className="ocean-plate-credit">
          {frame.label} · OSCAR / NOAA OISST
        </span>
      </figcaption>
    </figure>
  );
}
