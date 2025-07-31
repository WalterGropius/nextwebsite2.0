'use client'
import { PresentationControls, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import React from 'react'

// Lazy load the Splat component to reduce initial bundle size
const Splat = React.lazy(() => import('@react-three/drei').then(module => ({ default: module.Splat })))

export function FlowersOptimized() {
  const groupRef = useRef<THREE.Group | null>(null)
  const [hasError, setHasError] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Ensure we're client-side before rendering 3D content
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Reduced animation complexity
  useFrame((state) => {
    if (groupRef.current) {
      // Slower, more subtle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
    }
  })

  // Don't render anything until we're client-side
  if (!isClient) {
    return null
  }

  return (
    <>
      {/* Simplified lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow={false}
      />

      {/* Reduced control complexity */}
      <PresentationControls
        rotation={[0, 0.5, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
      >
        <Float
          speed={0.3}
          rotationIntensity={0.05}
          floatIntensity={0.05}
        >
          <group ref={groupRef}>
            {!hasError && (
              <Suspense fallback={null}>
                <Splat
                  scale={2.5}
                  rotation={[0, -0.5 * Math.PI, 0]}
                  src="../../flowers_white.splat"
                />
              </Suspense>
            )}
          </group>
        </Float>
      </PresentationControls>
    </>
  )
} 