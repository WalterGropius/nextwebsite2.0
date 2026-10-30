"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { IntroTeaser } from "./intro-teaser"

interface PageLoaderProps {
  children: React.ReactNode
  // Landing only: the first hard load of a session plays the intro teaser
  // instead of the brand curtain.
  intro?: boolean
}

// Overlays only ever cover the first hard load of a JS session — a
// module-scope flag means client-side navigations skip them entirely (no
// flash, no hydration mismatch). The overlay is rendered *before* the
// page in the DOM so a streamed response can never paint the page first.
let firstLoadDone = false

export function PageLoader({ children, intro = false }: PageLoaderProps) {
  const [mode] = useState<"intro" | "curtain" | "none">(() =>
    firstLoadDone ? "none" : intro ? "intro" : "curtain",
  )
  const [isLoading, setIsLoading] = useState(mode === "curtain")

  useEffect(() => {
    firstLoadDone = true
    if (mode !== "curtain") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const t = window.setTimeout(() => setIsLoading(false), reduced ? 0 : 450)
    return () => window.clearTimeout(t)
  }, [mode])

  return (
    <div className="relative">
      {mode === "intro" && <IntroTeaser />}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "var(--surface-dark)" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
              }}
            >
              zenbauhaus
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}
