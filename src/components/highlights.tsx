"use client"

import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { useT } from "@/lib/i18n/provider"

export function Highlights() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const t = useT()

  const credits = Array.from({ length: 7 }, (_, i) => ({
    role: t(`highlights.${i}.role`),
    at: t(`highlights.${i}.at`),
  }))

  // Each row gets its own scroll-progress-derived y so the list reads
  // like a flickbook — odd rows drag, even rows race past.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  })
  const stickyY = useTransform(smooth, [0, 1], [-20, 90])
  const stickyRot = useTransform(smooth, [0, 0.5, 1], [-1.5, 0, 1.5])

  return (
    <section className="relative py-20 sm:py-32" ref={ref}>
      <div className="section-container">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <motion.div
            className="md:sticky md:top-32 md:self-start"
            style={{ y: stickyY, rotate: stickyRot, transformOrigin: "0 50%" }}
          >
            <h2
              className="text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              <MotionText text={t("highlights.title.0")} split="word" from="up" />
              <br />
              <MotionText
                text={t("highlights.title.1")}
                split="word"
                from="up"
                delay={0.2}
                className="ink-underline"
              />
            </h2>
          </motion.div>

          <ul className="flex flex-col" style={{ color: "var(--ink)" }}>
            <div className="opacity-60">
              <InkLine fade={false} thickness={1.1} />
            </div>
            {credits.map((c, i) => {
              // alternating drag/race + tiny rotational sway so rows
              // don't all glide identically. Amplitude stays under a
              // row's height so neighbours never fully overlap at the
              // section's edges (seven rows now, was six).
              const dir = i % 2 === 0 ? -1 : 1
              const amp = 26 + (i % 3) * 12
              return (
                <HighlightRow
                  key={i}
                  c={c}
                  i={i}
                  inView={inView}
                  smooth={smooth}
                  dir={dir}
                  amp={amp}
                />
              )
            })}
            <div className="opacity-60">
              <InkLine fade={false} thickness={1.1} />
            </div>
          </ul>
        </div>
      </div>
    </section>
  )
}

import type { MotionValue } from "motion/react"

function HighlightRow({
  c,
  i,
  inView,
  smooth,
  dir,
  amp,
}: {
  c: { role: string; at: string }
  i: number
  inView: boolean
  smooth: MotionValue<number>
  dir: number
  amp: number
}) {
  const rowY = useTransform(smooth, [0, 1], [amp * dir, -amp * dir])
  return (
    <motion.li
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 16, filter: "blur(8px)" }
      }
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 24,
        delay: 0.1 + i * 0.09,
      }}
      style={{ y: rowY }}
      className="flex flex-col gap-0.5 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
    >
      <span
        className="text-2xl sm:text-3xl"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          lineHeight: 1,
        }}
      >
        {c.role}
      </span>
      <span
        className="text-sm sm:text-base"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        {c.at}
      </span>
    </motion.li>
  )
}
