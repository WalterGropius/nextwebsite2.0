"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"

const groups = [
  {
    label: "3d · vfx · xr",
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
    label: "engineering",
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
    label: "ai",
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

export function Arsenal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="arsenal" className="relative py-16 sm:py-24" ref={ref}>
      <div className="section-container">
        <h2
          className="mb-12 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          <MotionText text="the" split="word" from="up" />{" "}
          <MotionText
            text="toolkit"
            split="word"
            from="up"
            delay={0.2}
            className="ink-underline"
          />
        </h2>

        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {groups.map((g, gi) => (
            <div key={g.label} className="flex flex-col">
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
                  {g.label}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
