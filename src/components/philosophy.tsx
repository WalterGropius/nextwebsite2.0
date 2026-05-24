"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"

const pillars = [
  {
    n: "01",
    title: "pragmatism over purity",
    body: "the best code ships, scales, and the next person can read it. right tool for the job — typescript, c++, python, doesn't matter.",
  },
  {
    n: "02",
    title: "the black box protocol",
    body: "i'm drawn to systems i don't understand yet. break them down to parts, find the edges, rebuild. fastest way to learn any domain.",
  },
  {
    n: "03",
    title: "agentic execution",
    body: "point me at a fuzzy, structurally hard problem and walk away. high-ambiguity is where i'm most useful.",
  },
]

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-16 sm:py-24" ref={ref}>
      <div className="section-container">
        <h2
          className="mb-12 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          <MotionText text="how i" split="word" from="up" />{" "}
          <MotionText
            text="build"
            split="word"
            from="up"
            delay={0.2}
            className="ink-underline"
          />
        </h2>

        <div className="grid gap-12 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={
                inView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 30, filter: "blur(10px)" }
              }
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 22,
                delay: 0.15 + i * 0.12,
              }}
              className="flex flex-col gap-4"
            >
              <div
                className="flex items-baseline gap-3 text-sm uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                <span>{p.n}</span>
                <div className="flex-1" style={{ color: "var(--ink)" }}>
                  <InkLine fade={false} thickness={1} />
                </div>
              </div>
              <h3
                className="text-3xl sm:text-4xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                  lineHeight: 1,
                }}
              >
                {p.title}
              </h3>
              <p
                className="text-base sm:text-lg"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                  lineHeight: 1.55,
                }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
