'use client'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { SparkRenderer, SplatMesh } from './spark'

type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

function getScreenAngle(): number {
  if (typeof window === 'undefined') return 0
  const orientation = window.screen?.orientation?.angle
  if (typeof orientation === 'number') return orientation
  const legacy = (window as unknown as { orientation?: number }).orientation
  return typeof legacy === 'number' ? legacy : 0
}

import type { DeviceTier } from '@/lib/device-tier'

// Parallax moves the camera, never the splat. Spark bumps a SplatMesh's
// generator version on *any* change to its world matrix (SplatMesh.update ->
// transform.update), and a bumped version makes SparkRenderer regenerate the
// entire splat buffer that frame. Camera movement costs only a re-sort, which
// is a WASM radix sort Spark is built around. Rotating the mesh was therefore
// re-generating 52k (dark) / 327k (light) splats every single frame.
const ORBIT_EULER = new THREE.Euler()

// Below this per-frame step the orbit is close enough to snap to its target.
// Needed because Spark compares transforms with exact equality and the lerp
// never converges exactly, so an un-snapped orbit keeps the scene "moving"
// (and re-sorting) forever after the pointer stops.
const ORBIT_EPSILON = 1e-4

// Star budgets per device tier. The two star layers are the only
// procedural part of the dark scene left, so it scales linearly with
// these counts; the captured splat meshes are fixed assets and scale via
// canvas dpr instead.
const DARK_BUDGET: Record<DeviceTier, { near: number; far: number }> = {
  low: { near: 2500, far: 1200 },
  mid: { near: 5000, far: 2500 },
  high: { near: 9000, far: 4500 },
}

// The dark-mode capture is authored tiny: 95% of its 52k gaussians sit
// within a 0.16-unit radius of the centroid, so at the light scene's
// scale of 3 it renders as a speck in the middle of the frame. Blown up
// it engulfs the camera (~11-unit radius here) and reads as an immersive
// dust field — the individual gaussians stay sub-0.1 units even scaled,
// so the cloud keeps its grain instead of smearing into blobs.
const DARK_SPLAT_SCALE = 20

export function Flowers({
  dark = false,
  tier = 'high',
}: {
  dark?: boolean
  tier?: DeviceTier
}) {
  const [isClient, setIsClient] = useState(false)
  const orbitRef = useRef({ x: 0, y: 0 })
  const distanceRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const gyroRef = useRef<{ x: number; y: number } | null>(null)
  const screenAngleRef = useRef(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const handlePointer = (clientX: number, clientY: number) => {
      pointerRef.current.x = (clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = (clientY / window.innerHeight) * 2 - 1
    }
    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    const update = () => {
      screenAngleRef.current = getScreenAngle()
    }
    update()
    window.addEventListener('orientationchange', update)
    window.screen?.orientation?.addEventListener?.('change', update)
    return () => {
      window.removeEventListener('orientationchange', update)
      window.screen?.orientation?.removeEventListener?.('change', update)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null && e.gamma == null) return
      const betaRad = THREE.MathUtils.degToRad((e.beta ?? 60) - 60) * 0.5
      const gammaRad = THREE.MathUtils.degToRad(e.gamma ?? 0) * 0.5
      switch (screenAngleRef.current) {
        case 90:
          gyroRef.current = { x: -gammaRad, y: betaRad }
          break
        case -90:
        case 270:
          gyroRef.current = { x: gammaRad, y: -betaRad }
          break
        case 180:
          gyroRef.current = { x: -betaRad, y: -gammaRad }
          break
        default:
          gyroRef.current = { x: betaRad, y: gammaRad }
      }
    }

    let attached = false
    const attach = () => {
      if (attached) return
      window.addEventListener('deviceorientation', handleOrientation, true)
      attached = true
    }
    const detach = () => {
      if (!attached) return
      window.removeEventListener('deviceorientation', handleOrientation, true)
      attached = false
    }

    const Ctor = DeviceOrientationEvent as DeviceOrientationEventStatic | undefined
    const needsPermission =
      Ctor && typeof Ctor.requestPermission === 'function'

    if (!needsPermission) {
      attach()
      return detach
    }

    const onGranted = () => attach()
    window.addEventListener('motion-permission-granted', onGranted)

    return () => {
      window.removeEventListener('motion-permission-granted', onGranted)
      detach()
    }
  }, [isClient])

  useFrame(({ camera }, delta) => {
    const gyro = gyroRef.current
    const targetX = gyro ? gyro.x : pointerRef.current.y * 0.3
    const targetY = gyro ? gyro.y : pointerRef.current.x * 0.5
    const orbit = orbitRef.current
    if (!distanceRef.current) distanceRef.current = camera.position.length() || 5

    // Critically-damped lerp — small step every frame so the scene
    // glides toward the target rather than snapping. Frame-rate
    // independent via 1 - exp(-k * dt).
    const k = 3.2
    const a = 1 - Math.exp(-k * Math.min(delta, 0.1))
    const nextX = orbit.x + (targetX - orbit.x) * a
    const nextY = orbit.y + (targetY - orbit.y) * a

    // The lerp approaches its target asymptotically and never lands on it,
    // and Spark compares transforms for exact equality — so without a
    // settle threshold the hero would keep paying for movement forever
    // after the pointer stopped. Snap once the step is negligible, then
    // write nothing at all until the target actually moves again.
    if (
      Math.abs(nextX - orbit.x) < ORBIT_EPSILON &&
      Math.abs(nextY - orbit.y) < ORBIT_EPSILON
    ) {
      if (orbit.x === targetX && orbit.y === targetY) return
      orbit.x = targetX
      orbit.y = targetY
    } else {
      orbit.x = nextX
      orbit.y = nextY
    }

    // Swinging the scene group by (x, y) and orbiting the camera by
    // (-x, -y) are the same relative motion, so the parallax reads
    // identically — but this way the splat's world matrix never changes.
    ORBIT_EULER.set(-orbit.x, -orbit.y, 0, 'YXZ')
    camera.position.set(0, 0, distanceRef.current).applyEuler(ORBIT_EULER)
    camera.lookAt(0, 0, 0)
  })

  if (!isClient) return null

  if (dark) {
    // Dark mode: the captured splat nebula scaled up around the camera,
    // with a foreground field of bright white stars and a deeper
    // colour-saturated layer further out. This used to be a procedural
    // Spark nebula standing in for an asset that did not exist yet — the
    // real capture replaces it. Star counts scale with the device tier so
    // the scene stays fluid on weak GPUs.
    const budget = DARK_BUDGET[tier]
    return (
      <>
        <SparkRenderer />
        {/* Everything the viewer parallaxes lives under the tilt group —
            both star layers as well as the capture. With the stars
            outside it the splat swung on its own against a pinned
            starfield, which read as the nebula sliding over a painted
            backdrop instead of the whole sky moving with the viewer. */}
        <group position={[0, 0, 4]}>
          <Stars
            radius={80}
            depth={40}
            count={budget.near}
            factor={6}
            saturation={0}
            fade
            speed={0.8}
          />
        </group>
        <Stars
          radius={140}
          depth={60}
          count={budget.far}
          factor={3.5}
          saturation={1}
          fade
          speed={0.4}
        />
        {/* Same X flip as the light-mode capture — both come out of
            splat-transform Y-down. */}
        <SplatMesh
          url="/splat_dark.sog"
          scale={DARK_SPLAT_SCALE}
          rotation={[Math.PI, 0.3 * Math.PI, 0]}
        />
      </>
    )
  }

  return (
    <>
      <SparkRenderer />
      <SplatMesh
        url="/flowers_white.sog"
        scale={3}
        rotation={[Math.PI, 0.3 * Math.PI, 0]}
      />
    </>
  )
}
