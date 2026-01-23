"use client"

import { useRef, useEffect, useState } from "react"
import { Lightbulb, Heart, Users, ArrowRight } from "lucide-react"

const pillars = [
  {
    icon: Lightbulb,
    title: "Functionality",
    tagline: "Built to Perform",
    description: "Solutions that work seamlessly, serving their purpose with unwavering reliability and efficiency. No compromises.",
    color: "var(--flax)",
    bgGradient: "linear-gradient(135deg, rgba(252, 237, 135, 0.1) 0%, transparent 100%)",
  },
  {
    icon: Heart,
    title: "Aesthetics",
    tagline: "Beauty in Every Pixel",
    description: "Creating experiences that inspire and delight. Form and function are inseparable—both must be exceptional.",
    color: "var(--salmon-pink)",
    bgGradient: "linear-gradient(135deg, rgba(252, 116, 114, 0.1) 0%, transparent 100%)",
  },
  {
    icon: Users,
    title: "Experience",
    tagline: "Human-Centered Design",
    description: "Intuitive interactions that empower users, making complex technology accessible and delightful for everyone.",
    color: "var(--cobalt-blue)",
    bgGradient: "linear-gradient(135deg, rgba(59, 102, 243, 0.1) 0%, transparent 100%)",
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
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Subtle grid pattern overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px), 
                           linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div ref={ref} className="section-container relative z-10">
        {/* Section header */}
        <div className={`mb-20 max-w-3xl ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="accent-line mb-6 animate-line-draw" />
          <h2 
            className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Design <span className="gradient-text">Philosophy</span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Continually balancing the essential pillars that make technology not just functional, 
            but <span className="text-white">truly meaningful</span>.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`group relative cursor-pointer ${
                isInView ? "animate-slide-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.2 + idx * 0.15}s` }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="glass-card relative h-full overflow-hidden p-8 transition-all duration-500 lg:p-10"
                style={{
                  background: hoveredIndex === idx ? pillar.bgGradient : "var(--surface-glass)",
                  borderColor: hoveredIndex === idx ? `${pillar.color}40` : "var(--border-subtle)",
                  transform: hoveredIndex === idx ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: hoveredIndex === idx 
                    ? `0 20px 40px -20px rgba(0, 0, 0, 0.5), 0 0 60px -30px ${pillar.color}40`
                    : "none",
                }}
              >
                {/* Floating icon */}
                <div 
                  className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500"
                  style={{ 
                    background: "var(--surface-elevated)",
                    color: pillar.color,
                    transform: hoveredIndex === idx ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0)",
                  }}
                >
                  <pillar.icon size={32} />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <span 
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: pillar.color }}
                  >
                    {pillar.tagline}
                  </span>
                  
                  <h3 
                    className="text-2xl font-bold text-white lg:text-3xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pillar.title}
                  </h3>
                  
                  <p className="text-base leading-relaxed text-gray-400">
                    {pillar.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div 
                  className="mt-6 flex items-center gap-2 text-sm font-medium transition-all duration-300"
                  style={{ 
                    color: pillar.color,
                    opacity: hoveredIndex === idx ? 1 : 0,
                    transform: hoveredIndex === idx ? "translateX(0)" : "translateX(-10px)",
                  }}
                >
                  Learn more
                  <ArrowRight size={16} />
                </div>

                {/* Corner accent */}
                <div 
                  className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full transition-all duration-500"
                  style={{ 
                    background: pillar.color,
                    opacity: hoveredIndex === idx ? 0.1 : 0.03,
                    transform: hoveredIndex === idx ? "scale(1.5)" : "scale(1)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div 
          className={`mt-20 text-center ${isInView ? "animate-fade-in animation-delay-800" : "opacity-0"}`}
        >
          <blockquote 
            className="mx-auto max-w-2xl text-2xl font-medium italic text-gray-300 md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            "Technology should feel like <span style={{ color: "var(--flax)" }}>magic</span>, 
            not like work."
          </blockquote>
        </div>
      </div>
    </section>
  )
}
