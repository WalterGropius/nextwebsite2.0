"use client"

import { useRef, useEffect, useState } from "react"
import { Heart, Lightbulb, Users } from "lucide-react"

const philosophyAreas = [
  {
    title: "Functionality",
    icon: Lightbulb,
    description: "Building solutions that work seamlessly and serve their intended purpose with reliability and efficiency.",
    color: "var(--salmon-pink)",
  },
  {
    title: "Aesthetics",
    icon: Heart,
    description: "Creating beautiful experiences that inspire and delight, understanding that form and function are inseparable.",
    color: "var(--flax)",
  },
  {
    title: "User Experience",
    icon: Users,
    description: "Crafting intuitive interactions that empower users and make complex technology accessible to everyone.",
    color: "var(--cobalt-blue)",
  },
]

export function Philosophy() {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1, rootMargin: "-100px" }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className={isInView ? "animate-fade-in" : "opacity-0"}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Philosophy</h2>

          <div
            className={`text-center mb-16 ${isInView ? "animate-slide-up animation-delay-200" : "opacity-0"
              }`}
          >
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Continually learning the importance of balancing the essential pillars
              that make technology not just functional, but truly meaningful.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {philosophyAreas.map((area, index) => (
              <div
                key={area.title}
                className={`group p-8 rounded-lg border transition-all duration-300 hover:-translate-y-1 ${isInView ? "animate-scale-in" : "opacity-0"
                  }`}
                style={{
                  animationDelay: `${0.3 + index * 0.1}s`,
                  backgroundColor: 'rgba(58, 63, 106, 0.5)',
                  borderColor: 'var(--vista-blue)'
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--delft-blue)', color: area.color }}>
                    <area.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: area.color }}>{area.title}</h3>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
