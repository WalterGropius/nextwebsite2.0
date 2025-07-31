"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ExternalLink, Calendar, Tag } from "lucide-react"
import Image from "next/image"

interface ProjectItem {
  id: number
  image: string
  title: string
  description: string
  date: string
  link: string
  tags: string
}

export function Creations() {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    fetch("https://zenbauhaus.vercel.app/portfolio.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok")
        return res.json()
      })
      .then((data) => {
        if (!ignore) {
          setProjects(Array.isArray(data) ? data : [])
          setError(null)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError("Failed to load portfolio.")
          setProjects([])
          // Optionally log error: console.error(err)
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="creations" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Portfolio</h2>

          {loading ? (
            <div className="text-center text-gray-400 py-16">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-16">{error}</div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={container}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={item}
                  className="group relative rounded-lg overflow-hidden hover:scale-105 transition-all duration-300"
                >
                  <div className="relative w-full aspect-[2/3]">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      style={{ zIndex: 0 }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-end pointer-events-none">
                    <div className="w-full bg-gray-900 bg-opacity-70 backdrop-blur-md p-6 rounded-b-lg z-10 pointer-events-auto">
                      <h3 className="text-xl font-semibold mb-3 text-gray-100">{project.title}</h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                        <Calendar size={12} />
                        <span>{project.date}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                          >
                            <Tag size={8} />
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
                        >
                          View Project
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="mb-8 text-lg text-gray-400">
              Check out my{" "}
              <a href="/portfolio" className="text-amber-400 hover:text-amber-300 underline transition-colors">
                full portfolio
              </a>{" "}
              to see more of my work.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
