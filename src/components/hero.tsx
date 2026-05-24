"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"
import { ArrowDown } from "lucide-react"

const roles = [
  "creative technologist",
  "vr / ar pioneer",
  "ai architect",
  "visual artist",
  "builder of impossible things",
]

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, -80])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  const [roleIdx, setRoleIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % roles.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6"
    >
      <motion.div
        style={{ y, opacity }}
        className="hero-light-text relative z-10 flex w-full max-w-3xl flex-col items-center text-center"
      >
        {/* Year stamp */}
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mb-10 inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.4em]"
        >
          <span>prague</span>
          <span aria-hidden style={{ opacity: 0.5 }}>·</span>
          <span>2026</span>
        </motion.span>

        {/* Grounded intro — single confident line, big enough to carry the hero */}
        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-[clamp(1.6rem,4vw,2.8rem)]"
          style={{
            fontFamily: "var(--font-display)",
            lineHeight: 1.15,
            letterSpacing: "-0.005em",
          }}
        >
          i build systems, untangle messy problems, and write code.
        </motion.p>

        {/* Rotating role — quiet, slot under the headline */}
        <div
          className="relative mt-7 flex h-[1.6em] items-center overflow-hidden text-[0.95rem] sm:text-base"
          aria-live="polite"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={roleIdx}
              initial={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-110%", opacity: 0, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="inline-block"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.16em",
                opacity: 0.85,
              }}
            >
              {roles[roleIdx]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <a href="mailto:zenbauhaus@gmail.com" className="btn-primary group">
            <span>work with me</span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{ opacity }}
        className="hero-light-text absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[0.6rem] uppercase tracking-[0.35em]"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span>scroll</span>
          <ArrowDown size={12} className="ink-icon" />
        </motion.div>
      </motion.div>
    </div>
  )
}
