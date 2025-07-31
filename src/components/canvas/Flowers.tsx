'use client'
import { Float, Splat } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

function isMobileDevice() {
  if (typeof window === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}

export function Flowers() {
  const splatRef = useRef<THREE.Group | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0 })

  // Detect client and device type
  useEffect(() => {
    setIsClient(true)
    setIsMobile(isMobileDevice())
  }, [])

  // Gyroscope event for mobile
  useEffect(() => {
    if (!isMobile) return
    const handleOrientation = (e: DeviceOrientationEvent) => {
      gyroRef.current = {
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      }
    }
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [isMobile])

  // Mouse position for desktop
  const mouseRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  // Animate rotation based on input
  useFrame(() => {
    if (!splatRef.current) return
    if (isMobile) {
      // Map device orientation to rotation
      const { beta, gamma } = gyroRef.current
      splatRef.current.rotation.x = THREE.MathUtils.degToRad(beta - 60) * 0.5 // tilt up/down
      splatRef.current.rotation.y = THREE.MathUtils.degToRad(gamma) * 0.5 // tilt left/right
    } else {
      // Map mouse to rotation
      splatRef.current.rotation.x = mouseRef.current.y * 0.3
      splatRef.current.rotation.y = mouseRef.current.x * 0.5
    }
  })

  if (!isClient) return null

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow={false} />
      <pointLight position={[-5, -5, -5]} color="#3b82f6" intensity={0.4} />
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
        {!hasError ? (
          <group ref={splatRef}>
            <Splat
              scale={3}
              rotation={[0, -0.7 * Math.PI, 0]}
              src="../../flowers_white.splat"
            />
          </group>
        ) : null}
      </Float>
    </>
  )
}
