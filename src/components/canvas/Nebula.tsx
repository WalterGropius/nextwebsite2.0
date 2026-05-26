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
  count = 12000,
  radius = 16,
  position = [0, 0, -14],
  spin = 0.012,
}: NebulaProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const splatRef = useRef<SplatMeshClass | null>(null)

  const construct = useMemo(() => {
    // Five stops along the cloud — adds a deep indigo backbone and a
    // hot pink hotspot between core and mid so the gradient feels less
    // like a two-stop ramp.
    const deep = new THREE.Color('#2a1a6e')
    const core = new THREE.Color('#7a4dff')
    const hot = new THREE.Color('#ff3da0')
    const mid = new THREE.Color('#ff7a55')
    const edge = new THREE.Color('#ffd2a0')

    // Sample the 5-stop ramp at t in [0,1]
    const sampleRamp = (out: THREE.Color, t: number) => {
      if (t < 0.18) {
        lerpColor(out, deep, core, t / 0.18)
      } else if (t < 0.45) {
        lerpColor(out, core, hot, (t - 0.18) / 0.27)
      } else if (t < 0.72) {
        lerpColor(out, hot, mid, (t - 0.45) / 0.27)
      } else {
        lerpColor(out, mid, edge, (t - 0.72) / 0.28)
      }
    }

    return (splats: import('@sparkjsdev/spark').PackedSplats) => {
      const center = new THREE.Vector3()
      const scales = new THREE.Vector3()
      const quat = new THREE.Quaternion()
      const color = new THREE.Color()
      const tmpA = new THREE.Color()
      const tmpB = new THREE.Color()

      // ~15% of the budget goes to a fine dust halo well outside the
      // main cloud — gives the nebula a soft glow at the edges and
      // helps it read as "zoomed out" rather than just "bigger".
      const haloBudget = Math.floor(count * 0.15)
      const cloudBudget = count - haloBudget

      let placed = 0
      let guard = 0
      while (placed < cloudBudget && guard < cloudBudget * 12) {
        guard++
        // Sample within a unit sphere
        const u = Math.random() * 2 - 1
        const theta = Math.random() * Math.PI * 2
        const r = Math.cbrt(Math.random())
        const s = Math.sqrt(1 - u * u)
        const px = r * s * Math.cos(theta)
        const py = r * s * Math.sin(theta) * 0.55 // squash vertically
        const pz = r * u

        // Density via 6-octave fbm + a counter-rotated fbm whose product
        // carves filament-like veins through the cloud instead of a
        // smooth fog. Bias core: density falls off with radius.
        const distFalloff = 1 - r
        const n1 = fbm(px * 2.4, py * 2.4, pz * 2.4, 6)
        const n2 = fbm(px * 4.8 + 13.7, py * 4.8 - 9.1, pz * 4.8 + 5.5, 5)
        const veins = Math.pow(n1 * n2 * 4.0, 0.85)
        const density = veins * 0.55 + distFalloff * 0.45
        if (density < 0.48) continue

        center.set(px * radius, py * radius, pz * radius)

        // Splat size — bigger soft puffs in the core, tighter on the
        // edges. Dust grains around 0.08 keep the cloud detailed when
        // zoomed in.
        const sizeRoll = Math.random()
        const size =
          sizeRoll < 0.55
            ? 0.08 + sizeRoll * 0.18
            : 0.22 + (1 - r) * 0.55 + Math.random() * 0.3
        scales.set(size, size, size)
        quat.set(0, 0, 0, 1)

        sampleRamp(color, r)
        // Punch up saturation in the densest knots
        if (density > 0.85) {
          tmpA.copy(color)
          tmpB.copy(color).offsetHSL(0, 0.3, 0.12)
          color.lerpColors(tmpA, tmpB, 0.6)
        }

        // Soft alpha — denser = more opaque, fine dust stays translucent
        const baseAlpha = size < 0.2 ? 0.18 : 0.28
        const opacity = THREE.MathUtils.clamp(
          (density - 0.48) * 1.5 + baseAlpha,
          0.12,
          0.95,
        )

        splats.pushSplat(center, scales, quat, opacity, color)
        placed++
      }

      // Halo — a sparse shell of tiny dust grains around the cloud.
      // Larger radius, near-uniform spread, very low opacity.
      let halo = 0
      let haloGuard = 0
      while (halo < haloBudget && haloGuard < haloBudget * 8) {
        haloGuard++
        const u = Math.random() * 2 - 1
        const theta = Math.random() * Math.PI * 2
        // Bias toward the outer shell
        const r = 0.85 + Math.random() * 0.5
        const s = Math.sqrt(1 - u * u)
        const px = r * s * Math.cos(theta)
        const py = r * s * Math.sin(theta) * 0.55
        const pz = r * u

        const n = fbm(px * 1.3, py * 1.3, pz * 1.3, 4)
        if (n < 0.42) continue

        center.set(px * radius * 1.35, py * radius * 1.35, pz * radius * 1.35)

        const size = 0.06 + Math.random() * 0.12
        scales.set(size, size, size)
        quat.set(0, 0, 0, 1)

        sampleRamp(color, Math.min(0.95, r))
        const opacity = 0.08 + n * 0.18
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
    const group = groupRef.current
    group?.add(mesh as unknown as THREE.Object3D)
    mesh.position.set(px, py, pz)
    return () => {
      group?.remove(mesh as unknown as THREE.Object3D)
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
