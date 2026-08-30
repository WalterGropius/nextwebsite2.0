// WGSL for the ink experiment — shared between the client page and the
// headless Node validation harness (vgpu/node + Dawn), so the shaders
// that ship are the shaders that were pixel-tested.

// Shared noise: cheap analytic curl of two scrolling value-noise bands.
// Divergence-free by construction, so the flow reads as liquid without
// a pressure solve.
export const NOISE_WGSL = /* wgsl */ `
fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// psi is a scalar stream function; velocity = perpendicular gradient.
fn psi(p: vec2f, t: f32) -> f32 {
  return vnoise(p * 3.0 + vec2f(t * 0.05, t * 0.04)) * 0.65
       + vnoise(p * 7.0 - vec2f(t * 0.07, t * 0.03)) * 0.35;
}
fn curl(p: vec2f, t: f32) -> vec2f {
  let e = 0.004;
  let dx = psi(p + vec2f(e, 0.0), t) - psi(p - vec2f(e, 0.0), t);
  let dy = psi(p + vec2f(0.0, e), t) - psi(p - vec2f(0.0, e), t);
  return vec2f(dy, -dx) / (2.0 * e);
}
`

// Velocity step: self-advect, damp, add curl-noise stirring plus a
// pointer impulse along the drag direction.
export const VEL_WGSL = /* wgsl */ `
struct Params {
  dt: f32,
  time: f32,
  decay: f32,
  noiseAmp: f32,
  pointer: vec2f,
  pointerVel: vec2f,
  pointerActive: f32,
  aspect: f32,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var src: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

${NOISE_WGSL}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // semi-Lagrangian: pull velocity from where this parcel came from
  let vHere = textureSampleLevel(src, samp, uv, 0.0).xy;
  let back = uv - vHere * params.dt;
  var v = textureSampleLevel(src, samp, back, 0.0).xy;

  // ambient stirring — the "ink in restless water" base motion
  let p = vec2f(uv.x * params.aspect, uv.y);
  v += curl(p, params.time) * params.noiseAmp * params.dt;

  // pointer impulse — a soft gaussian shove along the drag direction
  let d = (uv - params.pointer) * vec2f(params.aspect, 1.0);
  let g = exp(-dot(d, d) * 220.0) * params.pointerActive;
  v += params.pointerVel * g * 14.0 * params.dt;

  v *= params.decay;
  return vec4f(v, 0.0, 1.0);
}
`

// Dye step: advect ink through the fresh velocity, dissipate slightly,
// inject at the pointer while dragging and from ambient drops while
// idle.
export const DYE_WGSL = /* wgsl */ `
struct Params {
  dt: f32,
  dissipation: f32,
  pointer: vec2f,
  pointerActive: f32,
  aspect: f32,
  drop: vec2f,
  dropAge: f32,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var vel: texture_2d<f32>;
@group(0) @binding(2) var dye: texture_2d<f32>;
@group(0) @binding(3) var samp: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let v = textureSampleLevel(vel, samp, uv, 0.0).xy;
  let back = uv - v * params.dt;
  var ink = textureSampleLevel(dye, samp, back, 0.0).r;
  ink *= params.dissipation;

  // pointer brush
  let dp = (uv - params.pointer) * vec2f(params.aspect, 1.0);
  ink += exp(-dot(dp, dp) * 900.0) * params.pointerActive * 0.9;

  // ambient drop — blooms fast then stops feeding
  let dd = (uv - params.drop) * vec2f(params.aspect, 1.0);
  let dropStrength = max(0.0, 1.0 - params.dropAge * 1.4);
  ink += exp(-dot(dd, dd) * 2600.0) * dropStrength * 0.5;

  return vec4f(min(ink, 1.6), 0.0, 0.0, 1.0);
}
`

// Composite to the (transparent) canvas: Beer–Lambert style absorption
// so thin washes stay translucent and pools go dense, with a touch of
// edge darkening — the coffee-ring look of real ink drying on paper.
export const COMPOSITE_WGSL = /* wgsl */ `
struct Params {
  inkColor: vec3f,
  texel: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var dye: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let ink = textureSampleLevel(dye, samp, uv, 0.0).r;
  // gradient magnitude -> darker rims where the wash meets dry paper
  let gx = textureSampleLevel(dye, samp, uv + vec2f(params.texel.x, 0.0), 0.0).r
         - textureSampleLevel(dye, samp, uv - vec2f(params.texel.x, 0.0), 0.0).r;
  let gy = textureSampleLevel(dye, samp, uv + vec2f(0.0, params.texel.y), 0.0).r
         - textureSampleLevel(dye, samp, uv - vec2f(0.0, params.texel.y), 0.0).r;
  let rim = clamp(length(vec2f(gx, gy)) * 2.2, 0.0, 0.5);

  let a = clamp(1.0 - exp(-(ink * 2.1 + rim * ink)), 0.0, 0.96);
  // premultiplied over the transparent canvas — paper shows through
  return vec4f(params.inkColor * a, a);
}
`

