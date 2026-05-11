"use client"

import { useRef, useEffect, useState } from "react"
import { Sparkles, Award, Building2, Zap, Star } from "lucide-react"
import { SectionHeader } from "./section-header"

const highlights = [
  {
    icon: Building2,
    label: "CTO at Flipas",
    description:
      "Leading a team of 5 engineers building AI-powered Gen Z life acceleration",
    color: "var(--cobalt-blue)",
  },
  {
    icon: Award,
    label: "VFX Supervisor",
    description: "Professional film VFX on Hagen with Wilma Film",
    color: "var(--vermilion)",
  },
  {
    icon: Zap,
    label: "VR Pioneer",
    description: "10+ years pushing boundaries in virtual reality development",
    color: "var(--fern-green)",
  },
  {
    icon: Sparkles,
    label: "Creative Tech",
    description: "Nike Berlin, Fashion Tech Berlin, CzechVRFest speaker",
    color: "var(--lion)",
  },
]

export function Highlights() {
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
    <section className="relative overflow-hidden py-10 sm:py-12">
      <div ref={ref} className="section-container">
        <div
          className={`mb-8 max-w-2xl ${
            isInView ? "animate-reveal-blur" : "opacity-0"
          }`}
        >
          <SectionHeader
            icon={Star}
            title={
              <>
                Career{" "}
                <span style={{ color: "var(--lion)" }}>highlights</span>
              </>
            }
            kicker="Snapshot"
            color="var(--lion)"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`glass-card glass-card-hover group relative p-4 ${
                isInView ? "animate-reveal-blur" : "opacity-0"
              }`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div
                className="icon-chip pointer-events-none absolute top-3 right-3 z-10 h-9 w-9 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                style={{ color: item.color }}
              >
                <item.icon size={18} />
              </div>
              <div>
                <h3
                  className="mb-1 text-base"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  {item.label}
                </h3>
                <p
                  className="text-sm leading-snug"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
