"use client"

import { useRef } from "react"
import Link from "next/link"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { ArrowDown } from "lucide-react"
import { useT } from "@/lib/i18n/provider"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  // Smooth scrollY so per-element parallax lags slightly — the page
  // feels like it's gliding through hero rather than snapping.
  const smoothY = useSpring(scrollY, {
    stiffness: 120,
    damping: 28,
    mass: 0.6,
  })
  const headlineY = useTransform(smoothY, [0, 800], [0, -160])
  const ctaY = useTransform(smoothY, [0, 800], [0, -40])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const t = useT()

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-6 pt-24 sm:pt-28"
    >
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center"
      >
        <motion.h2
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            y: headlineY,
          }}
        >
          {t("hero.headline.i")} <strong>{t("hero.headline.build")}</strong>{" "}
          {t("hero.headline.systems")}{" "}
          <span className="humph">{t("hero.headline.untangle")}</span>{" "}
          <em>{t("hero.headline.messy")}</em> {t("hero.headline.problems")}{" "}
          <strong>{t("hero.headline.writeCode")}</strong>
          {t("hero.headline.dot")}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ y: ctaY }}
        >
          {/* Order: works → cv → contact. The two secondaries sit on
              a white surface so they read as material chips next to
              the ink-filled primary on the right. */}
          <Link
            href="/portfolio-s"
            className="btn-secondary"
            style={{ background: "var(--surface-elevated)" }}
          >
            <span>{t("hero.cta.works")}</span>
          </Link>
          <Link
            href="/cv"
            className="btn-secondary"
            style={{ background: "var(--surface-elevated)" }}
          >
            <span>{t("hero.cta.info")}</span>
          </Link>
          <a href="#contact" className="btn-primary group">
            <span>{t("hero.cta")}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              style={{ filter: "url(#ink-wobble)" }}
            >
              →
            </span>
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[0.7rem] uppercase tracking-[0.35em]"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
          style={{ color: "var(--ink)", opacity: 0.6 }}
        >
          <span>{t("hero.scroll")}</span>
          <ArrowDown size={12} className="ink-icon" />
        </motion.div>
      </motion.div>
    </div>
  )
}
