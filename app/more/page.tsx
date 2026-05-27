"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, ExternalLink, Github, Heart } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"

// /more is no longer a site map — nav already has every internal
// page, and the hero CTAs cover the rest. Now it's a single-page
// catalogue of taste: things that have shaped how I work, with real
// notes and live links. Plus the blog rail and a couple of personal
// anchors that don't fit anywhere else.

// =====================================================================
//  "stuff i love" — real, opinionated notes per item. Each entry has
//  an optional outbound link (wikipedia, official site, video). Some
//  groups carry a small SVG mark in the blueprint style.
// =====================================================================

type Item = {
  name: string
  href?: string
  note: string
}

const AESTHETIC: Item[] = [
  {
    name: "Bauhaus",
    href: "https://en.wikipedia.org/wiki/Bauhaus",
    note: "The school where art and engineering finally agreed to share a kitchen. My git handle is Walter Gropius for a reason.",
  },
  {
    name: "Wabi-sabi",
    href: "https://en.wikipedia.org/wiki/Wabi-sabi",
    note: "Asymmetry, austerity, the acceptance of the dent in the bowl. A permission slip to stop polishing past the point of return.",
  },
  {
    name: "Dieter Rams",
    href: "https://en.wikipedia.org/wiki/Dieter_Rams",
    note: "Ten principles, one ethic — less, but better. Every prototype on my desk earns its right to exist or it goes back to the box.",
  },
  {
    name: "Caspar David Friedrich",
    href: "https://en.wikipedia.org/wiki/Caspar_David_Friedrich",
    note: "The Wanderer Above the Sea of Fog is the closest a painting has come to describing what it feels like to ship a product.",
  },
  {
    name: "František Kupka",
    href: "https://en.wikipedia.org/wiki/Franti%C5%A1ek_Kupka",
    note: "Czech, abstract before everyone else, painted music before painting music was a thing. Patron saint of Prague colour-theory.",
  },
  {
    name: "Tony Garnier",
    href: "https://en.wikipedia.org/wiki/Tony_Garnier_(architect)",
    note: "Cité Industrielle — a city, drawn in 1904, on the assumption that every worker would get a bathroom and a swimming pool. Social housing is a design problem.",
  },
  {
    name: "Zen",
    href: "https://en.wikipedia.org/wiki/Zen",
    note: "Less a religion than a method. Sit, watch the thinking, notice it isn't you. The only mental discipline that has held up under more than a decade of stress-testing.",
  },
]

const MUSIC: Item[] = [
  {
    name: "Tom Waits",
    href: "https://www.youtube.com/watch?v=PCmZBeNVy7g",
    note: "The voice of every American I never got to be. Carnival junk-yard piano. Start with Hold On.",
  },
  {
    name: "Iron Maiden",
    href: "https://www.youtube.com/watch?v=NCceAA0fIm0",
    note: "Eddie has been on duty for fifty years. Steve Harris writes long-form rock the way Tolstoy writes novels — Hallowed Be Thy Name is a short story.",
  },
  {
    name: "Black Sabbath",
    href: "https://www.youtube.com/watch?v=0lkir-mvjqI",
    note: "Iommi's missing fingertips are why metal exists. The single most copied riff catalogue in popular music.",
  },
  {
    name: "Frank Zappa",
    href: "https://www.youtube.com/watch?v=u05PVbbI_zo",
    note: "The punk who could actually read music. An instruction in how to be productive without being polite. Watermelon in Easter Hay is the closer.",
  },
  {
    name: "Mick Jenkins",
    href: "https://open.spotify.com/album/2GuJOMaxJpvgDM5MgKZUF8",
    note: "The Water[s] is the rare hip-hop record where the conceit (drink more water) is also a structural device and a discipline. Easily the most-replayed album of my last decade.",
  },
]

const FILM: Item[] = [
  {
    name: "David Lynch",
    href: "https://en.wikipedia.org/wiki/David_Lynch",
    note: "Weather report every morning for eighteen years, transcendental meditation, Mulholland Drive in my top three. RIP. The closest the medium got to dreaming on purpose.",
  },
]

const SKATE: Item[] = [
  {
    name: "Skateboarding",
    note: "The only sport that taught me what physics actually felt like — and the only one where failing more than landing is the entire point.",
  },
  {
    name: "Andy Anderson",
    href: "https://www.instagram.com/andyandersonsk8",
    note: "Switchstance everything. Helmet on always. Teaches kids. Living proof that the discipline can age cleanly.",
  },
]

const CODE: Item[] = [
  {
    name: "John Carmack",
    href: "https://github.com/id-Software",
    note: "Doom, Quake, the .plan files. The proof that one person who refuses to stop working can drag an industry forward.",
  },
  {
    name: "Linus Torvalds",
    href: "https://www.kernel.org/",
    note: "Linux, git, the bluntness. Wrote the version-control system the rest of us are still using, and didn't ask permission first.",
  },
  {
    name: "Procedural generation",
    href: "https://en.wikipedia.org/wiki/Procedural_generation",
    note: "Rules + randomness + iteration. Nature's API. Maps, music, mesh, narrative — every domain rewards a generator.",
  },
  {
    name: "Garry's Mod",
    href: "https://gmod.facepunch.com/",
    note: "The physics sandbox that taught a whole generation of nerds to think with constraints. Probably the most important game ever shipped.",
  },
  {
    name: "Hacking",
    href: "https://en.wikipedia.org/wiki/Hacker_culture",
    note: "The discipline of finding the edge in a thing nobody built for that edge. Equal parts curiosity and impatience.",
  },
]

const MIND: Item[] = [
  {
    name: "Computational neuroscience",
    href: "https://en.wikipedia.org/wiki/Computational_neuroscience",
    note: "The field that's currently mapping the cache architecture of the human brain. Probably the closest we'll get to debugging ourselves.",
  },
  {
    name: "Science × art collision",
    note: "The productive friction between rigour and intuition. The best engineers I know also draw. The best painters I know also debug.",
  },
  {
    name: "Education",
    note: "The highest-leverage thing a society can do, and most of the time we settle for a building with a roof on it.",
  },
  {
    name: "Research",
    note: "The slow accumulation of usable truth. The opposite of news.",
  },
  {
    name: "Learning",
    note: "The only durable skill. Everything else gets automated, deprecated, or beaten by someone younger.",
  },
]

const PRACTICE: Item[] = [
  {
    name: "Shaolin method",
    href: "https://en.wikipedia.org/wiki/Shaolin_kung_fu",
    note: "20,000 hours, one form, one form, one form. The model for any practice worth taking seriously.",
  },
  {
    name: "Ryōkan",
    href: "https://en.wikipedia.org/wiki/Ry%C5%8Dkan",
    note: "Eighteenth-century wandering monk-poet. Wrote about playing temari with the village kids when he wasn't on the mountain. Patron saint of doing one thing well and ignoring the noise.",
  },
  {
    name: "Chess",
    href: "https://lichess.org/",
    note: "The cleanest closed system humans ever built. Perfect information, no luck, just position. You find out a lot about yourself by losing a few hundred times.",
  },
  {
    name: "80,000 Hours",
    href: "https://80000hours.org/",
    note: "Back-of-envelope claim: your career is the single biggest lever you have, with the math to back it up. Worth a slow read.",
  },
]

const PEOPLE: Item[] = [
  {
    name: "Sammy Obeid",
    href: "https://sammyobeid.com/",
    note: "Stand-up + math degree. Did 1,001 consecutive nights of comedy. The work-rate of a serious craftsman, dressed up as a clown.",
  },
  {
    name: "Ian Carroll",
    href: "https://www.youtube.com/@IanCarrollshow",
    note: "The independent journalist who keeps pulling on the threads everyone else is paid to ignore. A model for what media without permission can look like.",
  },
  {
    name: "Zdislava Pokorná",
    note: "Personal. Someone whose taste quietly corrects mine when I drift.",
  },
  {
    name: "Jan Špaček",
    note: "Personal. One of the few who shows up with the right questions, not the obvious ones.",
  },
]

const MISC: Item[] = [
  {
    name: "Paint",
    note: "The medium that doesn't lie about effort. You can tell where the brush hesitated.",
  },
  {
    name: "Coconuts",
    note: "Self-contained system: water, fat, fibre, shell, fuel. The only ingredient I'd happily take to a desert island.",
  },
]

const ANCHORS: Array<{ k: string; v: string }> = [
  { k: "my dog",        v: "a tiny menace who tested every UX prototype with her teeth." },
  { k: "my wife",       v: "the keel. quiet. patient. corrects my pitch when I drift." },
  { k: "my mother",     v: "she taught me to read drawings before I could read words." },
  { k: "my skateboard", v: "an old indy-trucked deck. taught me about commitment before any boss did." },
  { k: "my values",     v: "honesty over politeness. shipping over polish. craft over speed. people over performance." },
]

const OUT_LINKS: Array<{ href: string; title: string; sub?: string }> = [
  { href: "https://laifea.app",                                   title: "laifea.app",  sub: "where i ship the real ones" },
  { href: "https://github.com/WalterGropius",                     title: "github" },
  { href: "https://linkedin.com/in/zenbauhaus",                   title: "linkedin" },
  { href: "https://instagram.com/y4ngyin",                        title: "instagram" },
  { href: "https://soundcloud.com/mczenbauhaus",                  title: "soundcloud", sub: "mc zenbauhaus" },
  { href: "https://sketchfab.com/zenbauhaus",                     title: "sketchfab" },
  { href: "https://open.spotify.com/album/1V3m6SMvu8Bodq4scdqD3o",title: "cpt. demo ep", sub: "cover by me" },
]

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  tags?: string
}

export default function MorePage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  useEffect(() => {
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        if (!Array.isArray(data)) return
        setPosts(data.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3))
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
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />

        <article
          className="section-container pb-24 pt-28 sm:pt-32"
          style={{ position: "relative", zIndex: 35 }}
        >
          <header className="mb-16">
            <h1
              className="text-[clamp(3rem,8vw,6rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
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
              Not a site map — the nav already has those. A catalogue of inputs instead: the work, the thinkers, the records, the disciplines that have left fingerprints on how I build.
            </motion.p>
          </header>

          <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          {/* ===== STUFF I LOVE ===== */}
          <section className="mb-24">
            <div className="mb-8 flex items-baseline gap-4">
              <h2
                className="text-4xl sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                <span className="ink-underline">stuff i love</span>
              </h2>
              <BauhausMark />
            </div>
            <p
              className="mb-12 max-w-2xl"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                lineHeight: 1.55,
              }}
            >
              The shortlist of people / movements / objects / disciplines that I
              keep referencing in conversation and in code. Not an exhaustive
              taste-dump; just the ones that have actually shifted my work.
            </p>

            <Sub title="aesthetic & design" items={AESTHETIC} mark={<RamsGrid />} />
            <Sub
              title="music"
              items={MUSIC}
              mark={<TuningFork />}
              afterBlock={<TomWaitsEmbed />}
            />
            <Sub title="film" items={FILM} mark={<EyeMark />} />
            <Sub title="skating" items={SKATE} mark={<HillBombMark />} />
            <Sub title="code & tools" items={CODE} mark={<NodeMark />} />
            <Sub title="mind & science" items={MIND} mark={<BrainMark />} />
            <Sub title="discipline & practice" items={PRACTICE} mark={<EnsoMark />} />
            <Sub title="people" items={PEOPLE} mark={<PinMark />} />
            <Sub title="misc" items={MISC} mark={<CoconutMark />} />
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== ELSEWHERE ===== */}
          <section className="mb-20">
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
                          aria-hidden="true"
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
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== BLOG ===== */}
          <section className="mb-20">
            <SectionTitle>blog · loose notes</SectionTitle>
            <div className="flex flex-col gap-8">
              {posts.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  loading…
                </p>
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

          {/* ===== ANCHORS ===== */}
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

// =====================================================================
//  Sub-section + entry rendering
// =====================================================================

function Sub({
  title,
  items,
  mark,
  afterBlock,
}: {
  title: string
  items: Item[]
  mark?: React.ReactNode
  afterBlock?: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-baseline gap-3">
        <h3
          className="text-xl uppercase tracking-[0.3em] sm:text-2xl"
          style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
        >
          — {title}
        </h3>
        {mark && (
          <span className="ml-1" style={{ color: "var(--ink)", opacity: 0.7 }}>
            {mark}
          </span>
        )}
      </div>
      <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        {items.map((it) => (
          <li key={it.name}>
            <Entry item={it} />
          </li>
        ))}
      </ul>
      {afterBlock}
    </section>
  )
}

function Entry({ item }: { item: Item }) {
  const TitleEl = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-1.5"
      style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
    >
      <span className="ink-underline-hover">{item.name}</span>
      <ExternalLink size={12} className="ink-icon translate-y-[1px] opacity-60" />
    </a>
  ) : (
    <span
      style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
    >
      {item.name}
    </span>
  )

  return (
    <div className="flex flex-col gap-1">
      <div className="text-lg sm:text-xl" style={{ lineHeight: 1.1 }}>
        {TitleEl}
      </div>
      <p
        className="text-sm sm:text-base"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          lineHeight: 1.5,
        }}
      >
        {item.note}
      </p>
    </div>
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

// =====================================================================
//  Embeds
// =====================================================================

function TomWaitsEmbed() {
  return (
    <figure
      className="mt-8 max-w-2xl"
      style={{ position: "relative", zIndex: 36 }}
    >
      <div
        className="relative"
        style={{
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
          aspectRatio: "16 / 9",
        }}
      >
        <iframe
          src="https://www.youtube.com/embed/PCmZBeNVy7g?rel=0"
          title="Tom Waits — Hold On"
          // The embed is below the fold for most viewers. Lazy-load
          // so the youtube player iframe doesn't block initial paint.
          // Also trim the `allow` list to only what the embed
          // actually needs (drop accelerometer / clipboard-write).
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="block h-full w-full"
        />
      </div>
      <figcaption
        className="mt-2 text-xs italic sm:text-sm"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
      >
        * Tom Waits — Hold On. The reason to keep the radio on.
      </figcaption>
    </figure>
  )
}

// =====================================================================
//  Inline blueprint marks — small ink sketches that prefix each
//  subsection heading. Drawn with currentColor + the ink-wobble
//  filter so they sit in the site's hand-drawn aesthetic.
// =====================================================================

function Mark({ children, w = 36, h = 36 }: { children: React.ReactNode; w?: number; h?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "url(#ink-wobble)" }}
    >
      {children}
    </svg>
  )
}

function BauhausMark() {
  // Tiny abstract: a square + circle + triangle stacked (the
  // bauhaus' 3-primaries-3-primitives idea).
  return (
    <Mark w={48} h={48}>
      <rect x="4" y="14" width="14" height="14" />
      <circle cx="32" cy="22" r="7" />
      <path d="M14 44 L26 28 L38 44 Z" />
    </Mark>
  )
}

function RamsGrid() {
  // The Braun-radio dial mark.
  return (
    <Mark>
      <rect x="3" y="3" width="30" height="30" />
      <circle cx="18" cy="18" r="9" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
      <path d="M18 9 L18 6" />
      <path d="M18 27 L18 30" />
      <path d="M9 18 L6 18" />
      <path d="M27 18 L30 18" />
    </Mark>
  )
}

function TuningFork() {
  return (
    <Mark>
      <path d="M14 4 L14 18" />
      <path d="M22 4 L22 18" />
      <rect x="11" y="18" width="14" height="4" />
      <path d="M18 22 L18 32" />
      <path d="M3 28 Q 10 22 18 28 T 33 28" />
    </Mark>
  )
}

function EyeMark() {
  return (
    <Mark>
      <path d="M3 18 Q 18 4 33 18 Q 18 32 3 18 Z" />
      <circle cx="18" cy="18" r="5" />
      <circle cx="18" cy="18" r="1.6" fill="currentColor" />
    </Mark>
  )
}

function HillBombMark() {
  // Steep slope into vanishing point.
  return (
    <Mark>
      <path d="M3 6 L33 30" />
      <path d="M33 6 L3 30" />
      <path d="M3 30 L33 30" />
      <circle cx="18" cy="22" r="2" fill="currentColor" />
    </Mark>
  )
}

function NodeMark() {
  // Two small nodes with a bezier — the Unreal blueprint vibe.
  return (
    <Mark>
      <rect x="3" y="10" width="10" height="8" />
      <rect x="23" y="20" width="10" height="8" />
      <path d="M13 14 C 19 14, 18 24, 23 24" />
      <circle cx="13" cy="14" r="1.5" fill="currentColor" />
      <circle cx="23" cy="24" r="1.5" fill="currentColor" />
    </Mark>
  )
}

function BrainMark() {
  return (
    <Mark>
      <path d="M6 22 Q 6 10 18 8 Q 30 10 30 22 Q 30 30 24 30 L 12 30 Q 6 30 6 22 Z" />
      <path d="M12 16 Q 18 20 24 16" />
      <path d="M12 22 Q 18 26 24 22" />
    </Mark>
  )
}

function EnsoMark() {
  // Open zen circle.
  return (
    <Mark>
      <path d="M30 18 a 12 12 0 1 0 -12 12" />
    </Mark>
  )
}

function PinMark() {
  return (
    <Mark>
      <circle cx="18" cy="13" r="4" />
      <path d="M18 17 L18 30" />
      <path d="M18 30 L14 33" />
      <path d="M18 30 L22 33" />
    </Mark>
  )
}

function CoconutMark() {
  return (
    <Mark>
      <circle cx="18" cy="18" r="12" />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" />
      <circle cx="18" cy="13" r="1.4" fill="currentColor" />
      <circle cx="22" cy="14" r="1.4" fill="currentColor" />
      <path d="M8 18 Q 18 26 28 18" />
    </Mark>
  )
}
