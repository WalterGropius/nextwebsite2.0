'use client'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { SparkRenderer, SplatMesh } from './spark'

type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

function hasTouch() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function Flowers() {
  const splatRef = useRef<THREE.Object3D | null>(null)
  const [isClient, setIsClient] = useState(false)
  const pointerRef = useRef({ x: 0, y: 0 })
  const gyroRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Pointer/mouse parallax — works on every device
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

  // Device orientation — overrides pointer when available
  useEffect(() => {
    if (!isClient || !hasTouch()) return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null && e.gamma == null) return
      gyroRef.current = {
        x: THREE.MathUtils.degToRad((e.beta ?? 60) - 60) * 0.5,
        y: THREE.MathUtils.degToRad(e.gamma ?? 0) * 0.5,
      }
    }

    const attach = () => window.addEventListener('deviceorientation', handleOrientation, true)
    const Ctor = DeviceOrientationEvent as DeviceOrientationEventStatic | undefined

    if (Ctor && typeof Ctor.requestPermission === 'function') {
      // iOS 13+: permission must be requested from a user gesture.
      const requestOnGesture = async () => {
        try {
          const result = await Ctor.requestPermission!()
          if (result === 'granted') attach()
        } catch {
          /* ignore — fall back to pointer parallax */
        }
        window.removeEventListener('touchend', requestOnGesture)
        window.removeEventListener('click', requestOnGesture)
      }
      window.addEventListener('touchend', requestOnGesture, { once: true })
      window.addEventListener('click', requestOnGesture, { once: true })
      return () => {
        window.removeEventListener('touchend', requestOnGesture)
        window.removeEventListener('click', requestOnGesture)
        window.removeEventListener('deviceorientation', handleOrientation, true)
      }
    }

    attach()
    return () => window.removeEventListener('deviceorientation', handleOrientation, true)
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
          rotation={[Math.PI, -0.7 * Math.PI, 0]}
        />
      </group>
    </>
  )
}
