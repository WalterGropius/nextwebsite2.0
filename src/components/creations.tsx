"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { ExternalLink, Calendar, ArrowRight, Filter, Palette } from "lucide-react"
import { SectionHeader } from "./section-header"

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

  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags.split(",").map((t) => t.trim())))
  ).filter(Boolean)

  const randomizedProjects = useMemo(() => {
    if (typeof randomCount === "number" && projects.length > 0) {
      return getRandomItems(projects, randomCount)
    }
    return projects
  }, [projects, randomCount])

  const displayedProjects = selectedTag
    ? randomizedProjects.filter((p) => p.tags.toLowerCase().includes(selectedTag.toLowerCase()))
    : randomizedProjects

  return (
    <section id="creations" className="relative overflow-hidden py-16 sm:py-20">
      <div ref={ref} className="section-container">
        {/* Section header */}
        <div className={`mb-10 ${isInView ? "animate-reveal-blur" : "opacity-0"}`}>
          <SectionHeader
            icon={Palette}
            title={<>{randomCount ? "Featured " : ""}Works</>}
            kicker={randomCount ? "Selected work" : "Full portfolio"}
            color="var(--cobalt-blue)"
          />
          <p className="mt-4 max-w-xl text-base" style={{ color: "var(--text-muted)" }}>
            VR, AI, web, and creative technology — selected pieces.
          </p>
        </div>

        {/* Tag filters (only for full portfolio) */}
        {!randomCount && allTags.length > 0 && (
          <div
            className={`mb-8 flex flex-wrap gap-2 ${
              isInView ? "animate-fade-in-up animation-delay-200" : "opacity-0"
            }`}
          >
            <button
              onClick={() => setSelectedTag(null)}
              className="skill-pill"
              style={{
                background: !selectedTag ? "var(--text-primary)" : "var(--surface-ink)",
                color: !selectedTag ? "var(--surface-dark)" : "var(--text-primary)",
                borderColor: !selectedTag ? "var(--text-primary)" : "var(--border-subtle)",
              }}
            >
              <Filter size={12} />
              <span className="ml-1">All</span>
            </button>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="skill-pill"
                style={{
                  background: selectedTag === tag ? "var(--text-primary)" : "var(--surface-ink)",
                  color: selectedTag === tag ? "var(--surface-dark)" : "var(--text-primary)",
                  borderColor:
                    selectedTag === tag ? "var(--text-primary)" : "var(--border-subtle)",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div
                className="mx-auto mb-3 h-10 w-10 animate-spin border-2"
                style={{
                  borderColor: "var(--text-primary)",
                  borderTopColor: "transparent",
                }}
              />
              <p style={{ color: "var(--text-muted)" }}>Loading projects…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div
              className="border-2 p-6 text-center"
              style={{ borderColor: "var(--vermilion)", color: "var(--vermilion)" }}
            >
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProjects.map((project, index) => (
              <a
                key={project.id}
                href={project.link || "#"}
                target={project.link ? "_blank" : undefined}
                rel={project.link ? "noopener noreferrer" : undefined}
                className={`group block overflow-hidden ${isInView ? "animate-reveal-blur" : "opacity-0"}`}
                style={{
                  animationDelay: `${0.06 * index}s`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "1.5rem",
                  backdropFilter: "blur(18px) saturate(108%)",
                  WebkitBackdropFilter: "blur(18px) saturate(108%)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.7) inset, 0 18px 36px -28px rgba(15,17,23,0.18), 0 0 0 1px rgba(15,17,23,0.04)",
                  transition:
                    "transform 380ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 260ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)"
                  e.currentTarget.style.boxShadow =
                    "0 1px 0 rgba(255,255,255,0.85) inset, 0 30px 60px -28px rgba(15,17,23,0.28), 0 0 60px -20px var(--accent-glow)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ""
                  e.currentTarget.style.boxShadow =
                    "0 1px 0 rgba(255,255,255,0.7) inset, 0 18px 36px -28px rgba(15,17,23,0.18), 0 0 0 1px rgba(15,17,23,0.04)"
                }}
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* Soft fade between image and card body */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%)",
                    }}
                  />
                </div>

                {/* Content — soft, no hard divider */}
                <div className="space-y-2 p-5">
                  <div
                    className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Calendar size={11} />
                    <span>{project.date}</span>
                  </div>

                  <h3
                    className="text-lg leading-tight"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {project.title}
                  </h3>

                  {project.description && (
                    <p
                      className="line-clamp-2 text-sm"
                      style={{ color: "var(--text-muted)", lineHeight: 1.5 }}
                    >
                      {project.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags
                      .split(",")
                      .slice(0, 3)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wider"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 100%)",
                            color: "var(--text-primary)",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            borderRadius: "9999px",
                          }}
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </div>

                  {project.link && (
                    <div
                      className="inline-flex items-center gap-1 pt-2 text-xs uppercase tracking-[0.2em]"
                      style={{ color: "var(--cobalt-blue)" }}
                    >
                      View
                      <ExternalLink size={11} />
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA for more */}
        {randomCount && (
          <div
            className={`mt-10 text-center ${
              isInView ? "animate-fade-in-up animation-delay-800" : "opacity-0"
            }`}
          >
            <a
              href="/portfolio-s"
              className="btn-secondary group inline-flex items-center gap-2"
            >
              View Full Portfolio
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
