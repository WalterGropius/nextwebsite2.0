"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface PageLoaderProps {
  children: React.ReactNode
}

export function PageLoader({ children }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 900)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "var(--surface-dark)" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
    </div>
  )
}
