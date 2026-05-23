"use client"

import { motion, useInView, type Variants } from "motion/react"
import { useRef } from "react"

type SplitMode = "char" | "word" | "line"

interface MotionTextProps {
  text: string
  as?: keyof React.JSX.IntrinsicElements
  split?: SplitMode
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  duration?: number
  once?: boolean
  amount?: number
  from?: "up" | "down" | "blur" | "scale"
}

const buildVariants = (
  from: NonNullable<MotionTextProps["from"]>,
  duration: number
): Variants => {
  const transition = {
    type: "spring" as const,
    stiffness: 220,
    damping: 22,
    mass: 0.6,
    duration,
  }
  switch (from) {
    case "down":
      return {
        hidden: { opacity: 0, y: "-0.6em", filter: "blur(8px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition },
      }
    case "blur":
      return {
        hidden: { opacity: 0, filter: "blur(14px)", y: "0.2em" },
        visible: { opacity: 1, filter: "blur(0px)", y: 0, transition },
      }
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.6, y: "0.4em", filter: "blur(6px)" },
        visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition },
      }
    case "up":
    default:
      return {
        hidden: { opacity: 0, y: "0.9em", filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition },
      }
  }
}

export function MotionText({
  text,
  as = "span",
  split = "word",
  className = "",
  style,
  delay = 0,
  stagger = 0.04,
  duration = 0.9,
  once = true,
  amount = 0.4,
  from = "up",
}: MotionTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once, amount })

  const parts =
    split === "char"
      ? Array.from(text)
      : split === "line"
      ? text.split("\n")
      : text.split(/(\s+)/)

  const itemVariants = buildVariants(from, duration)

  const Container = motion[as as keyof typeof motion] as typeof motion.span

  return (
    <Container
      ref={ref as never}
      className={className}
      style={{ display: "inline-block", ...style }}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      variants={{ hidden: {}, visible: {} }}
      aria-label={text}
    >
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}> </span>
        return (
          <motion.span
            key={i}
            variants={itemVariants}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              willChange: "transform, filter, opacity",
            }}
            aria-hidden
          >
            {part}
          </motion.span>
        )
      })}
    </Container>
  )
}
