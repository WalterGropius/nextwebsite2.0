'use client'
import { useThree, useFrame } from '@react-three/fiber'
import { SparkRenderer as SparkRendererClass } from '@sparkjsdev/spark'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function SparkRenderer() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const sparkRef = useRef<SparkRendererClass | null>(null)

  useEffect(() => {
    // Create SparkRenderer and add to scene
    const spark = new SparkRendererClass({ renderer: gl })
    sparkRef.current = spark
    scene.add(spark as unknown as THREE.Object3D)

    return () => {
      scene.remove(spark as unknown as THREE.Object3D)
      // @ts-expect-error dispose may not exist on SparkRenderer type
      spark.dispose?.()
    }
  }, [gl, scene])

  return null
}
