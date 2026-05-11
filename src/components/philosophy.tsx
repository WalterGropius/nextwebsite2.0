"use client"

import { useRef, useEffect, useState } from "react"
import { Lightbulb, Heart, Users, ArrowRight, Compass } from "lucide-react"
import { SectionHeader } from "./section-header"

const pillars = [
  {
    icon: Lightbulb,
    title: "Functionality",
    tagline: "Built to Perform",
    description:
      "Solutions that work seamlessly, serving their purpose with unwavering reliability and efficiency. No compromises.",
    color: "var(--lion)",
  },
  {
    icon: Heart,
    title: "Aesthetics",
    tagline: "Beauty in Every Pixel",
    description:
      "Creating experiences that inspire and delight. Form and function are inseparable—both must be exceptional.",
    color: "var(--salmon-pink)",
  },
  {
    icon: Users,
    title: "Experience",
    tagline: "Human-Centered",
    description:
      "Intuitive interactions that empower users, making complex technology accessible and delightful for everyone.",
    color: "var(--cobalt-blue)",
  },
]

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div ref={ref} className="section-container relative z-10">
        {/* Section header */}
        <div
          className={`mb-12 max-w-3xl ${
            isInView ? "animate-reveal-blur" : "opacity-0"
          }`}
        >
          <SectionHeader
            icon={Compass}
            title={
              <>
                Design{" "}
                <span style={{ color: "var(--salmon-pink)" }}>philosophy</span>
              </>
            }
            kicker="Philosophy"
            color="var(--salmon-pink)"
          />
          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Continually balancing the essential pillars that make technology not
            just functional, but{" "}
            <span style={{ color: "var(--text-primary)" }}>truly meaningful</span>.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`glass-card glass-card-hover group relative h-full overflow-hidden p-6 lg:p-8 ${
                isInView ? "animate-reveal-blur" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Soft colour wash that brightens on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-60"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${pillar.color}22, transparent 60%)`,
                }}
              />

              {/* Icon */}
              <div
                className="icon-chip mb-6 h-14 w-14 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                style={{ color: pillar.color }}
              >
                <pillar.icon size={28} />
              </div>

              {/* Content */}
              <div className="relative space-y-3">
                <h3
                  className="text-2xl lg:text-3xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  {pillar.title}
                </h3>

                <span
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: pillar.color }}
                >
                  {pillar.tagline}
                </span>

                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {pillar.description}
                </p>
              </div>

              {/* Hover indicator */}
              <div
                className="relative mt-5 flex items-center gap-2 text-sm font-medium transition-all duration-300"
                style={{
                  color: pillar.color,
                  opacity: hoveredIndex === idx ? 1 : 0,
                  transform:
                    hoveredIndex === idx ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                Learn more
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div
          className={`mt-14 text-center ${
            isInView ? "animate-fade-in animation-delay-800" : "opacity-0"
          }`}
        >
          <blockquote
            className="mx-auto max-w-2xl text-2xl italic md:text-3xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-muted)",
            }}
          >
            &ldquo;Technology should feel like{" "}
            <span style={{ color: "var(--lion)" }}>magic</span>, not like work.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  )
}
