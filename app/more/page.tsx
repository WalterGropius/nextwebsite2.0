"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ExternalLink, Github, ArrowRight, Heart } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { TiltCard } from "@/components/tilt-card"

// Site map — internal routes worth surfacing.
const SITE_LINKS: Array<{ href: string; title: string; sub: string }> = [
  { href: "/landing",     title: "about",       sub: "the front page" },
  { href: "/portfolio-s", title: "work",        sub: "every project" },
  { href: "/reel",        title: "reel",        sub: "video work, in motion" },
  { href: "/sketchfab",   title: "3d",          sub: "interactive models" },
  { href: "/cv",          title: "cv",          sub: "the long résumé" },
  { href: "/blog",        title: "blog",        sub: "loose notes" },
  { href: "/contact",     title: "contact",     sub: "say hi" },
  { href: "/games/proportion", title: "eye trainer · proportion", sub: "guess the aspect ratio" },
  { href: "/games/angles",     title: "eye trainer · angles",     sub: "trace the shape" },
  { href: "/games/scale-vr",   title: "scale vr",                 sub: "estimate size in 3d (webxr)" },
  { href: "/experiments/flow", title: "flow",                     sub: "200k particles, webgpu + tsl" },
  { href: "/boids",       title: "boids",       sub: "flocking simulation, three.js" },
  { href: "/blob",        title: "blob",        sub: "shader playground" },
  { href: "/art",         title: "art",         sub: "still and moving images" },
]

const OUT_LINKS: Array<{ href: string; title: string; sub?: string }> = [
  { href: "https://laifea.app",                       title: "laifea.app",  sub: "where i ship the real ones" },
  { href: "https://github.com/WalterGropius",         title: "github" },
  { href: "https://linkedin.com/in/zenbauhaus",       title: "linkedin" },
  { href: "https://instagram.com/y4ngyin",            title: "instagram" },
  { href: "https://soundcloud.com/mczenbauhaus",      title: "soundcloud", sub: "mc zenbauhaus" },
  { href: "https://sketchfab.com/zenbauhaus",         title: "sketchfab" },
  { href: "https://open.spotify.com/album/1V3m6SMvu8Bodq4scdqD3o", title: "cpt. demo ep", sub: "cover by me" },
]

// Blog excerpts now live in /public/blogs.json and are loaded at
// mount. We surface the three most recent here with links into the
// full /blog index + per-post pages.
interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  tags?: string
}

// The "personal anchors" rail — short notes on the things that come
// up enough to matter.
const ANCHORS: Array<{ k: string; v: string }> = [
  { k: "my dog",       v: "a tiny menace who tested every UX prototype with her teeth." },
  { k: "my wife",      v: "the keel. quiet. patient. corrects my pitch when I drift." },
  { k: "my mother",    v: "she taught me to read drawings before I could read words." },
  { k: "my skateboard",v: "an old indy-trucked deck. it taught me about commitment before any boss did." },
  { k: "my values",    v: "honesty over politeness. shipping over polish. craft over speed. people over performance." },
]

// Random featured projects from portfolio.json — picked on mount so
// the page feels different on every visit.
interface ProjectItem {
  id: number
  image: string
  title: string
  description: string
  date: string
  link?: string
  tags: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MorePage() {
  const [picks, setPicks] = useState<ProjectItem[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetch("/portfolio.json")
      .then((r) => r.json())
      .then((data: ProjectItem[]) => {
        if (Array.isArray(data)) setPicks(shuffle(data).slice(0, 4))
      })
      .catch(() => {})
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        if (!Array.isArray(data)) return
        const sorted = data
          .slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 3)
        setPosts(sorted)
      })
      .catch(() => {})
  }, [])

  const fmtDate = (s: string) => {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s.toLowerCase()
    return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`
  }

  return (
    <PageLoader>
      <main
        className="min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />

        <article
          className="section-container pb-24 pt-28 sm:pt-32"
          style={{ position: "relative", zIndex: 35 }}
        >
          <header className="mb-16">
            <h1
              className="text-[clamp(3rem,8vw,6rem)] leading-[0.9]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
              }}
            >
              <MotionText text="more" split="char" stagger={0.05} />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-2xl text-lg sm:text-xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              the stuff that doesn&rsquo;t fit anywhere else — featured work, every link i ship under, the blog, a handful of personal anchors, and a few experiments.
            </motion.p>
          </header>

          <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          {/* ===== Random featured projects ===== */}
          <section className="mb-20">
            <SectionTitle>featured · random</SectionTitle>
            {picks.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {picks.map((p) => (
                  <motion.a
                    key={p.id}
                    href={`/work/${p.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="group block"
                    // z-index on motion.a — Framer's animated `y`
                    // creates a stacking context, so the lift has
                    // to live on the outermost element.
                    style={{ position: "relative", zIndex: 36 }}
                  >
                    <TiltCard max={8} lift={5} className="relative block">
                      <div className="relative aspect-[4/5] overflow-hidden" style={{ zIndex: 35 }}>
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          className="ink-photo h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="mt-2">
                        <div
                          className="text-base sm:text-lg"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1 }}
                        >
                          {p.title.toLowerCase()}
                        </div>
                        <div
                          className="mt-1 text-xs"
                          style={{
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {p.date.toLowerCase()}
                        </div>
                      </div>
                    </TiltCard>
                  </motion.a>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                loading…
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/portfolio-s"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
              >
                <span className="ink-underline-hover">all work</span>
                <ArrowRight size={14} className="ink-icon" />
              </Link>
            </div>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== Site map + outbound links ===== */}
          <section className="mb-20 grid gap-12 md:grid-cols-2">
            <div>
              <SectionTitle>in the site</SectionTitle>
              <ul className="flex flex-col">
                {SITE_LINKS.map((l) => (
                  <li
                    key={l.href}
                    className="border-b py-3"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <Link
                      href={l.href}
                      className="group flex items-baseline justify-between gap-4"
                    >
                      <span
                        className="text-lg sm:text-xl"
                        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                      >
                        <span className="ink-underline-hover">{l.title}</span>
                      </span>
                      <span
                        className="text-xs sm:text-sm"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                      >
                        {l.sub}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle>elsewhere</SectionTitle>
              <ul className="flex flex-col">
                {OUT_LINKS.map((l) => (
                  <li
                    key={l.href}
                    className="border-b py-3"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline justify-between gap-4"
                    >
                      <span
                        className="text-lg sm:text-xl"
                        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                      >
                        <span className="ink-underline-hover">{l.title}</span>
                        {l.title === "laifea.app" && (
                          <Heart
                            size={14}
                            className="ink-icon ml-2 inline-block"
                            style={{ color: "var(--vermilion, #ee4a44)" }}
                            fill="currentColor"
                          />
                        )}
                      </span>
                      <span
                        className="inline-flex items-baseline gap-2 text-xs sm:text-sm"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                      >
                        {l.sub}
                        <ExternalLink size={12} className="ink-icon" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== Blog (latest three, full posts live in /blog) ===== */}
          <section className="mb-20">
            <SectionTitle>blog · loose notes</SectionTitle>
            <div className="flex flex-col gap-8">
              {posts.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>loading…</p>
              ) : (
                posts.map((p) => (
                  <article key={p.id}>
                    <div
                      className="mb-2 text-xs uppercase tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {fmtDate(p.date)}
                      {p.tags && <>&nbsp;*&nbsp;{p.tags}</>}
                    </div>
                    <Link href={`/blog/${p.id}`} className="group block">
                      <h3
                        className="text-2xl sm:text-3xl"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink)",
                          lineHeight: 1.1,
                        }}
                      >
                        <span className="ink-underline-hover">{p.title}</span>
                      </h3>
                    </Link>
                    <p
                      className="mt-3 max-w-3xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--text-muted)",
                        lineHeight: 1.55,
                      }}
                    >
                      {p.excerpt}
                    </p>
                  </article>
                ))
              )}
            </div>
            <div className="mt-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
              >
                <span className="ink-underline-hover">all posts</span>
                <ArrowRight size={14} className="ink-icon" />
              </Link>
            </div>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== Personal anchors ===== */}
          <section className="mb-20">
            <SectionTitle>anchors</SectionTitle>
            <dl
              className="grid gap-4 sm:gap-6 md:grid-cols-2"
              style={{ color: "var(--ink)" }}
            >
              {ANCHORS.map((a) => (
                <div
                  key={a.k}
                  className="border-l-2 py-2 pl-4"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <dt
                    className="mb-1 text-xs uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {a.k}
                  </dt>
                  <dd
                    className="text-base sm:text-lg"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                      lineHeight: 1.55,
                    }}
                  >
                    {a.v}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ===== Footer ===== */}
          <footer
            className="mt-20 flex flex-col items-baseline justify-between gap-2 text-xs sm:flex-row"
            style={{ color: "var(--text-muted)" }}
          >
            <a
              href="https://github.com/WalterGropius"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github size={12} className="ink-icon" />
              <span>open-source me</span>
            </a>
            <span>© {new Date().getFullYear()} · eliáš bauer</span>
          </footer>
        </article>
      </main>
    </PageLoader>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2
        className="text-3xl sm:text-4xl"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        <span className="ink-underline">{children}</span>
      </h2>
    </div>
  )
}
