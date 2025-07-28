"use client"

import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial, OrbitControls, Sphere } from "@react-three/drei"
import * as THREE from "three"

// Simulate the splat file with a beautiful particle system
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null!)
  const { mouse, viewport } = useThree()

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(2000 * 3)

    for (let i = 0; i < 2000; i++) {
      // Create flower-like clusters
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 3 + 1
      const height = (Math.random() - 0.5) * 4

      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = height + Math.sin(radius * 2) * 0.5
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2
    }

    return positions
  }, [])

  useFrame((state) => {
    if (ref.current) {
      // Gentle rotation
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      ref.current.rotation.y += 0.002

      // Mouse interaction
      ref.current.rotation.x += mouse.y * viewport.height * 0.00005
      ref.current.rotation.y += mouse.x * viewport.width * 0.00005
    }
  })

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FFD700"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function GlowingSpheres() {
  const group = useRef<THREE.Group>(null!)
  const state = useThree() // Declare the state variable

  useFrame((stateFrame) => {
    if (group.current) {
      group.current.rotation.y = stateFrame.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={group}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Sphere
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 4,
            Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.5,
            Math.sin((i / 5) * Math.PI * 2) * 4,
          ]}
          args={[0.1, 16, 16]}
        >
          <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
        </Sphere>
      ))}
    </group>
  )
}

export function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00FFFF" />

      <FloatingParticles />
      <GlowingSpheres />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  )
}
