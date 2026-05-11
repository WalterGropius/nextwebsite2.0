"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"

const roles = [
  { text: "Creative Technologist", color: "var(--cobalt-blue)" },
  { text: "CTO & Builder", color: "var(--vermilion)" },
  { text: "VR/AR Pioneer", color: "var(--fern-green)" },
  { text: "AI Architect", color: "var(--lion)" },
  { text: "Visual Artist", color: "var(--salmon-pink)" },
]

export function Hero() {
  const [currentRole, setCurrentRole] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center"
        style={{
          transform: `translate3d(0, ${scrollY * -0.08}px, 0)`,
          opacity: Math.max(0, 1 - scrollY / 600),
        }}
      >
        {/* Status badge */}
        <div
          className={`text-aura text-aura-sm inline-flex items-center gap-2 px-4 py-2 ${
            isVisible ? "animate-fade-in-down" : "opacity-0"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
          </span>
          <span className="text-[0.6rem] font-medium" style={{ color: "var(--text-primary)" }}>
            Available for ambitious projects
          </span>
        </div>

        {/* Role rotator */}
        <div
          className={`text-aura inline-block h-6 overflow-hidden px-4 ${
            isVisible ? "animate-fade-in-up animation-delay-300" : "opacity-0"
          }`}
        >
          <div
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translateY(-${currentRole * 1.5}rem)` }}
          >
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="flex h-6 items-center justify-center text-[0.65rem] uppercase tracking-[0.18em] sm:text-xs"
                style={{ color: role.color }}
              >
                {role.text}
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p
          className={`text-aura mx-auto max-w-2xl px-3 text-[0.7rem] sm:text-xs ${
            isVisible ? "animate-fade-in-up animation-delay-500" : "opacity-0"
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

        {/* CTA buttons */}
        <div
          className={`flex flex-col items-center justify-center gap-3 sm:flex-row ${
            isVisible ? "animate-fade-in-up animation-delay-700" : "opacity-0"
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
