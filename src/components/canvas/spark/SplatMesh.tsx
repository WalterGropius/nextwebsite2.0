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
  // Spark 2.x: build a LoD pyramid on load so SparkRenderer can render
  // a downsampled set when the budget (lodSplatScale) calls for it.
  lod?: boolean
  onLoad?: (mesh: SplatMeshClass) => void
}

export const SplatMesh = forwardRef<THREE.Object3D, SplatMeshProps>(
  ({ url, scale = 1, position, rotation, lod = false, onLoad }, ref) => {
    const groupRef = useRef<THREE.Group>(null!)
    const splatRef = useRef<SplatMeshClass | null>(null)
    const onLoadRef = useRef(onLoad)
    useThree((state) => state.scene)

    // eslint-disable-next-line
    useImperativeHandle(ref, () => groupRef.current as any)

    // Keep latest onLoad without triggering effect re-runs
    useEffect(() => {
      onLoadRef.current = onLoad
    }, [onLoad])

    // Create the splat once per URL change. Transforms are applied imperatively
    // below so prop-reference churn (e.g. parent re-renders) doesn't dispose
    // and reload the multi-MB asset.
    useEffect(() => {
      const splat = new SplatMeshClass({ url, lod })
      splatRef.current = splat
      // eslint-disable-next-line
      const group = groupRef.current as any
      group?.add(splat)
      splat.initialized.then(() => onLoadRef.current?.(splat))

      return () => {
        group?.remove(splat)
        splat.dispose?.()
        splatRef.current = null
      }
    }, [url, lod])

    // Apply transforms whenever the value (not the array reference) changes
    const sx = scale
    const px = position?.[0] ?? 0
    const py = position?.[1] ?? 0
    const pz = position?.[2] ?? 0
    const rx = rotation?.[0] ?? 0
    const ry = rotation?.[1] ?? 0
    const rz = rotation?.[2] ?? 0

    useEffect(() => {
      const splat = splatRef.current
      if (!splat) return
      splat.scale.setScalar(sx)
      splat.position.set(px, py, pz)
      splat.rotation.set(rx, ry, rz)
    }, [sx, px, py, pz, rx, ry, rz])

    return <group ref={groupRef} />
  }
)

SplatMesh.displayName = 'SplatMesh'
