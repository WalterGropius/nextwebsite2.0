'use client'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { SparkRenderer, SplatMesh } from './spark'

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

// Idle drift: when nothing steers the camera (no mouse, no gyro — e.g. an
// iPhone, which only exposes the gyro behind a permission prompt we refuse
// to show) it wanders on a slow Lissajous so the scene still reads as 3D.
const DRIFT = { x: 0.07, y: 0.16, fx: 0.11, fy: 0.07 }
const IDLE_AFTER = 2.2 // seconds without input before the drift fades in

export function Flowers({
  dark = false,
  tier = 'high',
  quality = 1,
  onReady,
}: {
  dark?: boolean
  // Fired once the capture has loaded, so the page can retire its poster.
  onReady?: () => void
  tier?: DeviceTier
  // Runtime quality multiplier from the hero's PerformanceMonitor.
  // Below 1 the scene sheds cost (fewer stars, and — via Spark 2's
  // LoD budget — fewer splats); above 1 fast machines overdrive the
  // star field a little. Splats themselves never exceed 1: the
  // captures have a fixed count, so extra sharpness comes from dpr.
  quality?: number
}) {
  // LoD pyramids cost load/mem on devices that will never need them —
  // only non-high tiers build one, and only they can be told to render
  // a downsampled splat set under pressure.
  const useLod = tier !== 'high'
  const lodSplatScale = useLod ? Math.min(1, quality) : 1
  const starScale = quality
  const [isClient, setIsClient] = useState(false)
  const orbitRef = useRef({ x: 0, y: 0 })
  const distanceRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const gyroRef = useRef<{ x: number; y: number } | null>(null)
  const screenAngleRef = useRef(0)
  const lastInputRef = useRef(-1e9)
  const idleRef = useRef(0)
  const scrollRef = useRef(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const handlePointer = (clientX: number, clientY: number) => {
      pointerRef.current.x = (clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = (clientY / window.innerHeight) * 2 - 1
      lastInputRef.current = performance.now() / 1000
    }
    const onScroll = () => {
      scrollRef.current = Math.min(1, window.scrollY / window.innerHeight)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
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

    // Always listen: Android and desktop deliver orientation freely. iOS
    // only does after DeviceOrientationEvent.requestPermission(), which
    // means a system prompt — not worth it for a background. There the
    // listener simply never fires and touch + idle drift take over.
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [isClient])

  useFrame(({ camera, clock }, delta) => {
    const gyro = gyroRef.current
    const now = performance.now() / 1000
    // Fade the idle drift in once input goes quiet, out the moment it resumes.
    const idleTarget = !gyro && now - lastInputRef.current > IDLE_AFTER ? 1 : 0
    idleRef.current += (idleTarget - idleRef.current) * (1 - Math.exp(-1.5 * Math.min(delta, 0.1)))
    const t = clock.elapsedTime
    const driftX = Math.sin(t * DRIFT.fx * Math.PI * 2) * DRIFT.x * idleRef.current
    const driftY = Math.sin(t * DRIFT.fy * Math.PI * 2 + 1.3) * DRIFT.y * idleRef.current
    const targetX = (gyro ? gyro.x : pointerRef.current.y * 0.3) + driftX
    const targetY = (gyro ? gyro.y : pointerRef.current.x * 0.5) + driftY
    const orbit = orbitRef.current
    if (!distanceRef.current) distanceRef.current = camera.position.length() || 5
    // Scrolling eases the camera back a touch, so even a thumb flick on a
    // phone reads as moving through the scene.
    const dist = distanceRef.current * (1 + scrollRef.current * 0.35)

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
      if (
        orbit.x === targetX &&
        orbit.y === targetY &&
        Math.abs(camera.position.length() - dist) < ORBIT_EPSILON
      )
        return
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
    camera.position.set(0, 0, dist).applyEuler(ORBIT_EULER)
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
    const near = Math.max(400, Math.round(budget.near * starScale))
    const far = Math.max(200, Math.round(budget.far * starScale))
    return (
      <>
        <SparkRenderer lodSplatScale={lodSplatScale} />
        {/* Everything the viewer parallaxes lives under the tilt group —
            both star layers as well as the capture. With the stars
            outside it the splat swung on its own against a pinned
            starfield, which read as the nebula sliding over a painted
            backdrop instead of the whole sky moving with the viewer. */}
        <group position={[0, 0, 4]}>
          <Stars
            key={`near-${near}`}
            radius={80}
            depth={40}
            count={near}
            factor={6}
            saturation={0}
            fade
            speed={0.8}
          />
        </group>
        <Stars
          key={`far-${far}`}
          radius={140}
          depth={60}
          count={far}
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
          lod={useLod}
          onLoad={onReady}
        />
      </>
    )
  }

  return (
    <>
      <SparkRenderer lodSplatScale={lodSplatScale} />
      <SplatMesh
        url="/flowers_white.sog"
        scale={3}
        rotation={[Math.PI, 0.3 * Math.PI, 0]}
        lod={useLod}
        onLoad={onReady}
      />
    </>
  )
}
