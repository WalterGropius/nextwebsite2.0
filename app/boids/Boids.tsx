import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh, Quaternion } from 'three'
import { useControls } from 'leva'
import { Cone } from '@react-three/drei'

interface Boid {
  position: Vector3
  velocity: Vector3
  // Add a field for the boid's forward direction
  forward: Vector3
  speed: number
}

const Boid = ({ position, velocity, color, forward }) => {
  const mesh = useRef<Mesh>(null)

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.copy(position)

      // Calculate rotation based on velocity vector
      const direction = forward.clone().normalize()
      const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction)
      mesh.current.setRotationFromQuaternion(quaternion)
    }
  })

  return (
    <Cone ref={mesh} args={[0.1, 0.3]}>
      <meshStandardMaterial color={color} />
    </Cone>
  )
}

const Boids = () => {
  const {
    count,
    speed,
    separationDistance,
    alignmentDistance,
    cohesionDistance,
    separationForce,
    alignmentForce,
    cohesionForce,
    boundaryForce,
    boundaryRadius,
    boidColor,
    // Add a field for the field of view
    fieldOfView,
  } = useControls({
    count: { value: 200, min: 1, max: 500, step: 1 },
    speed: { value: 0.03, min: 0.01, max: 0.1, step: 0.01 },
    separationDistance: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    alignmentDistance: { value: 2, min: 0.1, max: 5, step: 0.1 },
    cohesionDistance: { value: 1, min: 0.1, max: 5, step: 0.1 },
    separationForce: { value: 0.05, min: 0, max: 0.1, step: 0.01 },
    alignmentForce: { value: 0.05, min: 0, max: 0.1, step: 0.01 },
    cohesionForce: { value: 0.01, min: 0, max: 0.1, step: 0.01 },
    boundaryForce: { value: 0.02, min: 0, max: 0.1, step: 0.01 },
    boundaryRadius: { value: 15, min: 10, max: 50, step: 1 },
    boidColor: { value: '#4a4a4a' },
    fieldOfView: { value: 60, min: 10, max: 180, step: 1 },
  })

  const boids = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * boundaryRadius,
        (Math.random() - 0.5) * boundaryRadius,
        (Math.random() - 0.5) * boundaryRadius,
      ),
      velocity: new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(speed),
      // Initialize the forward direction to the velocity
      forward: new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(speed),
      speed: speed,
    }))
  }, [count, boundaryRadius, speed])

  const applyBoundaryForce = useCallback(
    (boid) => {
      const distanceToCenter = boid.position.length()
      if (distanceToCenter > boundaryRadius) {
        const boundaryForceVector = boid.position.clone().negate().normalize().multiplyScalar(boundaryForce)
        boid.velocity.add(boundaryForceVector)
      }
    },
    [boundaryForce, boundaryRadius],
  )

  const updateBoid = useCallback(
    (boid, index) => {
      const separation = new Vector3()
      const alignment = new Vector3()
      const cohesion = new Vector3()
      let separationCount = 0
      let alignmentCount = 0
      let cohesionCount = 0
      let closestDistance = Infinity
      let closestBoid: Boid | null = null

      // Iterate over other boids
      boids.forEach((otherBoid, j) => {
        if (index !== j) {
          const distance = boid.position.distanceTo(otherBoid.position)

          // Check if the other boid is within the field of view
          const directionToOtherBoid = otherBoid.position.clone().sub(boid.position).normalize()
          const angle = boid.forward.angleTo(directionToOtherBoid)
          if (angle < fieldOfView * (Math.PI / 180)) {
            if (distance < separationDistance) {
              separation.add(boid.position.clone().sub(otherBoid.position).normalize().divideScalar(distance))
              separationCount++
            }

            if (distance < alignmentDistance) {
              alignment.add(otherBoid.velocity)
              alignmentCount++
            }

            if (distance < cohesionDistance) {
              cohesion.add(otherBoid.position)
              cohesionCount++
            }

            if (distance < closestDistance) {
              closestDistance = distance
              closestBoid = otherBoid
            }
          }
        }
      })

      if (separationCount > 0) {
        separation.divideScalar(separationCount).sub(boid.velocity).multiplyScalar(separationForce)
      }

      if (alignmentCount > 0) {
        alignment.divideScalar(alignmentCount).sub(boid.velocity).multiplyScalar(alignmentForce)
      }

      if (cohesionCount > 0) {
        cohesion.divideScalar(cohesionCount).sub(boid.position).normalize().multiplyScalar(cohesionForce)
      }

      if (closestBoid) {
        boid.speed = speed * (closestDistance / separationDistance)
      }

      boid.velocity.add(separation).add(alignment).add(cohesion).normalize().multiplyScalar(boid.speed)
      applyBoundaryForce(boid)
      boid.position.add(boid.velocity)

      // Update the forward direction based on the velocity
      boid.forward = boid.velocity.clone().normalize()
    },
    [
      boids,
      separationDistance,
      alignmentDistance,
      cohesionDistance,
      separationForce,
      alignmentForce,
      cohesionForce,
      speed,
      applyBoundaryForce,
      fieldOfView,
    ],
  )

  useFrame(() => {
    boids.forEach(updateBoid)
  })

  return (
    <group>
      {boids.map((boid, index) => (
        <Boid key={index} position={boid.position} velocity={boid.velocity} color={boidColor} forward={boid.forward} />
      ))}
    </group>
  )
}

export default Boids
