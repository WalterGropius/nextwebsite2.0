"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ExternalLink, Sparkles } from "lucide-react"

const projects = [
  {
    title: "Sombra (Flipas)",
    description:
      "An AI assistant aimed at rebirthing mentorship and learning, laying the groundwork for a cognitive prosthetic OS.",
    tech: ["AI/ML", "React", "TypeScript", "Neural Networks"],
    featured: true,
    link: "#",
  },
  {
    title: "numinos VR timetravel",
    description: "Tech artist and R&D developer for immersive VR time-travel experiences.",
    tech: ["VR", "Unity", "C#", "Spatial Computing"],
    featured: false,
    link: "#",
  },
  {
    title: "Kevin Gates MV VFX",
    description: "Real-time Unreal Engine visual effects for music video production.",
    tech: ["Unreal Engine", "Real-time VFX", "Cinematography"],
    featured: false,
    link: "#",
  },
  {
    title: "Cpt. Demo MV VFX",
    description: "Unreal scenes featuring flying cars and lightsaber effects for music video.",
    tech: ["Unreal Engine", "VFX", "3D Animation"],
    featured: false,
    link: "#",
  },
  {
    title: "Vlak LED Screen Support",
    description: "Virtual production pipeline with LED panels for immersive filmmaking.",
    tech: ["UE4", "Virtual Production", "LED Technology"],
    featured: false,
    link: "#",
  },
  {
    title: "Mancuska VR Exhibit",
    description: "VR gallery experience with advanced viewer analytics and interaction tracking.",
    tech: ["VR", "Analytics", "Interactive Design"],
    featured: false,
    link: "#",
  },
]

export function Creations() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="creations" className="py-32 px-6 max-w-6xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Creations</h2>

        <div className="space-y-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              className={`group relative p-8 rounded-lg border transition-all duration-300 hover:border-amber-400/50 ${
                project.featured ? "border-amber-400/30 bg-amber-400/5" : "border-zinc-800 hover:bg-zinc-900/50"
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {project.featured && (
                <div className="absolute -top-3 left-8">
                  <div className="flex items-center gap-2 bg-amber-400 text-zinc-950 px-3 py-1 rounded-full text-sm font-medium">
                    <Sparkles size={14} />
                    Featured
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-2xl font-serif ${project.featured ? "text-amber-400" : "text-zinc-100"}`}>
                  {project.title}
                </h3>
                <ExternalLink
                  size={20}
                  className="text-zinc-500 group-hover:text-cyan-400 transition-colors cursor-pointer"
                />
              </div>

              <p className="text-zinc-300 mb-6 leading-relaxed">{project.description}</p>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
