"use client"

import { useRef, useMemo, useState, createContext, useContext } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  Float,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sparkles,
  Stars,
  Environment,
  Icosahedron,
  Octahedron,
  Torus,
  TorusKnot,
  Sphere,
  Ring,
  Box,
  Cone,
  Cylinder,
  Dodecahedron,
  RoundedBox,
  Edges,
  Trail,
  GradientTexture,
} from "@react-three/drei"
import * as THREE from "three"

// Visibility context for pausing animations
const VisibilityContext = createContext(true)
const useIsVisible = () => useContext(VisibilityContext)

// Bauhaus colors - bold and vibrant
const COLORS = {
  red: "#E53935",
  blue: "#1E88E5", 
  yellow: "#FDD835",
  orange: "#FF6D00",
  white: "#FAFAFA",
  black: "#212121",
  pink: "#EC407A",
  cyan: "#00BCD4",
  lime: "#AEEA00",
}

// Mouse parallax hook
function useMouseParallax(intensity = 0.1) {
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const isVisible = useIsVisible()

  useFrame(() => {
    if (!isVisible) return
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05
  })

  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2 * intensity
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2 * intensity
    })
  }

  return smoothMouse
}

function ParallaxGroup({ children, depth = 1 }: { children: React.ReactNode; depth?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useMouseParallax(0.5)
  const isVisible = useIsVisible()

  useFrame(() => {
    if (!groupRef.current || !isVisible) return
    groupRef.current.rotation.y = mouse.current.x * depth * 0.3
    groupRef.current.rotation.x = -mouse.current.y * depth * 0.2
    groupRef.current.position.x = mouse.current.x * depth * 0.5
    groupRef.current.position.y = -mouse.current.y * depth * 0.3
  })

  return <group ref={groupRef}>{children}</group>
}

// Wild spinning torus knot
function CrazyTorusKnot() {
  const ref = useRef<THREE.Mesh>(null)
  const isVisible = useIsVisible()

  useFrame((state) => {
    if (!ref.current || !isVisible) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.3
    ref.current.rotation.y = state.clock.elapsedTime * 0.5
    ref.current.rotation.z = state.clock.elapsedTime * 0.2
  })

  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={2}>
      <TorusKnot ref={ref} args={[0.8, 0.25, 200, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={COLORS.blue}
          roughness={0}
          metalness={1}
          distort={0.4}
          speed={3}
        />
        <Edges scale={1.02} color={COLORS.yellow} />
      </TorusKnot>
    </Float>
  )
}

// Bauhaus primary color boxes
function BauhausBoxes() {
  const boxes = [
    { pos: [-3, 2, -2] as [number, number, number], color: COLORS.red, scale: 0.6 },
    { pos: [3.5, -1, -1] as [number, number, number], color: COLORS.blue, scale: 0.5 },
    { pos: [-2.5, -2, 1] as [number, number, number], color: COLORS.yellow, scale: 0.7 },
    { pos: [2, 2.5, -3] as [number, number, number], color: COLORS.orange, scale: 0.4 },
  ]

  return (
    <>
      {boxes.map((box, i) => (
        <Float key={i} speed={2 + i * 0.5} rotationIntensity={1} floatIntensity={1.5}>
          <RoundedBox args={[box.scale, box.scale, box.scale]} position={box.pos} radius={0.05}>
            <meshStandardMaterial color={box.color} roughness={0.1} metalness={0.8} />
            <Edges color={COLORS.white} />
          </RoundedBox>
        </Float>
      ))}
    </>
  )
}

// Chaotic spheres with trails
function TrailingSphere({ startPos, color, speed }: { 
  startPos: [number, number, number]
  color: string
  speed: number 
}) {
  const ref = useRef<THREE.Mesh>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])
  const isVisible = useIsVisible()

  useFrame((state) => {
    if (!ref.current || !isVisible) return
    const t = state.clock.elapsedTime * speed + offset
    ref.current.position.x = startPos[0] + Math.sin(t * 1.5) * 2
    ref.current.position.y = startPos[1] + Math.cos(t * 2) * 1.5
    ref.current.position.z = startPos[2] + Math.sin(t) * 1
  })

  return (
    <Trail
      width={0.3}
      length={8}
      color={color}
      attenuation={(t) => t * t}
    >
      <Sphere ref={ref} args={[0.1, 16, 16]} position={startPos}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </Sphere>
    </Trail>
  )
}

// Single glass ring component
function GlassRing({ scale, rotation, color, index }: { 
  scale: number
  rotation: [number, number, number]
  color: string
  index: number 
}) {
  const ref = useRef<THREE.Mesh>(null)
  const isVisible = useIsVisible()

  useFrame((state) => {
    if (!ref.current || !isVisible) return
    ref.current.rotation.z = state.clock.elapsedTime * 0.1 * (index + 1) * (index % 2 ? 1 : -1)
  })

  return (
    <Ring ref={ref} args={[scale * 0.8, scale, 64]} rotation={rotation}>
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.2}
        chromaticAberration={0.3}
        color={color}
        roughness={0}
        transmission={0.95}
      />
    </Ring>
  )
}

// Glass rings - Bauhaus style
function GlassRings() {
  const rings = [
    { scale: 2.5, rotation: [Math.PI / 3, 0.2, 0] as [number, number, number], color: COLORS.cyan },
    { scale: 3, rotation: [-Math.PI / 4, 0.5, 0.3] as [number, number, number], color: COLORS.pink },
    { scale: 2, rotation: [Math.PI / 2, 0, Math.PI / 4] as [number, number, number], color: COLORS.yellow },
  ]

  return (
    <>
      {rings.map((ring, i) => (
        <GlassRing key={i} {...ring} index={i} />
      ))}
    </>
  )
}

// Wobbling dodecahedrons
function WobblyDodecahedrons() {
  const positions: [number, number, number][] = [
    [4, 0, -2],
    [-4, 1, -1],
    [0, -3, 2],
  ]

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={1.5} rotationIntensity={2} floatIntensity={1}>
          <Dodecahedron args={[0.5]} position={pos}>
            <MeshWobbleMaterial
              color={i === 0 ? COLORS.lime : i === 1 ? COLORS.orange : COLORS.pink}
              factor={0.6}
              speed={2}
              roughness={0.1}
              metalness={0.8}
            />
          </Dodecahedron>
        </Float>
      ))}
    </>
  )
}

// Floating cones
function FloatingCones() {
  const cones = [
    { pos: [2, 3, -1] as [number, number, number], color: COLORS.red, rot: [0, 0, Math.PI] as [number, number, number] },
    { pos: [-3, -2, 0] as [number, number, number], color: COLORS.yellow, rot: [0, 0, 0] as [number, number, number] },
    { pos: [3, -2.5, -2] as [number, number, number], color: COLORS.cyan, rot: [Math.PI / 4, 0, 0] as [number, number, number] },
  ]

  return (
    <>
      {cones.map((cone, i) => (
        <Float key={i} speed={2.5} rotationIntensity={1.5} floatIntensity={2}>
          <Cone args={[0.3, 0.6, 4]} position={cone.pos} rotation={cone.rot}>
            <meshStandardMaterial color={cone.color} roughness={0.2} metalness={0.9} flatShading />
          </Cone>
        </Float>
      ))}
    </>
  )
}

// Single spinning cylinder
function SpinningCylinder({ pos, color, index }: { 
  pos: [number, number, number]
  color: string
  index: number 
}) {
  const ref = useRef<THREE.Mesh>(null)
  const isVisible = useIsVisible()

  useFrame((state) => {
    if (!ref.current || !isVisible) return
    ref.current.rotation.x = state.clock.elapsedTime * (index % 2 ? 0.5 : -0.3)
    ref.current.rotation.z = state.clock.elapsedTime * (index % 2 ? -0.3 : 0.5)
  })

  return (
    <Float speed={2} floatIntensity={1}>
      <Cylinder ref={ref} args={[0.15, 0.15, 1, 8]} position={pos}>
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
        <Edges color={COLORS.white} />
      </Cylinder>
    </Float>
  )
}

// Spinning cylinders
function SpinningCylinders() {
  const cylinders = [
    { pos: [-2, 1.5, 1] as [number, number, number], color: COLORS.blue },
    { pos: [3, 1, 1] as [number, number, number], color: COLORS.red },
  ]

  return (
    <>
      {cylinders.map((cyl, i) => (
        <SpinningCylinder key={i} {...cyl} index={i} />
      ))}
    </>
  )
}

// Floating icosahedrons with transmission
function GlassIcosahedrons() {
  const positions: [number, number, number][] = [
    [-1.5, 2, -1],
    [1.5, -1.5, 1],
    [-2, -1, -2],
    [2.5, 2, 0],
  ]
  const colors = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.pink]

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={1} floatIntensity={1.5}>
          <Icosahedron args={[0.35, 0]} position={pos}>
            <MeshTransmissionMaterial
              backside
              samples={6}
              thickness={0.5}
              chromaticAberration={0.5}
              anisotropy={0.5}
              distortion={0.3}
              distortionScale={0.3}
              color={colors[i]}
              roughness={0.05}
            />
          </Icosahedron>
        </Float>
      ))}
    </>
  )
}

// Single wireframe octahedron
function WireframeOctahedron({ pos, scale, color, index }: {
  pos: [number, number, number]
  scale: number
  color: string
  index: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const isVisible = useIsVisible()

  useFrame((state) => {
    if (!ref.current || !isVisible) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.3 * (index % 2 ? 1 : -1)
    ref.current.rotation.y = state.clock.elapsedTime * 0.4 * (index % 2 ? -1 : 1)
  })

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
      <Octahedron ref={ref} args={[scale]} position={pos}>
        <meshBasicMaterial color={color} wireframe />
      </Octahedron>
    </Float>
  )
}

// Octahedron wireframes
function WireframeOctahedrons() {
  const items = [
    { pos: [0, 3, -2] as [number, number, number], scale: 0.6, color: COLORS.yellow },
    { pos: [-3.5, 0, 0] as [number, number, number], scale: 0.5, color: COLORS.lime },
    { pos: [3, -3, -1] as [number, number, number], scale: 0.7, color: COLORS.orange },
    { pos: [0, -2.5, 2] as [number, number, number], scale: 0.4, color: COLORS.cyan },
  ]

  return (
    <>
      {items.map((item, i) => (
        <WireframeOctahedron key={i} {...item} index={i} />
      ))}
    </>
  )
}

// Gradient sphere
function GradientSphere() {
  const ref = useRef<THREE.Mesh>(null)
  const isVisible = useIsVisible()

  useFrame((state) => {
    if (!ref.current || !isVisible) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.2
  })

  return (
    <Float speed={1} floatIntensity={0.5}>
      <Sphere ref={ref} args={[1.2, 64, 64]} position={[0, 0, -3]}>
        <meshBasicMaterial>
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={[COLORS.blue, COLORS.pink, COLORS.yellow]}
          />
        </meshBasicMaterial>
      </Sphere>
    </Float>
  )
}

export function GeometricScene({ isVisible = true }: { isVisible?: boolean }) {
  return (
    <VisibilityContext.Provider value={isVisible}>
      {/* Bright Bauhaus lighting */}
      <ambientLight intensity={0.6} color={COLORS.white} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color={COLORS.white} />
      <pointLight position={[-5, 3, -3]} intensity={1} color={COLORS.red} />
      <pointLight position={[5, -2, 3]} intensity={0.8} color={COLORS.blue} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color={COLORS.yellow} />

      {/* Environment */}
      <Environment preset="apartment" />

      {/* Background gradient sphere */}
      <GradientSphere />

      {/* Parallax layer - foreground (moves most) */}
      <ParallaxGroup depth={1.5}>
        <CrazyTorusKnot />
        <GlassRings />
      </ParallaxGroup>

      {/* Parallax layer - mid */}
      <ParallaxGroup depth={1}>
        <BauhausBoxes />
        <FloatingCones />
        <SpinningCylinders />
      </ParallaxGroup>

      {/* Parallax layer - back (moves least) */}
      <ParallaxGroup depth={0.5}>
        <WobblyDodecahedrons />
        <GlassIcosahedrons />
        <WireframeOctahedrons />
      </ParallaxGroup>

      {/* Trailing spheres */}
      <TrailingSphere startPos={[-2, 0, 0]} color={COLORS.red} speed={0.8} />
      <TrailingSphere startPos={[2, 1, -1]} color={COLORS.blue} speed={0.6} />
      <TrailingSphere startPos={[0, -1, 1]} color={COLORS.yellow} speed={0.7} />

      {/* Stars and sparkles */}
      <Stars radius={50} depth={30} count={1000} factor={3} saturation={1} fade speed={1} />
      
      <Sparkles
        count={100}
        scale={12}
        size={3}
        speed={0.5}
        opacity={0.8}
        color={COLORS.yellow}
      />
      
      <Sparkles
        count={60}
        scale={10}
        size={2}
        speed={0.3}
        opacity={0.6}
        color={COLORS.cyan}
      />

      <Sparkles
        count={40}
        scale={8}
        size={4}
        speed={0.4}
        opacity={0.5}
        color={COLORS.pink}
      />
    </VisibilityContext.Provider>
  )
}
