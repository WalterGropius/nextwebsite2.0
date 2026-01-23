'use client'
import { useThree } from '@react-three/fiber'
import { SplatMesh as SplatMeshClass } from '@sparkjsdev/spark'
import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'
import * as THREE from 'three'

interface SplatMeshProps {
  url: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  onLoad?: (mesh: SplatMeshClass) => void
}

export const SplatMesh = forwardRef<THREE.Object3D, SplatMeshProps>(
  ({ url, scale = 1, position, rotation, onLoad }, ref) => {
    const groupRef = useRef<THREE.Group>(null!)
    const splatRef = useRef<SplatMeshClass | null>(null)
    const scene = useThree((state) => state.scene)
    
    useImperativeHandle(ref, () => groupRef.current)

    useEffect(() => {
      const splat = new SplatMeshClass({ url })
      splatRef.current = splat

      // Apply transforms
      if (scale) {
        splat.scale.setScalar(scale)
      }
      if (position) {
        splat.position.set(...position)
      }
      if (rotation) {
        splat.rotation.set(...rotation)
      }

      // Add to parent group
      if (groupRef.current) {
        groupRef.current.add(splat as unknown as THREE.Object3D)
      }

      // Call onLoad when initialized
      if (onLoad) {
        splat.initialized.then(() => onLoad(splat))
      }

      return () => {
        const group = groupRef.current
        const splatMesh = splatRef.current
        if (group && splatMesh) {
          group.remove(splatMesh as unknown as THREE.Object3D)
        }
        splat.dispose?.()
      }
    }, [url, scale, position, rotation, onLoad])

    return <group ref={groupRef} />
  }
)

SplatMesh.displayName = 'SplatMesh'
