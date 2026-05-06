"use client"

import { useRef, useEffect, useState } from "react"
import { Sparkles, Award, Building2, Zap } from "lucide-react"

const highlights = [
  {
    icon: Building2,
    label: "CTO at Flipas",
    description: "Leading a team of 5 engineers building AI-powered Gen Z life acceleration",
  },
  {
    icon: Award,
    label: "VFX Supervisor",
    description: "Professional film VFX on Hagen with Wilma Film",
  },
  {
    icon: Zap,
    label: "VR Pioneer",
    description: "10+ years pushing boundaries in virtual reality development",
  },
  {
    icon: Sparkles,
    label: "Creative Tech",
    description: "Nike Berlin, Fashion Tech Berlin, CzechVRFest speaker",
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`glass-card group flex items-start gap-4 p-5 transition-all duration-300 hover:border-white/10 ${
                isInView ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div 
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: "var(--surface-elevated)",
                  color: "var(--vista-blue)"
                }}
              >
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-white">{item.label}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
