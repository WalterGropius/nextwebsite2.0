"use client"

import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { useT } from "@/lib/i18n/provider"

// Tool / brand names stay English — translating them would just break the
// signal. Only the group label and the section heading are translated.
const groups = [
  {
    labelKey: "arsenal.group.0",
    items: [
      "blender",
      "unreal engine",
      "houdini",
      "three.js · r3f",
      "webgl · webgpu",
      "unity",
      "substance",
      "webxr",
      "virtual production",
      "glsl",
    ],
  },
  {
    labelKey: "arsenal.group.1",
    items: [
      "typescript",
      "react · next.js",
      "node.js",
      "python",
      "postgres",
      "docker",
      "c++ · c#",
      "graphql",
      "aws · gcp",
      "systems design",
    ],
  },
  {
    labelKey: "arsenal.group.2",
    items: [
      "llms · prompting",
      "agentic systems",
      "rag",
      "computer vision",
      "pytorch",
      "neural nets",
      "nlp",
      "yolo",
      "langchain",
      "embeddings",
    ],
  },
]

// Per-column motion profile. Centre column drags (negative y), outers
// race past with a tilt — gives the page that "different focal planes
// scrolling at different rates" cinematic feel.
const colSpeeds = [
  { y: 70, rot: -1.2 },
  { y: -50, rot: 0.6 },
  { y: 95, rot: -1.5 },
]

export function Arsenal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const t = useT()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.45,
  })
  const titleY = useTransform(smooth, [0, 1], [70, -40])
  const titleX = useTransform(smooth, [0, 1], [-20, 20])

  return (
    <section id="arsenal" className="relative py-20 sm:py-32" ref={ref}>
      <div className="section-container">
        <motion.h2
          className="mb-14 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            y: titleY,
            x: titleX,
          }}
        >
          <MotionText text={t("arsenal.title.0")} split="word" from="up" />{" "}
          <MotionText
            text={t("arsenal.title.1")}
            split="word"
            from="up"
            delay={0.2}
            className="ink-underline"
          />
        </motion.h2>

        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {groups.map((g, gi) => (
            <ArsenalColumn
              key={g.labelKey}
              g={g}
              gi={gi}
              inView={inView}
              smooth={smooth}
              speed={colSpeeds[gi]}
              label={t(g.labelKey)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ArsenalColumn({
  g,
  gi,
  inView,
  smooth,
  speed,
  label,
}: {
  g: { labelKey: string; items: string[] }
  gi: number
  inView: boolean
  smooth: MotionValue<number>
  speed: { y: number; rot: number }
  label: string
}) {
  const y = useTransform(smooth, [0, 1], [speed.y, -speed.y])
  const r = useTransform(smooth, [0, 0.5, 1], [speed.rot, 0, -speed.rot])
  return (
    <motion.div
      style={{ y, rotate: r, transformOrigin: gi === 1 ? "50% 50%" : "0 50%" }}
      className="flex flex-col"
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="text-[0.7rem] uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          {String(gi + 1).padStart(2, "0")}
        </span>
        <span
          className="text-xl sm:text-2xl"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
          }}
        >
          {label}
        </span>
      </div>
      <div className="mb-5" style={{ color: "var(--ink)" }}>
        <InkLine fade={false} thickness={1} />
      </div>
      <ul className="flex flex-col gap-2">
        {g.items.map((item, ii) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
            animate={
              inView
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: -10, filter: "blur(6px)" }
            }
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 26,
              delay: 0.05 * gi + 0.04 * ii,
            }}
            className="text-base sm:text-lg"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              lineHeight: 1.4,
            }}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
