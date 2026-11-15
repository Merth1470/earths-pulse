/** Small Web Audio helpers shared by the three sonification engines. */

export const SILENT = 0.0001;

export function target(
  param: AudioParam,
  value: number,
  time: number,
  constant = 0.08,
) {
  if (!Number.isFinite(value)) return;
  param.setTargetAtTime(value, Math.max(time, 0), constant);
}

/** A squared positive half-wave, used for rhythmic pulses. */
export function makePulseCurve(): Float32Array<ArrayBuffer> {
  const length = 1024;
  const curve = new Float32Array(new ArrayBuffer(length * 4));
  for (let i = 0; i < length; i += 1) {
    const x = (i / (length - 1)) * 2 - 1;
    const positive = Math.max(0, x);
    curve[i] = positive * positive;
  }
  return curve;
}

/** Deterministic, gently smoothed noise so identical inputs sound identical. */
export function makeNoiseBuffer(context: AudioContext): AudioBuffer {
  const length = Math.floor(context.sampleRate * 2);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0x6d2b79f5;
  let smooth = 0;
  for (let i = 0; i < length; i += 1) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const white = ((seed >>> 0) / 0x100000000) * 2 - 1;
    smooth = smooth * 0.985 + white * 0.015;
    data[i] = Math.max(-1, Math.min(1, smooth * 6));
  }
  return buffer;
}
