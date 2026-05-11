"use client"

import { useRef, useEffect, useState } from "react"
import { Zap, Eye, Rocket, Target, Flame } from "lucide-react"
import { SectionHeader } from "./section-header"

const manifestoCards = [
  {
    icon: Zap,
    title: "Art Meets Technology",
    highlight: ["Creative Vision", "Technical Execution"],
    highlightColors: ["var(--vermilion)", "var(--cobalt-blue)"],
    description:
      "Whether you need immersive VR experiences, AI-powered solutions, or cutting-edge web applications, I turn ideas into reality.",
  },
  {
    icon: Eye,
    title: "The Polymath's Edge",
    highlight: ["XR/VFX", "AI Systems", "Full-Stack", "Visual Art"],
    highlightColors: [
      "var(--fern-green)",
      "var(--cobalt-blue)",
      "var(--vermilion)",
      "var(--lion)",
    ],
    description:
      "I see connections others overlook. Expect fresh perspectives and unexpected solutions.",
  },
  {
    icon: Target,
    title: "Not Just a Developer",
    highlight: ["Magical"],
    highlightColors: ["var(--lion)"],
    description:
      "Every project is an opportunity to create something that makes people say \"wow.\"",
  },
  {
    icon: Rocket,
    title: "Solving the Impossible",
    highlight: ["Impossible"],
    highlightColors: ["var(--fern-green)"],
    description:
      "I'm drawn to challenges that seem impossible at first glance. That's where breakthrough innovation happens. Let's prove them wrong!",
  },
]

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold: 0.1, rootMargin: "-50px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="manifesto" className="relative overflow-hidden py-12 sm:py-16">
      <div ref={ref} className="section-container relative z-10">
        {/* Section header */}
        <div
          className={`mb-10 max-w-2xl ${
            isInView ? "animate-reveal-blur" : "opacity-0"
          }`}
        >
          <SectionHeader
            icon={Flame}
            title={
              <>
                What I{" "}
                <span style={{ color: "var(--cobalt-blue)" }}>believe</span>
              </>
            }
            kicker="Manifesto"
            color="var(--cobalt-blue)"
          />
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {manifestoCards.map((card, idx) => (
            <div
              key={idx}
              className={`glass-card glass-card-hover group relative overflow-hidden p-6 lg:p-8 ${
                isInView ? "animate-reveal-blur" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.08 * idx}s` }}
            >
              {/* Soft accent corner — pure colour wash, no edges */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-30 blur-2xl transition-all duration-700 group-hover:opacity-60 group-hover:scale-110"
                style={{ background: card.highlightColors[0] }}
              />

              {/* Icon chip */}
              <div
                className="icon-chip mb-5 h-12 w-12 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                style={{ color: card.highlightColors[0] }}
              >
                <card.icon size={24} />
              </div>

              {/* Title */}
              <h3
                className="mb-3 text-2xl lg:text-3xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                {card.title}
              </h3>

              {/* Highlights */}
              <div className="mb-4 flex flex-wrap gap-2">
                {card.highlight.map((word, widx) => {
                  const color =
                    card.highlightColors[widx % card.highlightColors.length]
                  return (
                    <span
                      key={widx}
                      className="inline-block px-3 py-1 text-xs uppercase tracking-[0.18em]"
                      style={{
                        background: `linear-gradient(180deg, ${color}28, ${color}14)`,
                        color,
                        borderRadius: "9999px",
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {word}
                    </span>
                  )
                })}
              </div>

              {/* Description */}
              <p
                className="text-base leading-relaxed lg:text-lg"
                style={{ color: "var(--text-muted)" }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom statement */}
        <div
          className={`mt-10 text-center ${
            isInView ? "animate-fade-in-up animation-delay-800" : "opacity-0"
          }`}
        >
          <p
            className="text-xl md:text-2xl"
            style={{ color: "var(--text-muted)" }}
          >
            Ready to build something{" "}
            <span style={{ color: "var(--vermilion)" }}>extraordinary</span>?
          </p>
        </div>
      </div>
    </section>
  )
}
