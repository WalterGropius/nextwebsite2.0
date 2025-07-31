"use client"

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold: 0.1, rootMargin: "-100px" }
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

  const displayedProjects =
    typeof randomCount === "number"
      ? getRandomItems(projects, randomCount)
      : projects

  return (
    <section id="creations" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className={isInView ? "animate-fade-in" : "opacity-0"}
        >
          {!randomCount && <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Portfolio</h2>}
          {randomCount && <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Random Works</h2>}

          {loading ? (
            <div className="text-center text-gray-400 py-16">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-16">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`group relative rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 ${isInView ? "animate-slide-up" : "opacity-0"
                    }`}
                  style={{ animationDelay: `${0.1 * index}s` }}
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
                        {project.tags.split(',').map((tag, idx) => (
                          <span
                            key={idx}
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
                          className="inline-flex items-center gap-2 transition-colors text-sm"
                          style={{ color: 'var(--flax)' }}
                        >
                          View Project
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {randomCount && (
            <div
              className={`text-center mt-16 ${isInView ? "animate-slide-up animation-delay-800" : "opacity-0"}`}
            >
              <p className="mb-8 text-lg" style={{ color: 'var(--salmon-pink)' }}>
                Check out my{" "}
                <a href="/portfolio-s" style={{ color: 'var(--flax)' }} className="hover:opacity-80 underline transition-colors">
                  full portfolio
                </a>{" "}
                to see more of my work.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
