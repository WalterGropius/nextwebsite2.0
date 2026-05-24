"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { useT } from "@/lib/i18n/provider"

export function Highlights() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const t = useT()

  const credits = Array.from({ length: 6 }, (_, i) => ({
    role: t(`highlights.${i}.role`),
    at: t(`highlights.${i}.at`),
  }))

  return (
    <section className="relative py-16 sm:py-24" ref={ref}>
      <div className="section-container">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
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
          </div>

          <ul className="flex flex-col" style={{ color: "var(--ink)" }}>
            <div className="opacity-60">
              <InkLine fade={false} thickness={1.1} />
            </div>
            {credits.map((c, i) => (
              <motion.li
                key={i}
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
            ))}
            <div className="opacity-60">
              <InkLine fade={false} thickness={1.1} />
            </div>
          </ul>
        </div>
      </div>
    </section>
  )
}
