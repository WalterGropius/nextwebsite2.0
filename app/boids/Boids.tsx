import { useRef, useMemo, useCallback } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import {
  Vector3,
  Mesh,
  Quaternion,
  Color,
  MeshBasicMaterial,
  Vector2,
  Sphere,
  Box3,
  CylinderGeometry,
  MeshLambertMaterial,
} from 'three'
import { useControls } from 'leva'
import { Cone, Sphere as DreiSphere } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing'

interface Boid {
  position: Vector3
  velocity: Vector3
  acceleration: Vector3
  maxSpeed: number
  maxForce: number
  size: number
  mass: number
}

interface Obstacle {
  position: Vector3
  radius: number
}

const Boid = ({ position, velocity, size }) => {
  const mesh = useRef<Mesh>(null)

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.copy(position)
      const direction = velocity.clone().normalize()
      const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction)
      mesh.current.setRotationFromQuaternion(quaternion)
      const speed = velocity.length()
      const t = Math.min(speed / 0.1, 1)
      const color = new Color().setHSL(t * 0.3, 1, 0.5) // Add color variation based on speed
      ;(mesh.current.material as MeshBasicMaterial).color = color
    }
  })

  return (
    <Cone ref={mesh} args={[size * 0.1, size * 0.3]}>
      <meshBasicMaterial />
    </Cone>
  )
}

const Obstacle = ({ position, radius }) => {
  return (
    <DreiSphere position={position} args={[radius]}>
      <meshBasicMaterial color='red' transparent opacity={0.5} />
    </DreiSphere>
  )
}

const Boundary = ({ radius }) => {
  return (
    <DreiSphere args={[radius]}>
      <meshBasicMaterial color='white' opacity={0.1} transparent />
    </DreiSphere>
  )
}

const HoleObstacle = ({ position, radius, holeRadius }) => {
  const geometry = new CylinderGeometry(holeRadius, holeRadius, radius * 2, 32)
  geometry.translate(0, radius, 0)
  return (
    <mesh position={position}>
      <meshLambertMaterial color='red' transparent opacity={0.5} />
      <primitive object={geometry} />
    </mesh>
  )
}

const Boids = () => {
  const {
    count,
    maxSpeed,
    maxForce,
    separationDistance,
    alignmentDistance,
    cohesionDistance,
    separationWeight,
    alignmentWeight,
    cohesionWeight,
    boundaryRadius,
    obstacleCount,
    obstacleRadius,
    avoidanceDistance,
    avoidanceWeight,
    wanderDistance,
    wanderWeight,
    holeObstacleCount,
    holeObstacleRadius,
    holeObstacleHoleRadius,
    bloomIntensity,
    bloomThreshold,
    bloomRadius,
    chromaticAberrationOffset,
    vignetteIntensity,
    depthOfFieldFocalLength,
    depthOfFieldBokehScale,
    filmNoiseIntensity,
  } = useControls({
    count: { value: 200, min: 1, max: 500, step: 1 },
    maxSpeed: { value: 0.05, min: 0.01, max: 0.2, step: 0.01 },
    maxForce: { value: 0.01, min: 0.001, max: 0.05, step: 0.001 },
    separationDistance: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    alignmentDistance: { value: 2, min: 0.1, max: 5, step: 0.1 },
    cohesionDistance: { value: 1.5, min: 0.1, max: 5, step: 0.1 },
    separationWeight: { value: 1.5, min: 0, max: 3, step: 0.1 },
    alignmentWeight: { value: 1, min: 0, max: 3, step: 0.1 },
    cohesionWeight: { value: 1, min: 0, max: 3, step: 0.1 },
    boundaryRadius: { value: 15, min: 10, max: 50, step: 1 },
    obstacleCount: { value: 5, min: 0, max: 20, step: 1 },
    obstacleRadius: { value: 1, min: 0.1, max: 5, step: 0.1 },
    avoidanceDistance: { value: 2, min: 0.1, max: 5, step: 0.1 },
    avoidanceWeight: { value: 2, min: 0, max: 5, step: 0.1 },
    wanderDistance: { value: 1, min: 0.1, max: 5, step: 0.1 },
    wanderWeight: { value: 0.5, min: 0, max: 2, step: 0.1 },
    holeObstacleCount: { value: 3, min: 0, max: 10, step: 1 },
    holeObstacleRadius: { value: 2, min: 0.1, max: 5, step: 0.1 },
    holeObstacleHoleRadius: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    bloomIntensity: { value: 1, min: 0, max: 2, step: 0.1 },
    bloomThreshold: { value: 0.1, min: 0, max: 1, step: 0.1 },
    bloomRadius: { value: 0.5, min: 0, max: 1, step: 0.1 },
    chromaticAberrationOffset: { value: 0.005, min: 0, max: 0.02, step: 0.001 },
    vignetteIntensity: { value: 0.5, min: 0, max: 1, step: 0.05 },
    depthOfFieldFocalLength: { value: 5, min: 1, max: 10, step: 1 },
    depthOfFieldBokehScale: { value: 2, min: 0.1, max: 5, step: 0.1 },
    filmNoiseIntensity: { value: 0.1, min: 0, max: 1, step: 0.1 },
  })

  const boids = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * boundaryRadius * 2,
        (Math.random() - 0.5) * boundaryRadius * 2,
        (Math.random() - 0.5) * boundaryRadius * 2,
      ),
      velocity: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize()
        .multiplyScalar(maxSpeed * (0.5 + Math.random() * 0.5)),
      acceleration: new Vector3(),
      maxSpeed,
      maxForce,
      size: Math.random() * 0.5 + 0.75,
      mass: Math.random() * 0.5 + 0.75,
    }))
  }, [count, boundaryRadius, maxSpeed, maxForce])

  const obstacles = useMemo(() => {
    return Array.from({ length: obstacleCount }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * boundaryRadius * 1.5,
        (Math.random() - 0.5) * boundaryRadius * 1.5,
        (Math.random() - 0.5) * boundaryRadius * 1.5,
      ),
      radius: obstacleRadius,
    }))
  }, [obstacleCount, boundaryRadius, obstacleRadius])

  const holeObstacles = useMemo(() => {
    return Array.from({ length: holeObstacleCount }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * boundaryRadius * 1.5,
        (Math.random() - 0.5) * boundaryRadius * 1.5,
        (Math.random() - 0.5) * boundaryRadius * 1.5,
      ),
      radius: holeObstacleRadius,
      holeRadius: holeObstacleHoleRadius,
    }))
  }, [holeObstacleCount, boundaryRadius, holeObstacleRadius, holeObstacleHoleRadius])

  const applyForce = (boid: Boid, force: Vector3) => {
    force.divideScalar(boid.mass)
    boid.acceleration.add(force)
  }

  const seek = (boid: Boid, target: Vector3): Vector3 => {
    const desired = target.clone().sub(boid.position)
    desired.normalize().multiplyScalar(boid.maxSpeed)
    return desired.sub(boid.velocity).clampLength(0, boid.maxForce)
  }

  const separate = (boid: Boid, boids: Boid[]): Vector3 => {
    const steer = new Vector3()
    let count = 0
    for (const other of boids) {
      if (other === boid) continue
      const d = boid.position.distanceTo(other.position)
      if (d > 0 && d < separationDistance) {
        const diff = boid.position.clone().sub(other.position)
        diff.normalize().divideScalar(d)
        steer.add(diff)
        count++
      }
    }
    if (count > 0) {
      steer.divideScalar(count)
    }
    if (steer.lengthSq() > 0) {
      steer.normalize().multiplyScalar(boid.maxSpeed).sub(boid.velocity).clampLength(0, boid.maxForce)
    }
    return steer
  }

  const align = (boid: Boid, boids: Boid[]): Vector3 => {
    const sum = new Vector3()
    let count = 0
    for (const other of boids) {
      if (other === boid) continue
      const d = boid.position.distanceTo(other.position)
      if (d > 0 && d < alignmentDistance) {
        sum.add(other.velocity)
        count++
      }
    }
    if (count > 0) {
      sum.divideScalar(count)
      sum.normalize().multiplyScalar(boid.maxSpeed)
      return sum.sub(boid.velocity).clampLength(0, boid.maxForce)
    }
    return new Vector3()
  }

  const cohesion = (boid: Boid, boids: Boid[]): Vector3 => {
    const sum = new Vector3()
    let count = 0
    for (const other of boids) {
      if (other === boid) continue
      const d = boid.position.distanceTo(other.position)
      if (d > 0 && d < cohesionDistance) {
        sum.add(other.position)
        count++
      }
    }
    if (count > 0) {
      sum.divideScalar(count)
      return seek(boid, sum)
    }
    return new Vector3()
  }

  const avoidBoundary = (boid: Boid): Vector3 => {
    const distance = boid.position.length()
    if (distance > boundaryRadius * 0.9) {
      return seek(boid, new Vector3())
    }
    return new Vector3()
  }

  const avoidObstacles = (boid: Boid, obstacles: Obstacle[]): Vector3 => {
    const steer = new Vector3()
    for (const obstacle of obstacles) {
      const d = boid.position.distanceTo(obstacle.position)
      if (d < avoidanceDistance + obstacle.radius) {
        const diff = boid.position.clone().sub(obstacle.position)
        diff.normalize().divideScalar(d)
        steer.add(diff)
      }
    }
    if (steer.lengthSq() > 0) {
      steer.normalize().multiplyScalar(boid.maxSpeed).sub(boid.velocity).clampLength(0, boid.maxForce)
    }
    return steer
  }

  const wander = (boid: Boid): Vector3 => {
    const wanderTarget = new Vector3(wanderDistance, 0, 0)
    const wanderAngle = boid.velocity.angleTo(new Vector3(1, 0, 0))
    wanderTarget.applyAxisAngle(new Vector3(0, 1, 0), wanderAngle)
    wanderTarget.add(boid.position)
    return seek(boid, wanderTarget)
  }

  const updateBoid = useCallback(
    (boid: Boid) => {
      const separationForce = separate(boid, boids).multiplyScalar(separationWeight)
      const alignmentForce = align(boid, boids).multiplyScalar(alignmentWeight)
      const cohesionForce = cohesion(boid, boids).multiplyScalar(cohesionWeight)
      const boundaryForce = avoidBoundary(boid)
      const obstacleForce = avoidObstacles(boid, obstacles).multiplyScalar(avoidanceWeight)
      const wanderForce = wander(boid).multiplyScalar(wanderWeight)

      applyForce(boid, separationForce)
      applyForce(boid, alignmentForce)
      applyForce(boid, cohesionForce)
      applyForce(boid, boundaryForce)
      applyForce(boid, obstacleForce)
      applyForce(boid, wanderForce)

      boid.velocity.add(boid.acceleration).clampLength(0, boid.maxSpeed)
      boid.position.add(boid.velocity)
      boid.acceleration.multiplyScalar(0)
    },
    [
      boids,
      obstacles,
      separationWeight,
      alignmentWeight,
      cohesionWeight,
      avoidanceWeight,
      boundaryRadius,
      separationDistance,
      alignmentDistance,
      cohesionDistance,
      avoidanceDistance,
      wanderDistance,
      wanderWeight,
    ],
  )

  useFrame(() => {
    boids.forEach(updateBoid)
  })

  return (
    <>
      <group>
        {boids.map((boid, index) => (
          <Boid key={index} position={boid.position} velocity={boid.velocity} size={boid.size} />
        ))}
        {obstacles.map((obstacle, index) => (
          <Obstacle key={index} position={obstacle.position} radius={obstacle.radius} />
        ))}
        {holeObstacles.map((holeObstacle, index) => (
          <HoleObstacle
            key={index}
            position={holeObstacle.position}
            radius={holeObstacle.radius}
            holeRadius={holeObstacle.holeRadius}
          />
        ))}
        <Boundary radius={boundaryRadius} />
      </group>
      <EffectComposer>
        <Bloom intensity={bloomIntensity} luminanceThreshold={bloomThreshold} luminanceSmoothing={bloomRadius} />
        <ChromaticAberration
          offset={new Vector2(chromaticAberrationOffset, chromaticAberrationOffset)}
          radialModulation={false}
          modulationOffset={0.1}
        />
        <Vignette eskil={false} offset={0.1} darkness={vignetteIntensity} />
        <DepthOfField focalLength={depthOfFieldFocalLength} bokehScale={depthOfFieldBokehScale} />
      </EffectComposer>
    </>
  )
}

export default Boids
