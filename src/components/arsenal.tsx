"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
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
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="arsenal" className="py-32 px-6 max-w-6xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Arsenal</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
            >
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4 group-hover:scale-110 transition-transform ${category.color}`}
                >
                  <category.icon size={32} />
                </div>
                <h3 className={`text-2xl font-serif ${category.color}`}>{category.title}</h3>
              </div>

              <div className="space-y-3">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill}
                    className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: categoryIndex * 0.2 + skillIndex * 0.05 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(39, 39, 42, 0.8)" }}
                  >
                    <span className="text-zinc-300 font-mono text-sm">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
