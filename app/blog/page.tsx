"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"

interface Post {
  id: string
  title: string
  date: string
  excerpt: string
  tags?: string
  image?: string | null
  body: string
}

function formatDate(s: string) {
  // ISO date → "2026 · 04"
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s.toLowerCase()
  return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: Post[]) => {
        const sorted = (Array.isArray(data) ? data : []).slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
        setPosts(sorted)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <article
          className="section-container pb-24 pt-28 sm:pt-32"
          style={{ position: "relative", zIndex: 35 }}
        >
          <Link
            href="/more"
            className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            <ArrowLeft size={14} className="ink-icon" />
            <span className="ink-underline-hover">more</span>
          </Link>

          <header className="mb-12">
            <h1
              className="text-[clamp(3rem,8vw,6rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              <MotionText text="blog" split="char" stagger={0.05} />
            </h1>
            <p
              className="mt-3 max-w-xl"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              Loose notes. Methodology, hardware, taste, the time-debt
              philosophy. Updated when I have something worth writing down.
            </p>
          </header>

          <div className="mb-10 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.2} />
          </div>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>loading…</p>
          ) : posts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>nothing here yet.</p>
          ) : (
            <ul className="flex flex-col">
              {posts.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.05 * i,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b py-8"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <Link href={`/blog/${p.id}`} className="group block">
                    <div
                      className="mb-2 text-xs uppercase tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatDate(p.date)}
                      {p.tags && (
                        <>
                          &nbsp;*&nbsp;<span>{p.tags}</span>
                        </>
                      )}
                    </div>
                    <h2
                      className="text-2xl sm:text-4xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                        lineHeight: 1.05,
                      }}
                    >
                      <span className="ink-underline-hover">{p.title}</span>
                    </h2>
                    <p
                      className="mt-3 max-w-3xl text-base sm:text-lg"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-display)",
                        lineHeight: 1.55,
                      }}
                    >
                      {p.excerpt}
                    </p>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </article>
      </main>
    </PageLoader>
  )
}
