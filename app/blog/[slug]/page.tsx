"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s.toLowerCase()
  return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = String(params?.slug ?? "")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: Post[]) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const post = posts.find((p) => p.id === slug) ?? null
  const next = useMemo(() => {
    if (!post) return null
    const sorted = posts.slice().sort((a, b) => (a.date < b.date ? 1 : -1))
    const i = sorted.findIndex((p) => p.id === post.id)
    return sorted[(i + 1) % sorted.length] ?? null
  }, [posts, post])

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <article
          className="section-container pb-24 pt-28 sm:pt-32"
          style={{ position: "relative", zIndex: 35 }}
        >
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            <ArrowLeft size={14} className="ink-icon" />
            <span className="ink-underline-hover">all posts</span>
          </Link>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>loading…</p>
          ) : !post ? (
            <p style={{ color: "var(--vermilion)", fontFamily: "var(--font-display)" }}>post not found.</p>
          ) : (
            <>
              <header className="mb-10 max-w-3xl">
                <div
                  className="mb-3 text-xs uppercase tracking-[0.3em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(post.date)}
                  {post.tags && (
                    <>&nbsp;*&nbsp;<span>{post.tags}</span></>
                  )}
                </div>
                <h1
                  className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  <MotionText text={post.title} split="word" stagger={0.04} from="up" />
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 text-lg sm:text-xl"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                    lineHeight: 1.55,
                  }}
                >
                  {post.excerpt}
                </motion.p>
              </header>

              <div className="mb-10 opacity-50" style={{ color: "var(--ink)" }}>
                <InkLine fade={false} thickness={1.2} />
              </div>

              <section
                className="prose-md max-w-3xl text-base sm:text-lg"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                  lineHeight: 1.65,
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
              </section>

              {next && (
                <div className="mt-16 max-w-3xl">
                  <div
                    className="mb-3 text-xs uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    * next
                  </div>
                  <Link
                    href={`/blog/${next.id}`}
                    className="text-2xl sm:text-3xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                      lineHeight: 1.1,
                    }}
                  >
                    <span className="ink-underline-hover">{next.title}</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </article>
      </main>
    </PageLoader>
  )
}
