"use client"

import { useRef, useEffect, useState } from "react"
import { Brain, Zap, Code } from "lucide-react"

const skillCategories = [
  {
    title: "3D, VFX & XR",
    icon: Zap,
    skills: [
      "Blender",
      "Unreal Engine",
      "Houdini",
      "EmberGen",
      "Mocha Pro",
      "DaVinci Resolve",
      "Adobe CC",
      "Unity 3D",
      "Matte Painting",
      "WebGL/WebGPU",
      "Three.js/R3F",
      "Substance Suite",
      "Real-time ICVFX",
      "Virtual Production",
      "Spatial Computing",
      "ARKit/ARCore",
      "WebXR",
      "GLSL",
      "Spline",
    ],
    color: "var(--salmon-pink)",
  },
  {
    title: "Software Development",
    icon: Code,
    skills: [
      "Python",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Git",
      "PostgreSQL",
      "ORM",
      "AWS/GCP",
      "Docker",
      "CI/CD",
      "DevOps",
      "REST APIs",
      "GraphQL",
      "WebSockets",
      "Webhooks",
      "Assembly",
      "CS1/CS2",
      "C++/C#/C",
    ],
    color: "var(--pistachio)",
  },
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
    color: "var(--cobalt-blue)",
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
              className={`group ${isInView ? "animate-slide-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${categoryIndex * 0.2}s` }}
            >
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: 'var(--delft-blue)', color: category.color }}
                >
                  <category.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: category.color }}>{category.title}</h3>
              </div>

              <div className="space-y-3">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill}
                    className={`p-3 rounded-lg border transition-all duration-300 hover:scale-102 ${isInView ? "animate-slide-up" : "opacity-0"
                      }`}
                    style={{
                      animationDelay: `${categoryIndex * 0.2 + skillIndex * 0.05}s`,
                      backgroundColor: 'rgba(58, 63, 106, 0.5)',
                      borderColor: 'var(--vista-blue)',
                      color: 'var(--thistle)'
                    }}
                  >
                    <span className="text-sm">{skill}</span>
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
