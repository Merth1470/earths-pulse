import type { DataStatus } from "@/lib/science/types";

/**
 * Audio contracts.
 *
 * Stage 1 ships no engine. These types define the boundary a future Web Audio
 * implementation must satisfy, so the UI can be wired to a real subsystem later
 * without importing audio graph details into React components.
 */

export type AudioEngineState =
  | "unimplemented"
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "suspended"
  | "error";

export type AudioParameter =
  | "pitch"
  | "amplitude"
  | "timbre"
  | "pan"
  | "filter-cutoff";

export type MappingCurve = "linear" | "logarithmic" | "step";

/**
 * One inspectable mapping between a scientific variable and an audio
 * parameter. The mapping is a scientific interpretation choice and must be
 * surfaced in the interface, never hidden in the audio graph.
 */
export interface SonificationMapping {
  variableId: string;
  parameter: AudioParameter;
  /** Normalized domain. Physical ranges live on the scientific variable. */
  domain: { min: 0; max: 1 };
  curve: MappingCurve;
  description: string;
}

export interface SonificationScene {
  id: string;
  datasetId: string;
  title: string;
  /** ISO 8601 instant, UTC. */
  startTime: string;
  endTime: string;
  durationSeconds: number;
  mappings: SonificationMapping[];
  provenanceNote: string;
}

export interface SonificationEngine {
  readonly state: AudioEngineState;
  load(scene: SonificationScene): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  dispose(): void;
}

export interface AudioStatus {
  engine: DataStatus;
  webAudio: "not-initialized" | "browser-supported" | "browser-unsupported";
  detail: string;
}

/**
 * The honest Stage 1 state. Nothing in the UI may claim otherwise.
 */
export const AUDIO_STATUS: AudioStatus = {
  engine: "not-implemented",
  webAudio: "not-initialized",
  detail:
    "No sonification engine is connected. Playback, speed, and layer controls remain disabled until numerical fields and an audio graph exist.",
};
