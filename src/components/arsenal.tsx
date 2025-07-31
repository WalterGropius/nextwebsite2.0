"use client"

import { useRef, useEffect, useState } from "react"
import { Brain, Zap, Code } from "lucide-react"

const skillCategories = [
  {
    title: "AI/ML",
    icon: Brain,
    skills: [
      "Machine Learning",
      "Neural Networks",
      "Computer Vision",
      "NLP",
      "TensorFlow",
      "PyTorch",
      "OpenAI API",
      "Transformers",
    ],
    color: "text-amber-400",
  },
  {
    title: "VR/AR & Graphics",
    icon: Zap,
    skills: [
      "Unity 3D",
      "Unreal Engine",
      "WebGL",
      "Three.js",
      "Blender",
      "Real-time VFX",
      "Virtual Production",
      "Spatial Computing",
    ],
    color: "text-cyan-400",
  },
  {
    title: "Full-Stack Web",
    icon: Code,
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"],
    color: "text-emerald-400",
  },
]

export function Arsenal() {
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
    <section id="arsenal" className="py-32 px-6 max-w-6xl mx-auto">
      <div
        ref={ref}
        className={isInView ? "animate-fade-in" : "opacity-0"}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Arsenal</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              className={`group ${
                isInView ? "animate-slide-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${categoryIndex * 0.2}s` }}
            >
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4 group-hover:scale-110 transition-transform ${category.color}`}
                >
                  <category.icon size={32} />
                </div>
                <h3 className={`text-2xl font-bold ${category.color}`}>{category.title}</h3>
              </div>

              <div className="space-y-3">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill}
                    className={`p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-102 hover:bg-zinc-900/80 ${
                      isInView ? "animate-slide-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${categoryIndex * 0.2 + skillIndex * 0.05}s` }}
                  >
                    <span className="text-zinc-300 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
