'use client'
import { PresentationControls, Float, Splat } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'

export default function Flowers() {
  const splatRef = useRef()
  const [hasError, setHasError] = useState(false)
  const [isClient, setIsClient] = useState(false)

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
        enablePan={false}
        enableZoom={false}
      >
        <Float
          speed={0.5}
          rotationIntensity={0.1}
          floatIntensity={0.1}
        >
          {!hasError ? (
            <>
              {/* Temporary: Test with simple geometry first */}
              <mesh ref={splatRef} scale={2}>
                <icosahedronGeometry args={[1, 2]} />
                <meshStandardMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.8}
                  roughness={0.1}
                  metalness={0.2}
                  wireframe={false}
                />
              </mesh>
              {/* Uncomment below and comment above to test splat loading */}
              {/*
              <Splat
                ref={splatRef}
                scale={3}
                rotation={[0, -0.7 * Math.PI, 0]}
                src="/flowers_white.splat"
                alphaTest={0.1}
                transparent
                onError={(error) => {
                  console.error('Splat loading error details:', error)
                  console.error('Failed to load flowers.splat, using fallback')
                  setHasError(true)
                }}
                onLoad={() => {
                  console.log('Splat loaded successfully!')
                }}
              />
              */}
            </>
          ) : (
            // Enhanced fallback: More visually appealing geometric shape
            <group ref={splatRef} scale={2}>
              <mesh>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.6}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
              <mesh position={[0.5, 0.5, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial
                  color="#f0f0f0"
                  transparent
                  opacity={0.4}
                />
              </mesh>
              <mesh position={[-0.3, -0.2, 0.4]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial
                  color="#e0e0e0"
                  transparent
                  opacity={0.5}
                />
              </mesh>
            </group>
          )}
        </Float>
      </PresentationControls>
    </>
  )
}
