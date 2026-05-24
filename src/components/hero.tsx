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
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-6 pt-24 sm:pt-28"
    >
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center"
      >
        {/* Headline — same treatment as the "some of the work" h2,
            just without the underline. Base heading stroke does the
            handwriting weight; humph / strong / em keep the asides. */}
        <motion.h2
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          i <strong>build</strong> systems, <span className="humph">untangle</span>{" "}
          <em>messy</em> problems, and <strong>write code</strong>.
        </motion.h2>

        {/* Rotating role */}
        <div
          className="relative mt-6 flex h-[1.6em] items-center overflow-hidden text-base sm:text-lg"
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
                color: "var(--ink)",
                letterSpacing: "0.16em",
                opacity: 0.7,
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
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
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

      {/* Scroll cue — pinned to the bottom of the (still full-height) canvas */}
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
          <span>scroll</span>
          <ArrowDown size={12} className="ink-icon" />
        </motion.div>
      </motion.div>
    </div>
  )
}
