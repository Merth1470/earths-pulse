import type { DataUnit } from "./types";

/**
 * A verified physical range used for normalization.
 *
 * The range must come from dataset metadata. This module never supplies a
 * default range because an invented scientific range is a fabricated
 * measurement.
 */
export interface NormalizationRange {
  min: number;
  max: number;
  unit: DataUnit;
  /** Human-readable source for the range, kept alongside the values. */
  source: string;
}

/**
 * Linear normalization into [0, 1].
 *
 * Returns null when the input or range is not finite, or when the range has no
 * width. Callers must treat null as "no audio value" rather than substituting
 * zero, which would silently invent a data point.
 */
export function normalizeLinear(
  value: number,
  range: NormalizationRange,
): number | null {
  const { min, max } = range;

  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }

  if (max <= min) {
    return null;
  }

  return clamp01((value - min) / (max - min));
}

/**
 * Logarithmic normalization for positive, wide-dynamic-range quantities.
 * Non-positive values return null instead of being forced to the floor.
 */
export function normalizeLog(
  value: number,
  range: NormalizationRange,
): number | null {
  const { min, max } = range;

  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    value <= 0 ||
    min <= 0 ||
    max <= min
  ) {
    return null;
  }

  const logValue = Math.log(value);
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  return clamp01((logValue - logMin) / (logMax - logMin));
}

/** Recover a physical value from a normalized sample. Used for inspection only. */
export function denormalizeLinear(
  normalized: number,
  range: NormalizationRange,
): number | null {
  if (
    !Number.isFinite(normalized) ||
    !Number.isFinite(range.min) ||
    !Number.isFinite(range.max) ||
    range.max <= range.min
  ) {
    return null;
  }

  return range.min + clamp01(normalized) * (range.max - range.min);
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}
