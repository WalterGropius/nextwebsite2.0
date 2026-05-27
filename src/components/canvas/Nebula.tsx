'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SplatMesh as SplatMeshClass } from '@sparkjsdev/spark'

// Procedural nebula built directly on top of Spark. We push a few thousand
// gaussian splats into a packed buffer, scattered by 3D simplex-ish noise,
// then tint them along a colour ramp so the cloud reads as a real nebula —
// hot blue/violet core, magenta veins, dusty orange edge.

type NebulaProps = {
  count?: number
  radius?: number
  // World-space centre offset
  position?: [number, number, number]
  // Per-frame rotation speed (rad/s)
  spin?: number
}

// Cheap deterministic value-noise so the cloud looks the same across reloads
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)

  const n000 = hash3(xi, yi, zi)
  const n100 = hash3(xi + 1, yi, zi)
  const n010 = hash3(xi, yi + 1, zi)
  const n110 = hash3(xi + 1, yi + 1, zi)
  const n001 = hash3(xi, yi, zi + 1)
  const n101 = hash3(xi + 1, yi, zi + 1)
  const n011 = hash3(xi, yi + 1, zi + 1)
  const n111 = hash3(xi + 1, yi + 1, zi + 1)

  const x00 = n000 + (n100 - n000) * u
  const x10 = n010 + (n110 - n010) * u
  const x01 = n001 + (n101 - n001) * u
  const x11 = n011 + (n111 - n011) * u
  const y0 = x00 + (x10 - x00) * v
  const y1 = x01 + (x11 - x01) * v
  return y0 + (y1 - y0) * w
}

function fbm(x: number, y: number, z: number, octaves = 4): number {
  let total = 0
  let amp = 1
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    total += noise3(x * freq, y * freq, z * freq) * amp
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return total / max
}

// Lerp two THREE.Color into out
function lerpColor(out: THREE.Color, a: THREE.Color, b: THREE.Color, t: number) {
  out.r = a.r + (b.r - a.r) * t
  out.g = a.g + (b.g - a.g) * t
  out.b = a.b + (b.b - a.b) * t
}

export function Nebula({
  count = 16000,
  radius = 26,
  position = [0, 0, -28],
  spin = 0.008,
}: NebulaProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const splatRef = useRef<SplatMeshClass | null>(null)

  const construct = useMemo(() => {
    // Astrophysical-ish palette — deep magenta-violet core fading to
    // a teal/cyan H-II edge with warm hydrogen-alpha rims. Anchored
    // closer to real emission nebulae (Carina, Lagoon) than the
    // candy ramp this used to be.
    const deep = new THREE.Color('#150733') // sub-thermal void
    const core = new THREE.Color('#6735c2') // ionised violet
    const hot = new THREE.Color('#d63a8a') // Hα magenta
    const mid = new THREE.Color('#ff9a55') // dust rim
    const teal = new THREE.Color('#3ec7c7') // OIII teal
    const edge = new THREE.Color('#0a1a2b') // cold molecular outer dust

    const sampleRamp = (out: THREE.Color, t: number) => {
      if (t < 0.15) {
        lerpColor(out, deep, core, t / 0.15)
      } else if (t < 0.4) {
        lerpColor(out, core, hot, (t - 0.15) / 0.25)
      } else if (t < 0.62) {
        lerpColor(out, hot, mid, (t - 0.4) / 0.22)
      } else if (t < 0.85) {
        lerpColor(out, mid, teal, (t - 0.62) / 0.23)
      } else {
        lerpColor(out, teal, edge, (t - 0.85) / 0.15)
      }
    }

    // Two off-axis "lobes" so the cloud isn't a centred ball — gives
    // the silhouette a real-nebula asymmetry.
    const lobeA = new THREE.Vector3(0.25, 0.05, -0.1)
    const lobeB = new THREE.Vector3(-0.35, -0.12, 0.15)
    const lobeDistance = (px: number, py: number, pz: number) => {
      const dax = px - lobeA.x
      const day = py - lobeA.y
      const daz = pz - lobeA.z
      const dbx = px - lobeB.x
      const dby = py - lobeB.y
      const dbz = pz - lobeB.z
      const da = Math.sqrt(dax * dax + day * day + daz * daz)
      const db = Math.sqrt(dbx * dbx + dby * dby + dbz * dbz)
      return Math.min(da, db * 0.85)
    }

    return (splats: import('@sparkjsdev/spark').PackedSplats) => {
      const center = new THREE.Vector3()
      const scales = new THREE.Vector3()
      const quat = new THREE.Quaternion()
      const color = new THREE.Color()
      const tmpA = new THREE.Color()
      const tmpB = new THREE.Color()

      // Budget split: most splats build the cloud, a halo of fine dust
      // wraps it, and a small population of bright "stellar nursery"
      // hotspots punctuates the densest knots.
      const haloBudget = Math.floor(count * 0.18)
      const hotspotBudget = Math.floor(count * 0.04)
      const cloudBudget = count - haloBudget - hotspotBudget

      let placed = 0
      let guard = 0
      while (placed < cloudBudget && guard < cloudBudget * 14) {
        guard++
        const u = Math.random() * 2 - 1
        const theta = Math.random() * Math.PI * 2
        const r = Math.cbrt(Math.random())
        const s = Math.sqrt(1 - u * u)
        let px = r * s * Math.cos(theta)
        let py = r * s * Math.sin(theta) * 0.55
        let pz = r * u

        // Distance to the nearest lobe — used both to bias density and
        // to drive the colour ramp. This is the "two cores" trick.
        const dLobe = lobeDistance(px, py, pz)
        const distFalloff = THREE.MathUtils.clamp(1 - dLobe * 1.4, 0, 1)

        // Three independent octaves — first sets large structure,
        // second carves filaments, third is fine grain. Product +
        // ridge function fakes the "shock front" look of an emission
        // nebula better than a single fbm.
        const n1 = fbm(px * 1.6, py * 1.6, pz * 1.6, 6)
        const n2 = fbm(px * 3.8 + 13.7, py * 3.8 - 9.1, pz * 3.8 + 5.5, 5)
        const n3 = fbm(px * 8.2 - 4.4, py * 8.2 + 7.3, pz * 8.2 - 2.1, 4)
        const ridge = 1 - Math.abs(n1 - 0.5) * 2 // ridge noise: hot crests
        const veins = Math.pow(n1 * n2 * 4.0, 0.8)
        const density =
          veins * 0.45 + ridge * 0.25 + n3 * 0.12 + distFalloff * 0.4
        if (density < 0.5) continue

        center.set(px * radius, py * radius, pz * radius)

        // Splat size — fine grain dominates so the nebula reads as
        // dusty rather than puffy. Big soft puffs only in core knots.
        const sizeRoll = Math.random()
        const isFine = sizeRoll < 0.7
        const size = isFine
          ? 0.06 + sizeRoll * 0.12
          : 0.22 + distFalloff * 0.6 + Math.random() * 0.25
        scales.set(size, size, size)
        quat.set(0, 0, 0, 1)

        // Colour: distance-from-lobe drives the ramp, not raw radius —
        // so each lobe has its own hot core and cools outward.
        sampleRamp(color, THREE.MathUtils.clamp(dLobe * 1.1, 0, 1))
        // Ridge crests glow a bit hotter (more saturation + brightness)
        if (ridge > 0.78) {
          tmpA.copy(color)
          tmpB.copy(color).offsetHSL(0.02, 0.35, 0.18)
          color.lerpColors(tmpA, tmpB, 0.7)
        }

        const baseAlpha = isFine ? 0.16 : 0.3
        const opacity = THREE.MathUtils.clamp(
          (density - 0.5) * 1.6 + baseAlpha,
          0.08,
          0.95,
        )

        splats.pushSplat(center, scales, quat, opacity, color)
        placed++
      }

      // Bright stellar-nursery hotspots — handful of small, fully
      // opaque white-hot points clustered near each lobe centre.
      let hot = 0
      let hotGuard = 0
      while (hot < hotspotBudget && hotGuard < hotspotBudget * 20) {
        hotGuard++
        // Bias position around one of the lobes
        const lobe = Math.random() < 0.5 ? lobeA : lobeB
        const jitter = 0.18
        const px = lobe.x + (Math.random() - 0.5) * jitter
        const py = lobe.y + (Math.random() - 0.5) * jitter
        const pz = lobe.z + (Math.random() - 0.5) * jitter

        // Only spawn where the cloud is dense enough to justify a star
        const n = fbm(px * 4.0, py * 4.0, pz * 4.0, 4)
        if (n < 0.5) continue

        center.set(px * radius, py * radius, pz * radius)
        const size = 0.04 + Math.random() * 0.07
        scales.set(size, size, size)
        quat.set(0, 0, 0, 1)
        // Hot white with a faint pink tint — feels like an O/B star
        color.setRGB(1.0, 0.92 + Math.random() * 0.08, 0.86 + Math.random() * 0.1)
        splats.pushSplat(center, scales, quat, 0.95, color)
        hot++
      }

      // Halo — sparse cool dust + faint outer glow, drifts to ~1.6x
      // the cloud radius so the eye reads a soft edge fading into
      // empty space.
      let halo = 0
      let haloGuard = 0
      while (halo < haloBudget && haloGuard < haloBudget * 8) {
        haloGuard++
        const u = Math.random() * 2 - 1
        const theta = Math.random() * Math.PI * 2
        const r = 0.9 + Math.random() * 0.7
        const s = Math.sqrt(1 - u * u)
        const px = r * s * Math.cos(theta)
        const py = r * s * Math.sin(theta) * 0.55
        const pz = r * u

        const n = fbm(px * 1.1, py * 1.1, pz * 1.1, 4)
        if (n < 0.4) continue

        center.set(px * radius * 1.5, py * radius * 1.5, pz * radius * 1.5)

        const size = 0.05 + Math.random() * 0.14
        scales.set(size, size, size)
        quat.set(0, 0, 0, 1)

        // Halo skews cool (teal → cold edge) to fake distance haze
        sampleRamp(color, 0.78 + Math.random() * 0.2)
        const opacity = 0.06 + n * 0.14
        splats.pushSplat(center, scales, quat, opacity, color)
        halo++
      }
    }
  }, [count, radius])

  const [px, py, pz] = position
  useEffect(() => {
    const mesh = new SplatMeshClass({
      maxSplats: count,
      constructSplats: construct,
    })
    splatRef.current = mesh
    // eslint-disable-next-line
    const group = groupRef.current as any
    group?.add(mesh)
    mesh.position.set(px, py, pz)
    return () => {
      group?.remove(mesh)
      mesh.dispose?.()
      splatRef.current = null
    }
  }, [construct, count, px, py, pz])

  useFrame((_, delta) => {
    if (splatRef.current) {
      splatRef.current.rotation.y += spin * delta
      splatRef.current.rotation.x += spin * 0.3 * delta
    }
  })

  return <group ref={groupRef} />
}
