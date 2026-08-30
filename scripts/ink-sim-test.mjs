// Headless validation for the /experiments/ink shaders.
//
// Runs the exact WGSL that ships (imported from app/experiments/ink/
// shaders.ts) through vgpu's Node backend (Dawn) — no browser, no eyes:
// it simulates a pointer drag plus one ambient drop, then asserts on
// pixels read back from the GPU and writes PNG frames for a human look.
//
//   node scripts/ink-sim-test.mjs [outDir]
//
// Requires a working headless adapter: `npx vgpu doctor` and, on bare
// containers, `npx vgpu install-software-renderer`.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { deflateSync } from "node:zlib"
import { init, effect, target, sampler, frame } from "vgpu/node"

// shaders.ts is TypeScript by extension only — pure ESM inside — so a
// data-URI import runs it without a loader or build step.
const shaderSrc = readFileSync(
  new URL("../app/experiments/ink/shaders.ts", import.meta.url),
  "utf8",
)
const { VEL_WGSL, DYE_WGSL, COMPOSITE_WGSL } = await import(
  "data:text/javascript;base64," + Buffer.from(shaderSrc).toString("base64")
)

// ---- minimal PNG writer (RGBA8, no deps) ----------------------------
function crc32(buf) {
  let c
  const table = crc32.table ?? (crc32.table = Array.from({ length: 256 }, (_, n) => {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  }))
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function writePng(path, rgba, w, h) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0 // filter: none
    rgba.subarray(y * w * 4, (y + 1) * w * 4).forEach((v, i) => {
      raw[y * (w * 4 + 1) + 1 + i] = v
    })
  }
  writeFileSync(
    path,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw)),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  )
}

// ---- the sim, exactly as the page runs it ---------------------------
const OUT = process.argv[2] ?? "."
mkdirSync(OUT, { recursive: true })

const W = 384
const H = 216
const aspect = W / H
const gpu = await init()

const mkPair = () => [
  target(gpu, { size: [W, H], format: "rgba16float" }),
  target(gpu, { size: [W, H], format: "rgba16float" }),
]
const vel = { t: mkPair(), i: 0 }
const dye = { t: mkPair(), i: 0 }
const screen = target(gpu, { size: [W, H] }) // rgba8unorm for readback

const linear = sampler(gpu, { minFilter: "linear", magFilter: "linear" })

const velFx = effect(gpu, VEL_WGSL, {
  set: {
    params: {
      dt: 1 / 60, time: 0, decay: 0.985, noiseAmp: 1.1,
      pointer: [0.5, 0.5], pointerVel: [0, 0], pointerActive: 0, aspect,
    },
    src: vel.t[0], samp: linear,
  },
})
const dyeFx = effect(gpu, DYE_WGSL, {
  set: {
    params: {
      dt: 1 / 60, dissipation: 0.995,
      pointer: [0.5, 0.5], pointerActive: 0, aspect,
      drop: [0.3, 0.4], dropAge: 0,
    },
    vel: vel.t[0], dye: dye.t[0], samp: linear,
  },
})
const compositeFx = effect(gpu, COMPOSITE_WGSL, {
  set: {
    params: { inkColor: [0.102, 0.114, 0.157], texel: [1 / W, 1 / H] },
    dye: dye.t[0], samp: linear,
  },
})

const dt = 1 / 60
const FRAMES = 150
const SNAP = new Set([30, 90, FRAMES - 1])
const dropBorn = 0

let inkAt60 = null
for (let f = 0; f < FRAMES; f++) {
  const t = f * dt
  // scripted pointer: drags across the middle for frames 60..120
  const dragging = f >= 60 && f < 120
  const k = (f - 60) / 60
  const px = 0.25 + 0.5 * Math.max(0, Math.min(1, k))
  const py = 0.55 + 0.1 * Math.sin(k * Math.PI * 2)

  const vRead = vel.t[vel.i]
  const vWrite = vel.t[1 - vel.i]
  velFx.set({
    params: {
      dt, time: t,
      pointer: [px, py],
      pointerVel: dragging ? [0.5, 0.1 * Math.cos(k * Math.PI * 2)] : [0, 0],
      pointerActive: dragging ? 1 : 0,
    },
    src: vRead,
  })
  const dRead = dye.t[dye.i]
  const dWrite = dye.t[1 - dye.i]
  dyeFx.set({
    params: {
      dt,
      pointer: [px, py],
      pointerActive: dragging ? 1 : 0,
      drop: [0.3, 0.4],
      dropAge: t - dropBorn,
    },
    vel: vWrite,
    dye: dRead,
  })
  compositeFx.set({ dye: dWrite })
  frame(gpu, (fr) => {
    fr.pass({ target: vWrite, clear: false }, (p) => p.draw(velFx))
    fr.pass({ target: dWrite, clear: false }, (p) => p.draw(dyeFx))
    fr.pass({ target: screen, clear: [0, 0, 0, 0] }, (p) => p.draw(compositeFx))
  })
  vel.i = 1 - vel.i
  dye.i = 1 - dye.i

  if (SNAP.has(f)) {
    const px8 = await screen.read()
    writePng(`${OUT}/ink-frame-${String(f).padStart(3, "0")}.png`, px8, W, H)
  }
  if (f === 59) {
    inkAt60 = await screen.read()
  }
}

// ---- assertions -----------------------------------------------------
const final = await screen.read()
const alphaSum = (px8) => {
  let s = 0
  for (let i = 3; i < px8.length; i += 4) s += px8[i]
  return s
}
const centroid = (px8) => {
  let s = 0, sx = 0, sy = 0
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const a = px8[(y * W + x) * 4 + 3]
      s += a; sx += a * x; sy += a * y
    }
  return s ? [sx / s, sy / s] : [W / 2, H / 2]
}

const a60 = alphaSum(inkAt60)
const aEnd = alphaSum(final)
const [cx] = centroid(final)
const checks = [
  ["drop produced ink by frame 60", a60 > W * H * 0.5],
  ["drag added more ink by the end", aEnd > a60 * 1.2],
  ["ink centroid pulled right by the drag", cx > 0.32 * W],
]
let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`)
  if (!ok) failed++
}
console.log(
  `alpha@60=${a60} alpha@end=${aEnd} centroidX=${(cx / W).toFixed(3)} frames=${FRAMES}`,
)
gpu.dispose()
process.exit(failed ? 1 : 0)
