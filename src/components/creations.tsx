"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { ExternalLink, Calendar, Tag, ArrowRight, Filter } from "lucide-react"

interface ProjectItem {
  id: number
  image: string
  title: string
  description: string
  date: string
  link: string
  tags: string
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

type CreationsProps = {
  randomCount?: number
}

export function Creations({ randomCount }: CreationsProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredProject, setHoveredProject] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

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

  useEffect(() => {
    let ignore = false
    setLoading(true)
    fetch("/portfolio.json")
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
      .catch(() => {
        if (!ignore) {
          setError("Failed to load portfolio.")
          setProjects([])
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  // Get all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap(p => p.tags.split(',').map(t => t.trim())))
  ).filter(Boolean)

  // Memoize random selection to prevent reshuffling on every render
  const randomizedProjects = useMemo(() => {
    if (typeof randomCount === "number" && projects.length > 0) {
      return getRandomItems(projects, randomCount)
    }
    return projects
  }, [projects, randomCount])

  const displayedProjects = selectedTag
    ? randomizedProjects.filter(p => p.tags.toLowerCase().includes(selectedTag.toLowerCase()))
    : randomizedProjects

  return (
    <section id="creations" className="relative overflow-hidden py-24 sm:py-32">
      <div ref={ref} className="section-container">
        {/* Section header */}
        <div className={`mb-16 text-center ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="accent-line mx-auto mb-6 animate-line-draw" />
          <h2 
            className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {randomCount ? "Featured " : ""}<span className="gradient-text">Works</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            A selection of projects spanning VR, AI, web, and creative technology
          </p>
        </div>

        {/* Tag filters (only for full portfolio) */}
        {!randomCount && allTags.length > 0 && (
          <div 
            className={`mb-12 flex flex-wrap justify-center gap-2 ${
              isInView ? "animate-fade-in-up animation-delay-200" : "opacity-0"
            }`}
          >
            <button
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
              style={{
                background: !selectedTag ? "var(--gradient-primary)" : "var(--surface-glass)",
                color: !selectedTag ? "white" : "var(--thistle)",
                border: "1px solid",
                borderColor: !selectedTag ? "transparent" : "var(--border-subtle)",
              }}
            >
              <Filter size={14} />
              All
            </button>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                style={{
                  background: selectedTag === tag ? "var(--gradient-primary)" : "var(--surface-glass)",
                  color: selectedTag === tag ? "white" : "var(--thistle)",
                  border: "1px solid",
                  borderColor: selectedTag === tag ? "transparent" : "var(--border-subtle)",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div 
                className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--vista-blue)", borderTopColor: "transparent" }}
              />
              <p className="text-gray-400">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div 
              className="glass-card p-8 text-center"
              style={{ borderColor: "var(--vermilion)" }}
            >
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProjects.map((project, index) => (
              <div
                key={project.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
                  isInView ? "animate-scale-in" : "opacity-0"
                }`}
                style={{ 
                  animationDelay: `${0.1 * index}s`,
                  transform: hoveredProject === project.id ? "scale(1.02)" : "scale(1)",
                }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700"
                    style={{
                      transform: hoveredProject === project.id ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, transparent 40%, rgba(15, 17, 23, 0.95) 100%)",
                      opacity: hoveredProject === project.id ? 1 : 0.8,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  {/* Date */}
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>{project.date}</span>
                  </div>

                  {/* Title */}
                  <h3 
                    className="mb-2 text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {project.title}
                  </h3>

                  {/* Description - show on hover */}
                  <p 
                    className="mb-4 line-clamp-2 text-sm text-gray-300 transition-all duration-300"
                    style={{
                      opacity: hoveredProject === project.id ? 1 : 0,
                      transform: hoveredProject === project.id ? "translateY(0)" : "translateY(10px)",
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {project.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ 
                          background: "var(--surface-glass)", 
                          color: "var(--vista-blue)",
                          border: "1px solid var(--border-subtle)"
                        }}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Link */}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium transition-all"
                      style={{ 
                        color: "var(--flax)",
                        opacity: hoveredProject === project.id ? 1 : 0.7,
                      }}
                    >
                      View Project
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA for more */}
        {randomCount && (
          <div 
            className={`mt-16 text-center ${isInView ? "animate-fade-in-up animation-delay-800" : "opacity-0"}`}
          >
            <a 
              href="/portfolio-s"
              className="btn-secondary group inline-flex items-center gap-2"
            >
              View Full Portfolio
              <ArrowRight 
                size={18} 
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
