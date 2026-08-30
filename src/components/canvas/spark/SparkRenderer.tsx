'use client'
import { useThree } from '@react-three/fiber'
import { SparkRenderer as SparkRendererClass } from '@sparkjsdev/spark'
import { useEffect, useRef } from 'react'

export function SparkRenderer({
  lodSplatScale = 1,
}: {
  // Spark 2.x LoD budget dial: scales the target splat count for
  // LoD-enabled meshes (1 = platform default, 0.5 = half the splats).
  // Driven at runtime by the hero's PerformanceMonitor so the splat
  // itself — not just canvas resolution — sheds detail under load.
  lodSplatScale?: number
}) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const sparkRef = useRef<SparkRendererClass | null>(null)

  useEffect(() => {
    // Create SparkRenderer and add to scene
    const spark = new SparkRendererClass({ renderer: gl })
    sparkRef.current = spark
    // eslint-disable-next-line
    const s = scene as any
    s.add(spark)

    return () => {
      s.remove(spark)
      spark.dispose?.()
      sparkRef.current = null
    }
  }, [gl, scene])

  useEffect(() => {
    const spark = sparkRef.current
    if (!spark) return
    // Instance option — Spark reads it each update pass.
    // eslint-disable-next-line
    ;(spark as any).lodSplatScale = lodSplatScale
  }, [lodSplatScale])

  return null
}
