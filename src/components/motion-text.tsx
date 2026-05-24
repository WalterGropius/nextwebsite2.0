"use client"

import { motion, type Variants } from "motion/react"

type SplitMode = "char" | "word" | "line"

interface MotionTextProps {
  text: string
  as?: keyof React.JSX.IntrinsicElements
  split?: SplitMode
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  once?: boolean
  amount?: number
  from?: "up" | "down" | "blur" | "scale"
}

const itemFor = (from: NonNullable<MotionTextProps["from"]>): Variants => {
  const transition = { type: "spring" as const, stiffness: 220, damping: 22, mass: 0.6 }
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
  once = true,
  amount = 0.3,
  from = "up",
}: MotionTextProps) {
  const parts =
    split === "char"
      ? Array.from(text)
      : split === "line"
      ? text.split("\n")
      : text.split(/(\s+)/)

  const itemVariants = itemFor(from)
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  }

  const Container = motion[as as keyof typeof motion] as typeof motion.span

  return (
    <Container
      className={className}
      style={{ display: "inline-block", ...style }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
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
