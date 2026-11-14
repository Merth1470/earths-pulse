/**
 * Verify the bundled ocean subset without a browser.
 * Run: npm run verify:data
 */
import assert from "node:assert/strict";
import fs from "node:fs";

const meta = JSON.parse(fs.readFileSync("public/data/ocean-2012.json", "utf8"));
const buffer = fs.readFileSync("public/data/ocean-2012.bin");
const values = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2);

const cells = meta.grid.lonCount * meta.grid.latCount;
assert.equal(meta.frames.length, 12, "expected twelve monthly frames");
assert.equal(cells, 25440, "expected a 240 × 106 grid");
assert.equal(
  values.length,
  meta.frames.length * 3 * cells,
  "binary length must match the declared layout",
);
assert.equal(meta.variables.sst.scale, 0.01);
assert.equal(meta.variables.u.scale, 0.001);
assert.equal(meta.binary.dtype, "int16-le");
assert.ok(meta.sources.some((s) => s.id === "oscar"));
assert.ok(meta.sources.some((s) => s.id === "oisst"));

let sstCount = 0;
let speedCount = 0;
let sstMin = Infinity;
let sstMax = -Infinity;
let speedMax = -Infinity;
let sstSum = 0;

for (let frame = 0; frame < meta.frames.length; frame += 1) {
  const offset = frame * cells * 3;
  let frameSst = 0;
  for (let i = 0; i < cells; i += 1) {
    const sstRaw = values[offset + i];
    const uRaw = values[offset + cells + i];
    const vRaw = values[offset + cells * 2 + i];

    if (sstRaw !== meta.binary.fill) {
      const sst = sstRaw * meta.variables.sst.scale;
      assert.ok(sst >= -3 && sst <= 45, `SST out of valid range: ${sst}`);
      sstCount += 1;
      frameSst += 1;
      sstSum += sst;
      sstMin = Math.min(sstMin, sst);
      sstMax = Math.max(sstMax, sst);
    }
    if (uRaw !== meta.binary.fill && vRaw !== meta.binary.fill) {
      const u = uRaw * meta.variables.u.scale;
      const v = vRaw * meta.variables.v.scale;
      const speed = Math.hypot(u, v);
      assert.ok(speed < 5, `current speed out of plausible range: ${speed}`);
      speedCount += 1;
      speedMax = Math.max(speedMax, speed);
    }
  }
  assert.ok(frameSst > 10000, `frame ${frame} has too few ocean samples`);
}

assert.equal(sstCount, meta.stats.sst.count);
assert.equal(speedCount, meta.stats.speed.count);
assert.ok(Math.abs(sstMin - meta.stats.sst.min) < 0.02);
assert.ok(Math.abs(sstMax - meta.stats.sst.max) < 0.02);
assert.ok(Math.abs(sstSum / sstCount - meta.stats.sst.mean) < 0.05);
assert.ok(Math.abs(speedMax - meta.stats.speed.max) < 0.01);
assert.equal(meta.normalization.sst.min, meta.stats.sst.p02);
assert.equal(meta.normalization.sst.max, meta.stats.sst.p98);
assert.equal(meta.normalization.speed.max, meta.stats.speed.p98);

console.log("Ocean subset verified");
console.log(`  frames           ${meta.frames.length}`);
console.log(`  grid             ${meta.grid.lonCount} × ${meta.grid.latCount} (${cells} cells)`);
console.log(`  valid SST        ${sstCount} cells · ${sstMin.toFixed(2)} … ${sstMax.toFixed(2)} °C`);
console.log(`  valid currents   ${speedCount} cells · max ${speedMax.toFixed(3)} m/s`);
console.log(`  normalization    SST ${meta.normalization.sst.min.toFixed(2)} … ${meta.normalization.sst.max.toFixed(2)} °C`);
console.log(`                   speed 0 … ${meta.normalization.speed.max.toFixed(3)} m/s`);
console.log(`  bytes            ${buffer.byteLength} (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
