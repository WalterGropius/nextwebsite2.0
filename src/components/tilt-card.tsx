"use client"

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react"
import { useCallback, useEffect, useRef, type ReactNode } from "react"

type TiltCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode
  // Max tilt in degrees at the corners.
  max?: number
  // 1 = exact, lower values dampen the response.
  intensity?: number
  // Perspective in pixels — smaller = stronger 3d feel.
  perspective?: number
  // Lift on hover, in pixels.
  lift?: number
}

// Gentle cursor-driven 3d orbit. The card rotates around its centre
// based on where the cursor is inside it, springs back to flat when
// the cursor leaves. Pointer-fine devices only — touch users skip
// the effect to keep scroll buttery.
export function TiltCard({
  children,
  max = 10,
  intensity = 1,
  perspective = 900,
  lift = 6,
  style,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // -1..1 across the card surface
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const z = useMotionValue(0) // lift activation, 0..1

  const springConf = { stiffness: 180, damping: 22, mass: 0.4 }
  const sx = useSpring(x, springConf)
  const sy = useSpring(y, springConf)
  const sz = useSpring(z, springConf)

  const rotX = useTransform(sy, [-1, 1], [max, -max])
  const rotY = useTransform(sx, [-1, 1], [-max, max])
  const translateY = useTransform(sz, [0, 1], [0, -lift])
  // Subtle highlight that drifts toward the cursor — sells the depth.
  const glare = useTransform(
    [sx, sy, sz],
    (latest) => {
      const [gx, gy, gz] = latest as number[]
      const px = (gx * 0.5 + 0.5) * 100
      const py = (gy * 0.5 + 0.5) * 100
      const alpha = 0.45 * gz
      return `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,${alpha}), transparent 55%)`
    },
  )

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      x.set(nx * intensity)
      y.set(ny * intensity)
      z.set(1)
    },
    [intensity, x, y, z],
  )

  const reset = useCallback(() => {
    x.set(0)
    y.set(0)
    z.set(0)
  }, [x, y, z])

  useEffect(() => () => reset(), [reset])

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={{
        position: "relative",
        rotateX: rotX,
        rotateY: rotY,
        y: translateY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      {...rest}
    >
      {children}
      {/* Cursor-driven highlight. Pointer-events:none so the card
          stays interactive. */}
      <motion.span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          background: glare,
          mixBlendMode: "soft-light",
        }}
      />
    </motion.div>
  )
}
