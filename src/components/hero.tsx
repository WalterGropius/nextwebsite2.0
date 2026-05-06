"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, Sparkles } from "lucide-react"

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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const scrollToContent = () => {
    const nextSection = document.getElementById("manifesto")
    nextSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Hero copy frame — backdrop-blurs the splat behind for legibility */}
      <div
        className={`hero-frame relative z-10 mx-4 max-w-4xl px-6 py-10 sm:px-10 sm:py-14 ${
          isVisible ? "animate-reveal-blur" : "opacity-0"
        }`}
      >
        {/* Status badge */}
        <div
          className={`mb-5 inline-flex items-center gap-2 border px-3 py-1 ${
            isVisible ? "animate-fade-in-down" : "opacity-0"
          }`}
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border-strong)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
            Available for ambitious projects
          </span>
        </div>

        {/* Main heading */}
        <h1
          className={`mb-3 text-6xl leading-[0.9] sm:text-7xl md:text-8xl lg:text-[9rem] lowercase text-center ${
            isVisible ? "animate-mask-reveal" : ""
          }`}
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          zenbauhaus
        </h1>

        {/* Role rotator */}
        <div
          className={`mb-5 h-12 overflow-hidden text-center ${
            isVisible ? "animate-fade-in-up animation-delay-300" : "opacity-0"
          }`}
        >
          <div
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translateY(-${currentRole * 3}rem)` }}
          >
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="flex h-12 items-center justify-center text-xl uppercase tracking-[0.18em] sm:text-2xl"
                style={{ color: role.color }}
              >
                {role.text}
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p
          className={`mx-auto mb-7 max-w-2xl text-center text-base sm:text-lg ${
            isVisible ? "animate-fade-in-up animation-delay-500" : "opacity-0"
          }`}
          style={{
            lineHeight: 1.5,
            color: "var(--text-primary)",
          }}
        >
          Bridging <em className="not-italic font-semibold" style={{ color: "var(--vermilion)" }}>creative vision</em>
          {" "}and{" "}
          <em className="not-italic font-semibold" style={{ color: "var(--cobalt-blue)" }}>technical execution</em>
          {" "}to build what others say is impossible.
        </p>

        {/* CTA buttons */}
        <div
          className={`flex flex-col items-center justify-center gap-3 sm:flex-row ${
            isVisible ? "animate-fade-in-up animation-delay-700" : "opacity-0"
          }`}
        >
          <a href="/portfolio-s" className="btn-primary group">
            <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
            Explore My Work
          </a>
          <a href="mailto:zenbauhaus@gmail.com" className="btn-secondary">
            Let&apos;s Collaborate
          </a>
        </div>

        {/* Quick stats */}
        <div
          className={`mt-10 grid grid-cols-3 gap-4 ${
            isVisible ? "animate-fade-in-up animation-delay-900" : "opacity-0"
          }`}
        >
          {[
            { value: "10+", label: "Years Creating" },
            { value: "VR/AI", label: "Specialization" },
            { value: "CTO", label: "Current Role" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="border-t pt-3 text-center"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <div
                className="text-xl uppercase sm:text-2xl"
                style={{
                  color: "var(--cobalt-blue)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[0.65rem] uppercase tracking-[0.2em]"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className={`absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1 transition-colors ${
          isVisible ? "animate-fade-in animation-delay-1100" : "opacity-0"
        }`}
        style={{ color: "var(--text-muted)" }}
        aria-label="Scroll to content"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em]">Discover</span>
        <ArrowDown size={16} className="animate-bounce" />
      </button>
    </div>
  )
}
