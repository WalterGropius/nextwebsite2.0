"use client"

import { useRef, useEffect, useState } from "react"
import { Brain, Zap, Code, Layers, Cpu, Palette } from "lucide-react"

const skillCategories = [
  {
    title: "3D, VFX & XR",
    icon: Zap,
    color: "var(--salmon-pink)",
    description: "Immersive experiences that blur the line between digital and reality",
    skills: [
      { name: "Blender", level: 95 },
      { name: "Unreal Engine", level: 90 },
      { name: "Houdini", level: 75 },
      { name: "Three.js/R3F", level: 92 },
      { name: "WebGL/WebGPU", level: 85 },
      { name: "Unity 3D", level: 80 },
      { name: "Substance Suite", level: 88 },
      { name: "WebXR", level: 85 },
      { name: "Virtual Production", level: 78 },
      { name: "GLSL Shaders", level: 82 },
    ],
  },
  {
    title: "Development",
    icon: Code,
    color: "var(--pistachio)",
    description: "Full-stack mastery from systems to stunning interfaces",
    skills: [
      { name: "TypeScript", level: 95 },
      { name: "React/Next.js", level: 95 },
      { name: "Node.js", level: 90 },
      { name: "Python", level: 88 },
      { name: "PostgreSQL", level: 85 },
      { name: "Docker/DevOps", level: 82 },
      { name: "C++/C#", level: 75 },
      { name: "GraphQL", level: 85 },
      { name: "AWS/GCP", level: 80 },
      { name: "System Design", level: 88 },
    ],
  },
  {
    title: "AI & Machine Learning",
    icon: Brain,
    color: "var(--cobalt-blue)",
    description: "Intelligence that augments human creativity",
    skills: [
      { name: "LLMs & Prompting", level: 95 },
      { name: "Agentic AI", level: 90 },
      { name: "RAG Systems", level: 88 },
      { name: "Computer Vision", level: 82 },
      { name: "PyTorch", level: 78 },
      { name: "Neural Networks", level: 80 },
      { name: "NLP", level: 85 },
      { name: "YOLO/CV", level: 75 },
      { name: "LangChain", level: 88 },
      { name: "Embeddings", level: 85 },
    ],
  },
]

const additionalSkills = [
  "DaVinci Resolve", "Adobe CC", "Mocha Pro", "EmberGen", "Matte Painting",
  "Real-time ICVFX", "ARKit/ARCore", "Spline", "Arduino", "3D Printing",
  "Photography", "Game Design", "Sound Design", "Music Production"
]

export function Arsenal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [animateSkills, setAnimateSkills] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setTimeout(() => setAnimateSkills(true), 500)
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setAnimateSkills(false)
    const timer = setTimeout(() => setAnimateSkills(true), 100)
    return () => clearTimeout(timer)
  }, [activeCategory])

  return (
    <section id="arsenal" className="relative overflow-hidden py-12 sm:py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div 
          className="absolute left-1/2 top-0 h-[1px] w-[80%] -translate-x-1/2"
          style={{ background: "linear-gradient(90deg, transparent, var(--border-subtle), transparent)" }}
        />
      </div>

      <div ref={ref} className="section-container relative z-10">
        {/* Section header */}
        <div className={`mb-16 text-center ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="accent-line mx-auto mb-6 animate-line-draw" />
          <h2 
            className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Technical <span className="gradient-text">Arsenal</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            A decade of mastering the tools that bring visions to life
          </p>
        </div>

        {/* Category tabs */}
        <div 
          className={`mb-12 flex flex-wrap justify-center gap-3 ${
            isInView ? "animate-fade-in-up animation-delay-200" : "opacity-0"
          }`}
        >
          {skillCategories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className="group flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-300"
              style={{
                background: activeCategory === idx ? category.color : "var(--surface-glass)",
                color: activeCategory === idx ? "var(--surface-dark)" : "rgba(255,255,255,0.7)",
                border: `1px solid ${activeCategory === idx ? category.color : "var(--border-subtle)"}`,
              }}
            >
              <category.icon size={18} />
              {category.title}
            </button>
          ))}
        </div>

        {/* Active category content */}
        <div 
          className={`glass-card mx-auto max-w-4xl p-8 lg:p-12 ${
            isInView ? "animate-scale-in animation-delay-300" : "opacity-0"
          }`}
        >
          {/* Category header */}
          <div className="mb-8 flex items-center gap-4">
            <div 
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ 
                background: `${skillCategories[activeCategory].color}20`,
                color: skillCategories[activeCategory].color
              }}
            >
              {(() => {
                const Icon = skillCategories[activeCategory].icon
                return <Icon size={28} />
              })()}
            </div>
            <div>
              <h3 
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {skillCategories[activeCategory].title}
              </h3>
              <p className="text-sm text-gray-400">
                {skillCategories[activeCategory].description}
              </p>
            </div>
          </div>

          {/* Skills grid with bars */}
          <div className="grid gap-4 sm:grid-cols-2">
            {skillCategories[activeCategory].skills.map((skill, idx) => (
              <div 
                key={skill.name}
                className="group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">{skill.name}</span>
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: skillCategories[activeCategory].color }}
                  >
                    {skill.level}%
                  </span>
                </div>
                <div 
                  className="h-2 overflow-hidden rounded-full"
                  style={{ background: "var(--surface-elevated)" }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: animateSkills ? `${skill.level}%` : "0%",
                      background: `linear-gradient(90deg, ${skillCategories[activeCategory].color}, ${skillCategories[activeCategory].color}80)`,
                      transitionDelay: `${idx * 50}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional skills cloud */}
        <div 
          className={`mt-16 text-center ${isInView ? "animate-fade-in animation-delay-600" : "opacity-0"}`}
        >
          <h4 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Also Proficient In
          </h4>
          <div className="flex flex-wrap justify-center gap-2">
            {additionalSkills.map((skill, idx) => (
              <span
                key={skill}
                className="skill-pill"
                style={{ animationDelay: `${600 + idx * 50}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div 
          className={`mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 ${
            isInView ? "animate-fade-in-up animation-delay-800" : "opacity-0"
          }`}
        >
          {[
            { value: "50+", label: "Technologies", icon: Layers },
            { value: "10+", label: "Years Experience", icon: Cpu },
            { value: "3", label: "Core Domains", icon: Brain },
            { value: "∞", label: "Curiosity", icon: Palette },
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="glass-card p-6 text-center transition-all duration-300 hover:border-white/10"
            >
              <stat.icon 
                size={24} 
                className="mx-auto mb-3"
                style={{ color: "var(--vista-blue)" }}
              />
              <div 
                className="text-3xl font-bold"
                style={{ color: "var(--flax)", fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
