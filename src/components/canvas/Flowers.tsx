'use client'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { SparkRenderer, SplatMesh } from './spark'
import { Nebula } from './Nebula'

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

export function Flowers({ dark = false }: { dark?: boolean }) {
  const splatRef = useRef<THREE.Object3D | null>(null)
  const [isClient, setIsClient] = useState(false)
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

  useFrame((_, delta) => {
    if (!splatRef.current) return
    const gyro = gyroRef.current
    const targetX = gyro ? gyro.x : pointerRef.current.y * 0.3
    const targetY = gyro ? gyro.y : pointerRef.current.x * 0.5
    // Critically-damped lerp — small step every frame so the splat
    // glides toward the target rather than snapping. Frame-rate
    // independent via 1 - exp(-k * dt).
    const k = 3.2
    const a = 1 - Math.exp(-k * Math.min(delta, 0.1))
    splatRef.current.rotation.x += (targetX - splatRef.current.rotation.x) * a
    splatRef.current.rotation.y += (targetY - splatRef.current.rotation.y) * a
  })

  if (!isClient) return null

  if (dark) {
    // Dark mode: a foreground field of bright white stars, a deeper
    // colour-saturated star layer further out, and a procedural Spark
    // nebula behind both. Stars sit in front of the nebula at +z so
    // they aren't fully obscured by dense splats.
    return (
      <>
        <SparkRenderer />
        <group position={[0, 0, 4]}>
          <Stars
            radius={80}
            depth={40}
            count={9000}
            factor={6}
            saturation={0}
            fade
            speed={0.8}
          />
        </group>
        <Stars
          radius={140}
          depth={60}
          count={4500}
          factor={3.5}
          saturation={1}
          fade
          speed={0.4}
        />
        <group ref={splatRef as React.RefObject<THREE.Group>}>
          <Nebula count={4500} radius={9} position={[0, 0, -6]} spin={0.02} />
        </group>
      </>
    )
  }

  return (
    <>
      <SparkRenderer />
      <group ref={splatRef as React.RefObject<THREE.Group>}>
        <SplatMesh
          url="/flowers_white.sog"
          scale={3}
          rotation={[Math.PI, 0.3 * Math.PI, 0]}
        />
      </group>
    </>
  )
}
