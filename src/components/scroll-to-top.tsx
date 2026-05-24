"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 500)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <button
      onClick={scrollToTop}
      className={`ink-icons fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{
        background: "var(--surface-dark)",
        color: "var(--ink)",
        border: "1.5px solid var(--ink)",
        filter: "url(#ink-wobble)",
      }}
      aria-label="scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  )
}
