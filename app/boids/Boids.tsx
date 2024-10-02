import { useRef, useMemo, useCallback } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { Vector3, Mesh, Quaternion, Color, MeshBasicMaterial } from 'three'
import { useControls } from 'leva'
import { Cone } from '@react-three/drei'
import { EffectComposer } from '@react-three/postprocessing'
import { Bloom } from '@react-three/postprocessing'

extend({ EffectComposer, Bloom })

interface Boid {
  position: Vector3
  velocity: Vector3
  speed: number
}

const Boid = ({ position, velocity, speed, minSpeed, maxSpeed }) => {
  const mesh = useRef<Mesh>(null)

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.copy(position)

      // Calculate rotation based on velocity vector
      const direction = velocity.clone().normalize()
      const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction)
      mesh.current.setRotationFromQuaternion(quaternion)

      // Calculate color based on speed
      const t = (speed - minSpeed) / (maxSpeed - minSpeed)
      const color = new Color().setHSL(t * 0.3, 1, 0.5) // Vary color from red (slow) to green (fast)
      ;(mesh.current.material as MeshBasicMaterial).color = color
    }
  })

  return (
    <Cone ref={mesh} args={[0.1, 0.3]}>
      <meshBasicMaterial />
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
    fieldOfView,
    bloomIntensity,
    bloomThreshold,
    bloomRadius,
  } = useControls({
    count: { value: 200, min: 1, max: 500, step: 1 },
    speed: { value: 0.01, min: 0.01, max: 0.1, step: 0.01 },
    separationDistance: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    alignmentDistance: { value: 4.4, min: 0.1, max: 5, step: 0.1 },
    cohesionDistance: { value: 1.0, min: 0.1, max: 5, step: 0.1 },
    separationForce: { value: 0.05, min: 0, max: 0.1, step: 0.01 },
    alignmentForce: { value: 0.05, min: 0, max: 0.1, step: 0.01 },
    cohesionForce: { value: 0.01, min: 0, max: 0.1, step: 0.01 },
    boundaryForce: { value: 0.03, min: 0, max: 0.1, step: 0.01 },
    boundaryRadius: { value: 15, min: 10, max: 50, step: 1 },
    fieldOfView: { value: 37, min: 10, max: 180, step: 1 },
    bloomIntensity: { value: 1, min: 0, max: 2, step: 0.1 },
    bloomThreshold: { value: 0.1, min: 0, max: 1, step: 0.1 },
    bloomRadius: { value: 0.5, min: 0, max: 1, step: 0.1 },
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
          const angle = boid.velocity.angleTo(directionToOtherBoid)
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

  const minSpeed = speed * 0.5
  const maxSpeed = speed * 1.5

  return (
    <>
      <group>
        {boids.map((boid, index) => (
          <Boid
            key={index}
            position={boid.position}
            velocity={boid.velocity}
            speed={boid.speed}
            minSpeed={minSpeed}
            maxSpeed={maxSpeed}
          />
        ))}
      </group>
      <EffectComposer>
        <Bloom intensity={bloomIntensity} luminanceThreshold={bloomThreshold} luminanceSmoothing={bloomRadius} />
      </EffectComposer>
    </>
  )
}

export default Boids
