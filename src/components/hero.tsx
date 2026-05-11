"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        ticking = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      {/* Tagline pinned just under the nav */}
      <div
        className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-24 sm:pt-28 text-center"
        style={{
          transform: `translate3d(0, ${scrollY * -0.08}px, 0)`,
          opacity: Math.max(0, 1 - scrollY / 600),
        }}
      >
        <p
          className={`text-aura mx-auto max-w-2xl px-3 text-[0.7rem] sm:text-xs ${
            isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
          style={{
            lineHeight: 1.5,
            color: "var(--text-primary)",
          }}
        >
          Bridging{" "}
          <em className="not-italic font-semibold" style={{ color: "var(--vermilion)" }}>
            creative vision
          </em>{" "}
          and{" "}
          <em className="not-italic font-semibold" style={{ color: "var(--cobalt-blue)" }}>
            technical execution
          </em>{" "}
          to build what others say is impossible.
        </p>
      </div>

      {/* CTA buttons centered in remaining hero space */}
      <div
        className="relative z-10 flex flex-1 items-center justify-center px-6"
        style={{
          transform: `translate3d(0, ${scrollY * -0.08}px, 0)`,
          opacity: Math.max(0, 1 - scrollY / 600),
        }}
      >
        <div
          className={`flex flex-row items-center justify-center gap-3 ${
            isVisible ? "animate-fade-in-up animation-delay-300" : "opacity-0"
          }`}
        >
          <a href="/portfolio-s" className="btn-primary group text-[0.65rem]">
            <Sparkles size={12} className="transition-transform group-hover:rotate-12" />
            Explore My Work
          </a>
          <a href="mailto:zenbauhaus@gmail.com" className="btn-secondary text-[0.65rem]">
            Let&apos;s Collaborate
          </a>
        </div>
      </div>
    </div>
  )
}
