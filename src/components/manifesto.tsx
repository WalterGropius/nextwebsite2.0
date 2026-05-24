"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { useT } from "@/lib/i18n/provider"

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const t = useT()

  return (
    <section
      id="manifesto"
      className="relative py-24 sm:py-32"
      ref={ref}
    >
      <div className="section-container">
        <div className="mx-auto max-w-4xl">
          <p
            className="text-[clamp(1.8rem,4.5vw,3.6rem)] leading-[1.05]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            <MotionText text={t("manifesto.line1")} split="word" from="up" />{" "}
            <MotionText
              text={t("manifesto.line2")}
              split="word"
              from="up"
              delay={0.3}
            />{" "}
            <span style={{ color: "var(--text-muted)" }}>
              <MotionText text={t("manifesto.line3")} split="word" from="up" delay={0.6} />
            </span>{" "}
            <MotionText
              text={t("manifesto.line4")}
              split="word"
              from="up"
              delay={0.9}
              className="ink-underline"
            />
          </p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.9, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 max-w-2xl text-lg sm:text-xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            <strong>{t("manifesto.body.0")}</strong> {t("manifesto.body.1")}{" "}
            <em>{t("manifesto.body.2")}</em>
            {t("manifesto.body.3")}{" "}
            <em>{t("manifesto.body.4")}</em>
            {t("manifesto.body.5")}{" "}
            <span className="humph">{t("manifesto.body.tag")}</span>
          </motion.p>
        </div>
      </div>
    </section>
  )
}
