"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { motion, useInView } from "motion/react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { TiltCard } from "./tilt-card"
import { useT } from "@/lib/i18n/provider"

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
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const t = useT()

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
          setError(t("creations.error"))
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
    ? randomizedProjects.filter((p) =>
        p.tags.toLowerCase().includes(selectedTag.toLowerCase())
      )
    : randomizedProjects

  return (
    <section id="creations" className="relative py-16 sm:py-24" ref={ref}>
      <div className="section-container">
        <h2
          className="mb-10 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          <MotionText text={t("creations.title.0")} split="word" from="up" />{" "}
          <MotionText
            text={t(randomCount ? "creations.title.works" : "creations.title.everything")}
            split="word"
            from="up"
            delay={0.2}
            className="ink-underline"
          />
        </h2>

        {!randomCount && allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className="px-3 py-1 text-sm transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                color: !selectedTag ? "var(--surface-dark)" : "var(--ink)",
                background: !selectedTag ? "var(--ink)" : "transparent",
                border: "1.5px solid var(--ink)",
                borderRadius: "9999px",
                filter: "url(#ink-wobble)",
              }}
            >
              {t("creations.filter.all")}
            </button>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="px-3 py-1 text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  color:
                    selectedTag === tag ? "var(--surface-dark)" : "var(--ink)",
                  background:
                    selectedTag === tag ? "var(--ink)" : "transparent",
                  border: "1.5px solid var(--ink)",
                  borderRadius: "9999px",
                  filter: "url(#ink-wobble)",
                }}
              >
                {tag.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              {t("creations.loading")}
            </p>
          </div>
        ) : error ? (
          <p
            style={{
              color: "var(--vermilion)",
              fontFamily: "var(--font-display)",
            }}
          >
            {error}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {displayedProjects.map((project, index) => (
              <motion.a
                key={project.id}
                href={`/work/${project.id}`}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={
                  inView
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 24, filter: "blur(8px)" }
                }
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 24,
                  delay: 0.04 * index,
                }}
                className="group block"
                style={{ perspective: 900 }}
              >
                <TiltCard
                  max={9}
                  lift={6}
                  className="relative block"
                  style={{ borderRadius: 0 }}
                >
                  {/* Lifted above the paper grid (z-30) so the photo
                      reads at full opacity instead of being muted by
                      the multiply/screen blend overlay. */}
                  <div
                    className="relative aspect-[4/5] overflow-hidden"
                    style={{ zIndex: 35 }}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="ink-photo h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3
                        className="text-xl sm:text-2xl"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink)",
                          lineHeight: 1,
                        }}
                      >
                        {project.title.toLowerCase()}
                      </h3>
                      <span
                        className="shrink-0 text-xs"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {project.date}
                      </span>
                    </div>
                    <div style={{ color: "var(--ink)", opacity: 0.5 }}>
                      <InkLine fade={false} thickness={0.9} />
                    </div>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {project.tags
                        .split(",")
                        .slice(0, 3)
                        .map((t) => t.trim().toLowerCase())
                        .join(" * ")}
                    </p>
                  </div>
                </TiltCard>
              </motion.a>
            ))}
          </div>
        )}

        {randomCount && (
          <div className="mt-12 text-center">
            <a href="/portfolio-s" className="btn-secondary">
              <span>{t("creations.viewAll")}</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
