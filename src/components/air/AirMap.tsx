"use client";

import { useEffect, useRef, useState } from "react";

import type { AirCity, AirDataset, AirPollutantId } from "@/lib/air/types";
import { AIR_POLLUTANT_SHORT, formatAirValue } from "@/lib/air/dataset";
import { airPanForLongitude } from "@/lib/air/mapping";

interface LandGeometry {
  type: string;
  coordinates: unknown;
}

interface LandFeature {
  type: "Feature";
  geometry: LandGeometry | null;
}

interface AirMapProps {
  dataset: AirDataset;
  city: AirCity;
  compareCity: AirCity | null;
  hourIndex: number;
  pollutant: AirPollutantId;
  onSelect: (cityId: string) => void;
}

const BOUNDS = { west: -130, east: -65, south: 23, north: 50 };

function project(lon: number, lat: number, width: number, height: number) {
  return {
    x: ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * width,
    y: ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * height,
  };
}

function drawPolygon(
  context: CanvasRenderingContext2D,
  ring: number[][],
  width: number,
  height: number,
) {
  ring.forEach(([lon, lat], index) => {
    const point = project(lon, lat, width, height);
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.closePath();
}

function drawFeature(
  context: CanvasRenderingContext2D,
  feature: LandFeature,
  width: number,
  height: number,
) {
  const geometry = feature.geometry;
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates as number[][][]) {
      drawPolygon(context, ring, width, height);
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates as number[][][][]) {
      for (const ring of polygon) drawPolygon(context, ring, width, height);
    }
  }
}

export function AirMap({
  dataset,
  city,
  compareCity,
  hourIndex,
  pollutant,
  onSelect,
}: AirMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [land, setLand] = useState<LandFeature[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;
    fetch("/data/ne_110m_land.geojson")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { features?: LandFeature[] } | null) => {
        if (!cancelled) setLand(data?.features ?? []);
      })
      .catch(() => {
        if (!cancelled) setLand([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const update = () => {
      const rect = parent.getBoundingClientRect();
      setSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width < 2 || size.height < 2) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = size.width;
    const height = size.height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#05080e";
    context.fillRect(0, 0, width, height);

    // Latitude / longitude graticule.
    context.strokeStyle = "rgba(155, 200, 216, 0.10)";
    context.lineWidth = 1;
    context.font = "10px 'IBM Plex Mono', monospace";
    context.fillStyle = "rgba(155, 200, 216, 0.46)";
    for (let lon = -120; lon <= -70; lon += 10) {
      const point = project(lon, BOUNDS.south, width, height);
      context.beginPath();
      context.moveTo(point.x, 0);
      context.lineTo(point.x, height);
      context.stroke();
      context.fillText(`${Math.abs(lon)}°W`, point.x + 3, height - 6);
    }
    for (let lat = 25; lat <= 45; lat += 5) {
      const point = project(BOUNDS.west, lat, width, height);
      context.beginPath();
      context.moveTo(0, point.y);
      context.lineTo(width, point.y);
      context.stroke();
      context.fillText(`${lat}°N`, 3, point.y - 4);
    }

    // Land geometry: a geographic frame, not a data layer.
    context.beginPath();
    for (const feature of land) drawFeature(context, feature, width, height);
    context.fillStyle = "#0d1a28";
    context.fill();
    context.strokeStyle = "rgba(155, 200, 216, 0.32)";
    context.lineWidth = 1;
    context.stroke();

    const compact = width < 540;
    const max = dataset.meta.normalization[pollutant].max;
    const radiusFor = (value: number | null) => {
      if (value === null) return 4;
      return 4 + Math.min(1, Math.max(0, value / max)) * 7;
    };

    const selectedPoint = project(city.lon, city.lat, width, height);

    for (const marker of dataset.cities) {
      const point = project(marker.lon, marker.lat, width, height);
      const isSelected = marker.id === city.id;
      const isCompared = compareCity?.id === marker.id;
      const value = marker.series[pollutant][hourIndex];
      const radius = radiusFor(value);
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fillStyle =
        value === null
          ? "rgba(124, 140, 160, 0.12)"
          : isSelected
            ? "rgba(66, 199, 217, 0.85)"
            : "rgba(139, 154, 170, 0.55)";
      context.fill();
      if (isSelected || isCompared) {
        context.strokeStyle = isSelected ? "#42c7d9" : "#9bc8d8";
        context.lineWidth = isSelected ? 2 : 1;
        context.setLineDash(isCompared && !isSelected ? [3, 3] : []);
        context.beginPath();
        context.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
      }
      const tooCloseToSelected =
        !isSelected &&
        !isCompared &&
        Math.hypot(point.x - selectedPoint.x, point.y - selectedPoint.y) < 54;
      if ((compact && !isSelected && !isCompared) || tooCloseToSelected) continue;
      context.fillStyle = isSelected ? "#e8eef5" : "rgba(232, 238, 245, 0.78)";
      context.font = isSelected
        ? "600 12px Inter, system-ui, sans-serif"
        : "12px Inter, system-ui, sans-serif";
      const label = marker.name;
      const textWidth = context.measureText(label).width;
      const labelX =
        point.x + radius + 5 + textWidth > width - 6
          ? point.x - radius - 5 - textWidth
          : point.x + radius + 5;
      const labelY = point.y + 4;
      context.fillText(label, labelX, labelY);
    }

  }, [city, compareCity, dataset, hourIndex, land, pollutant, size]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest: AirCity | null = null;
    let distance = 24;
    for (const marker of dataset.cities) {
      const point = project(marker.lon, marker.lat, rect.width, rect.height);
      const next = Math.hypot(point.x - x, point.y - y);
      if (next < distance) {
        distance = next;
        nearest = marker;
      }
    }
    if (nearest) onSelect(nearest.id);
  };

  const label = `Map of eight US ground monitors for ${formatAirValue(pollutant, city.series[pollutant][hourIndex])}. ${city.name} is selected. Markers are placed at monitor coordinates, not city centres. The accessible city select lists the same locations.`;

  return (
    <div className="air-map-viewport">
      <canvas
        aria-label={label}
        className="air-map-canvas"
        onPointerDown={handlePointerDown}
        ref={canvasRef}
        role="img"
      />
      <span className="air-map-legend" aria-hidden="true">
        <span className="air-map-legend-dot" />
        {AIR_POLLUTANT_SHORT[pollutant]} · ground monitor · marker size follows concentration
      </span>
      <span className="air-map-projection" aria-hidden="true">
        equirectangular crop · {BOUNDS.west}° to {BOUNDS.east}° · {BOUNDS.south}° to {BOUNDS.north}°
      </span>
      <span className="air-map-stereo" aria-hidden="true">
        stereo: west ← → east ({airPanForLongitude(city.lon).toFixed(2)})
      </span>
    </div>
  );
}
