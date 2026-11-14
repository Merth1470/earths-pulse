import "server-only";

import type { SvsVisualization } from "./types";

const SVS_API_BASE = "https://svs.gsfc.nasa.gov/api";
const DEFAULT_TIMEOUT_MS = 10_000;

export class NasaSvsError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "NasaSvsError";
  }
}

/**
 * Read one NASA SVS visualization record.
 *
 * Stage 1 uses the verified static record in `sources.ts` so the interface has
 * no runtime dependency on NASA's servers. This client exists for the future
 * acquisition layer and must stay server-side: it is the only place that should
 * talk to the SVS Page API.
 */
export async function fetchSvsVisualization(
  id: number,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<SvsVisualization> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new NasaSvsError(`Invalid NASA SVS record id: ${id}`);
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    const response = await fetch(`${SVS_API_BASE}/${id}`, {
      headers: { Accept: "application/json" },
      signal: options.signal ?? timeoutController.signal,
      next: { revalidate: 86_400 },
    });

    if (!response.ok) {
      throw new NasaSvsError(
        `NASA SVS record ${id} returned HTTP ${response.status}.`,
        response.status,
      );
    }

    const payload: unknown = await response.json();
    assertSvsVisualization(payload, id);
    return payload;
  } catch (error) {
    if (error instanceof NasaSvsError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new NasaSvsError(
        `NASA SVS record ${id} timed out after ${timeoutMs} ms.`,
        undefined,
        error,
      );
    }
    throw new NasaSvsError(
      `Could not read NASA SVS record ${id}.`,
      undefined,
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
}

function assertSvsVisualization(
  value: unknown,
  expectedId: number,
): asserts value is SvsVisualization {
  if (!isRecord(value)) {
    throw new NasaSvsError("NASA SVS response was not an object.");
  }

  if (value.id !== expectedId || typeof value.title !== "string") {
    throw new NasaSvsError(
      "NASA SVS response did not match the requested record shape.",
    );
  }

  if (!Array.isArray(value.media_groups) || !Array.isArray(value.credits)) {
    throw new NasaSvsError("NASA SVS response was missing expected fields.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
