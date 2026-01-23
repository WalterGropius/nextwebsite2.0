"use client"

import { useRef, useEffect, useState } from "react"
import { Zap, Eye, Rocket, Target } from "lucide-react"

const manifestoCards = [
  {
    icon: Zap,
    title: "Art Meets Technology",
    highlight: ["CREATIVE VISION", "TECHNICAL EXECUTION"],
    highlightColors: ["var(--vermilion)", "var(--cobalt-blue)"],
    description: "Whether you need immersive VR experiences, AI-powered solutions, or cutting-edge web applications, I turn ideas into reality.",
  },
  {
    icon: Eye,
    title: "The Polymath's Edge",
    highlight: ["XR/VFX", "AI SYSTEMS", "FULL-STACK", "VISUAL ART"],
    highlightColors: ["var(--fern-green)", "var(--cobalt-blue)", "var(--vermilion)", "var(--pistachio)"],
    description: "I see connections others overlook. Expect fresh perspectives and unexpected solutions.",
  },
  {
    icon: Target,
    title: "Not Just a Developer",
    highlight: ["MAGICAL"],
    highlightColors: ["var(--flax)"],
    description: "Every project is an opportunity to create something that makes people say \"wow.\"",
  },
  {
    icon: Rocket,
    title: "Solving the Impossible",
    highlight: ["IMPOSSIBLE"],
    highlightColors: ["var(--fern-green)"],
    description: "I'm drawn to challenges that seem impossible at first glance. That's where breakthrough innovation happens. Let's prove them wrong!",
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
    <section
      id="manifesto"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div 
          className="absolute -left-1/3 top-0 h-[800px] w-[800px] rounded-full blur-[150px] opacity-30"
          style={{ background: "radial-gradient(circle, var(--cobalt-blue) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full blur-[120px] opacity-20"
          style={{ background: "radial-gradient(circle, var(--vermilion) 0%, transparent 70%)" }}
        />
      </div>

      <div ref={ref} className="section-container relative z-10">
        {/* Section header */}
        <div className={`mb-16 text-center ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="accent-line mx-auto mb-6 animate-line-draw" />
          <h2 
            className="text-4xl font-bold sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What I <span className="gradient-text">Believe</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {manifestoCards.map((card, idx) => (
            <div
              key={idx}
              className={`glass-card glass-card-hover group relative overflow-hidden p-8 lg:p-10 ${
                isInView ? "animate-scale-in" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.15 * idx}s` }}
            >
              {/* Accent corner */}
              <div 
                className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-10 transition-all duration-500 group-hover:opacity-20 group-hover:scale-150"
                style={{ background: card.highlightColors[0] }}
              />

              {/* Icon */}
              <div 
                className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: "var(--surface-elevated)",
                  color: card.highlightColors[0]
                }}
              >
                <card.icon size={28} />
              </div>

              {/* Title */}
              <h3 
                className={`mb-4 text-2xl font-bold text-white lg:text-3xl ${
                  isInView ? "animate-slide-up" : "opacity-0"
                }`}
                style={{ 
                  fontFamily: "var(--font-display)",
                  animationDelay: `${0.2 + idx * 0.1}s` 
                }}
              >
                {card.title}
              </h3>

              {/* Highlights */}
              <div className="mb-4 flex flex-wrap gap-2">
                {card.highlight.map((word, widx) => (
                  <span
                    key={widx}
                    className="inline-block rounded-lg px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
                    style={{ 
                      background: `${card.highlightColors[widx % card.highlightColors.length]}20`,
                      color: card.highlightColors[widx % card.highlightColors.length]
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p 
                className={`text-base leading-relaxed text-gray-400 lg:text-lg ${
                  isInView ? "animate-fade-in" : "opacity-0"
                }`}
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom statement */}
        <div 
          className={`mt-16 text-center ${isInView ? "animate-fade-in-up animation-delay-800" : "opacity-0"}`}
        >
          <p className="text-xl text-gray-400 md:text-2xl">
            Ready to build something{" "}
            <span className="font-bold text-white">extraordinary</span>?
          </p>
        </div>
      </div>
    </section>
  )
}
