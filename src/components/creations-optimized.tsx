"use client"

import { useRef, useState, useEffect, useMemo } from "react"
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

export function CreationsOptimized() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleProjects, setVisibleProjects] = useState<number>(6) // Start with 6 projects

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
      .catch((err) => {
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

  // Load more projects when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      if (scrollPosition > documentHeight - 1000 && visibleProjects < projects.length) {
        setVisibleProjects(prev => Math.min(prev + 6, projects.length))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visibleProjects, projects.length])

  return (
    <section id="creations" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className={isInView ? "animate-fade-in" : "opacity-0"}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Portfolio</h2>

          {loading ? (
            <div className="text-center text-gray-400 py-16">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-16">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, visibleProjects).map((project, index) => (
                <div
                  key={project.id}
                  className={`group relative rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 ${
                    isInView ? "animate-slide-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${0.05 * index}s` }}
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
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
                </div>
              ))}
            </div>
          )}

          {visibleProjects < projects.length && (
            <div
              className={`text-center mt-16 ${
                isInView ? "animate-slide-up animation-delay-800" : "opacity-0"
              }`}
            >
              <p className="mb-8 text-lg text-gray-400">
                Showing {visibleProjects} of {projects.length} projects
              </p>
            </div>
          )}

          <div
            className={`text-center mt-16 ${
              isInView ? "animate-slide-up animation-delay-800" : "opacity-0"
            }`}
          >
            <p className="mb-8 text-lg text-gray-400">
              Check out my{" "}
              <a href="/portfolio" className="text-amber-400 hover:text-amber-300 underline transition-colors">
                full portfolio
              </a>{" "}
              to see more of my work.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 