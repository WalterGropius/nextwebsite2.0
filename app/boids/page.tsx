'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import Boids from './Boids'
const Scene = () => {
  const { backgroundColor } = useControls({
    backgroundColor: '#000000',
  })

  return (
    <Canvas>
      <color attach='background' args={[backgroundColor]} />
      <OrbitControls />
      <Boids />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  )
}

export default function BoidsPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Scene />
    </div>
  )
}
