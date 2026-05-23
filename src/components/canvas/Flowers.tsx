'use client'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
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

export function Flowers() {
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
      // Android/desktops with motion sensors fire the event without prompting
      attach()
      return detach
    }

    // iOS 13+: the explicit prompt component owns the gesture-bound
    // requestPermission call. We only attach the listener once it tells
    // us permission has been granted.
    const onGranted = () => attach()
    window.addEventListener('motion-permission-granted', onGranted)

    return () => {
      window.removeEventListener('motion-permission-granted', onGranted)
      detach()
    }
  }, [isClient])

  useFrame(() => {
    if (!splatRef.current) return
    const gyro = gyroRef.current
    if (gyro) {
      splatRef.current.rotation.x = gyro.x
      splatRef.current.rotation.y = gyro.y
    } else {
      splatRef.current.rotation.x = pointerRef.current.y * 0.3
      splatRef.current.rotation.y = pointerRef.current.x * 0.5
    }
  })

  if (!isClient) return null

  return (
    <>
      <SparkRenderer />
      <group ref={splatRef}>
        <SplatMesh
          url="/flowers_white.sog"
          scale={3}
          rotation={[Math.PI, 0.3 * Math.PI, 0]}
        />
      </group>
    </>
  )
}
