import { PresentationControls, Float, Splat } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export default function Flowers() {
  const splatRef = useRef()

  // Subtle rotation animation
  useFrame((state) => {
    if (splatRef.current) {
      splatRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

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
          <Splat
            ref={splatRef}
            scale={3}
            rotation={[0, -0.7 * Math.PI, 0]}
            src="/flowers_white.splat"
            alphaTest={0.1}
            transparent
          />
        </Float>
      </PresentationControls>
    </>
  )
}
