'use client'
import { PresentationControls, Float, Splat } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect, MutableRefObject } from 'react'
import * as THREE from 'three'

export function Flowers() {
  const splatRef = useRef<THREE.Mesh | THREE.Group | null>(null)
  const [hasError, setHasError] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)

  // Ensure we're client-side before rendering 3D content
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Subtle rotation animation
  useFrame((state) => {
    if (splatRef.current) {
      splatRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  // Don't render anything until we're client-side
  if (!isClient) {
    return null
  }

  return (
    <>
      {/* Optimized lighting setup */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow={false}
      />
      <pointLight position={[-5, -5, -5]} color="#3b82f6" intensity={0.4} />

      {/* Interactive controls with optimized settings */}
      <PresentationControls
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 1, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}

      >
        <Float
          speed={0.5}
          rotationIntensity={0.1}
          floatIntensity={0.1}
        >
          {!hasError ? (
            <>

              {/* Uncomment below and comment above to test splat loading */}

              <Splat
                scale={3}
                rotation={[0, -0.7 * Math.PI, 0]}
                src="../../public/flowers_white.splat"


              />

            </>
          ) : null}
        </Float>
      </PresentationControls>
    </>
  )
}
