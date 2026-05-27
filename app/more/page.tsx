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
    note: "Walter Gropius opens the school in 1919, post-war, to argue that craft and engineering should be the same discipline. A century later it's still the cleanest version of that argument. (My git handle is not a coincidence.)",
  },
  {
    name: "Wabi-sabi",
    href: "https://en.wikipedia.org/wiki/Wabi-sabi",
    note: "Leonard Koren's small book is the only design treatise I keep on the shelf. The dent in the bowl is the bowl.",
  },
  {
    name: "Dieter Rams",
    href: "https://www.vitsoe.com/eu/about/good-design",
    note: "Ten principles. The discipline is asking would Rams approve before adding the second feature, and stopping when the answer is no.",
  },
  {
    name: "Caspar David Friedrich",
    href: "https://en.wikipedia.org/wiki/Wanderer_above_the_Sea_of_Fog",
    note: "Wanderer above the Sea of Fog hangs in the Kunsthalle Hamburg. I've stood in front of it twice. The second visit is the real one.",
  },
  {
    name: "František Kupka",
    href: "https://en.wikipedia.org/wiki/Franti%C5%A1ek_Kupka",
    note: "First abstract painter, depending who you ask, depending who's Czech enough to claim him. The Amorpha series is a manual for leaving realism without losing structure.",
  },
  {
    name: "Tony Garnier",
    href: "https://en.wikipedia.org/wiki/Tony_Garnier_(architect)",
    note: "Cité Industrielle, 1904 — a worker's city blueprint where every household gets a bathroom and a swimming pool. He had no idea how to actually build it. He drew it anyway.",
  },
  {
    name: "Zen",
    href: "https://en.wikipedia.org/wiki/Zen",
    note: "Less a religion than a method. Sit, watch the thinking, notice it isn't you. Cost: 12 minutes a day. Yield: nothing measurable, but everything actually.",
  },
]

const MUSIC: Item[] = [
  {
    name: "Tom Waits",
    href: "https://www.youtube.com/watch?v=PCmZBeNVy7g",
    note: "I keep Bone Machine on the shelf next to a claw hammer. Same purpose. Start with Hold On.",
  },
  {
    name: "Iron Maiden",
    href: "https://www.youtube.com/watch?v=NCceAA0fIm0",
    note: "Saw them at O2 in 2018. Worth the tickets, worth the queue, worth a half-deaf left ear for a week. Hallowed Be Thy Name is a short story.",
  },
  {
    name: "Black Sabbath",
    href: "https://www.youtube.com/watch?v=0lkir-mvjqI",
    note: "Tony Iommi loses two fingertips in a factory press at 17 and goes on to hand-build an entire genre with what's left. Disability into discipline into industry.",
  },
  {
    name: "Frank Zappa",
    href: "https://www.youtube.com/watch?v=u05PVbbI_zo",
    note: "Watermelon in Easter Hay is the cleanest goodbye anyone ever played on a guitar — he knew it was his last solo. You can hear it.",
  },
  {
    name: "Mick Jenkins",
    href: "https://open.spotify.com/album/2GuJOMaxJpvgDM5MgKZUF8",
    note: "The Water[s] saved me about a year of therapy in 2014. Still on the shortlist, still about hydration.",
  },
]

const FILM: Item[] = [
  {
    name: "David Lynch",
    href: "https://en.wikipedia.org/wiki/David_Lynch",
    note: "RIP. Mulholland Drive in the top three for me. The weather report was a fifteen-year piece of conceptual art and most people thought it was a hobby.",
  },
]

const SKATE: Item[] = [
  {
    name: "Skateboarding",
    note: "23 years on a board. Two broken bones (left wrist, right knee), neither during a trick. I am physically incapable of walking past curbs without seeing lines.",
  },
  {
    name: "Andy Anderson",
    href: "https://www.instagram.com/andyandersonsk8",
    note: "Helmet on. Switchstance everything. Old Friends Skateboards. The proof that the lifestyle is a discipline you can age into without losing it.",
  },
]

const CODE: Item[] = [
  {
    name: "John Carmack",
    href: "https://github.com/ESWAT/john-carmack-plan-archive",
    note: "The .plan files from 1996 are still the cleanest writing about programming I've read. The man works the way I'd like to work for the rest of my life.",
  },
  {
    name: "Linus Torvalds",
    href: "https://www.kernel.org/",
    note: "Linux + git, both written out of disgust at the alternatives. Best ratio of words-typed-on-a-mailing-list to dollars-of-software-shipped that anyone has ever achieved.",
  },
  {
    name: "Procedural generation",
    href: "https://en.wikipedia.org/wiki/Procedural_generation",
    note: "Rules + randomness + iteration. Maps, music, mesh, narrative. The generator is always cheaper to maintain than the asset.",
  },
  {
    name: "Garry's Mod",
    href: "https://gmod.facepunch.com/",
    note: "First place I felt powerful as a kid. The physics sandbox where bad ideas were free. Pretty sure half the engineers in my cohort can trace their interest back to wiring a thruster to a chair.",
  },
  {
    name: "Hacking",
    href: "https://en.wikipedia.org/wiki/Hacker_culture",
    note: "Finding the edge in a thing nobody built for that edge. Most of my favourite programmers are also locksmiths, in spirit if not in fact.",
  },
]

const MIND: Item[] = [
  {
    name: "Computational neuroscience",
    href: "https://en.wikipedia.org/wiki/Computational_neuroscience",
    note: "The field currently mapping the cache architecture of the human brain. We will know more about ourselves in twenty years than we have in two hundred thousand.",
  },
  {
    name: "Science × art collision",
    note: "The friction between rigour and intuition is where the work lives. Every painter I trust also reads papers. Every researcher I trust also draws.",
  },
  {
    name: "Education",
    note: "Highest-leverage civic investment available. We are currently performing it badly on purpose. (Yes, I'm picking that fight.)",
  },
  {
    name: "Research",
    note: "Slow accumulation of usable truth. The opposite of news. Most decent ideas I've had came from somebody else's footnote.",
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
    note: "20,000 hours, one form, one form, one form. Less than 1% of practitioners reach the level you'd recognise on film. Worth thinking about before you start anything serious.",
  },
  {
    name: "Ryōkan",
    href: "https://en.wikipedia.org/wiki/Ry%C5%8Dkan",
    note: "18th-century wandering monk. Wrote poems on rice paper, played temari with the village kids, refused to teach formally. Patron saint of doing the thing well and ignoring the credentials.",
  },
  {
    name: "Chess",
    href: "https://lichess.org/",
    note: "Cleanest closed system humans ever built — perfect information, no luck, just position. I sit around 1850 on lichess, which is to say I lose 60% of the games I want to win, which is to say that's the point.",
  },
  {
    name: "80,000 Hours",
    href: "https://80000hours.org/",
    note: "Career is the single biggest lever you have, with the back-of-envelope math to back it up. Read once a year and adjust accordingly.",
  },
]

const PEOPLE: Item[] = [
  {
    name: "Sammy Obeid",
    href: "https://sammyobeid.com/",
    note: "Stand-up + math degree. Did 1,001 consecutive nights of comedy. The work-rate of a serious craftsman dressed up as a clown.",
  },
  {
    name: "Ian Carroll",
    href: "https://www.youtube.com/@IanCarrollshow",
    note: "Independent journalist. Keeps pulling threads everyone else is paid to ignore. Model for what media without permission can look like.",
  },
  {
    name: "Zdislava Pokorná",
    note: "Personal. Quietly corrects my taste when I drift. Anything good on this site is partly her fault.",
  },
  {
    name: "Jan Špaček",
    note: "Personal. Shows up with the right questions, not the obvious ones. The friend you actually phone when the prototype's on fire.",
  },
]

const MISC: Item[] = [
  {
    name: "Paint",
    note: "The medium that doesn't lie about effort. You can tell where the brush hesitated.",
  },
  {
    name: "Coconuts",
    note: "Self-contained system: water, fat, fibre, shell, fuel. Try and argue against.",
  },
]

// ============= "what i'm into right now" — hand-edited, current =====

interface NowEntry {
  k: string
  v: string
}

const NOW: NowEntry[] = [
  { k: "reading",     v: "Pirsig — Zen and the Art of Motorcycle Maintenance. Third pass. Lands differently at 33." },
  { k: "building",    v: "the Sombra OS memory layer. Local works. Cloud doesn't, yet." },
  { k: "listening",   v: "Tom Waits, Bone Machine · Mick Jenkins, The Patience · Iron Maiden, Senjutsu." },
  { k: "learning",    v: "to weld. Badly. On purpose." },
  { k: "keeping",     v: "a strength routine I've held for six weeks. Knees thank you." },
  { k: "annoyed by",  v: "consultants who use the word \"vision\" without a number attached." },
]

// ============= "not great at" — anti-list, also true ================

const NOT_GREAT: string[] = [
  "sleeping before midnight",
  "finishing personal projects (this site notwithstanding)",
  "saying no when interested",
  "small talk past ninety seconds",
  "knees, after thirty",
  "coriander",
]

// ============= "what i'm fighting" — cultural irritations ============
// Drawn from the personal-blueprint sketches (firehose of falsehood,
// gerontocracy, software-engineer LARPer void, bullshit jobs, etc.).
// These are not pet peeves; they're the things I think it's worth
// spending career time pushing against.

const FIGHTING: string[] = [
  "the LARP economy — engineers who tweet more than they ship. The thing the work was supposed to be a defence against.",
  "the firehose of falsehood. Propaganda model where volume is the message and truth is a luxury good.",
  "the gerontocracy. Same hands running the same hands.",
  "bullshit jobs. Read Graeber. Then audit the calendar.",
  "consultants saying “vision” without a number attached.",
  "the LinkedIn AI parade — people pretending the box wrote the post.",
  "surveillance capitalism. Kompromat for everyone, by default.",
  "nostalgia industries. Prague tourists with the Kafka tote bag, never read a page.",
  "the podcaster gold-pan economy. Microphones in the river, prospecting for status.",
  "institutional capture. The web of red tape and routing numbers nobody notices.",
  "IKEA-manual relationships. Step three is always rebuilding the wrong thing.",
  "the slow erosion of attention. Mine first.",
]

// ============= "what bums me out" — the quieter weight ===============
// Personal, not political. The stuff a friend would only hear in
// the second half of a conversation.

const BUMS: string[] = [
  "watching my grandmother forget my face, one Sunday at a time.",
  "the time debt. Every fragment I didn’t ship, compounding.",
  "the silence after a release that didn’t land — worse, the silence when nobody noticed.",
  "my Czech rusting and not having time to sharpen it.",
  "the inverse correlation between meetings and work done.",
  "knowing the next prodigy is six years old and going to lap me.",
  "december.",
]

// ============= "what keeps me going" — the antidotes ================
// The list a friend would actually want to know.

const KEEPS: string[] = [
  "the studio before 7am with the door locked.",
  "the build going green, the test suite shutting up.",
  "my wife’s text: “u eat lunch?”",
  "the dog at the door when I get home.",
  "coffee made the slow way.",
  "the next skater landing the line I bailed on — proof it was possible.",
  "Sombra OS pulling a note from 2021 I’d forgotten saying.",
  "finishing one thing. Even small.",
  "music with riffs that don’t tire.",
  "the kid I used to be, asking nicely.",
  "a chord change you didn’t see coming.",
  "my mother’s quiet “že jo” — the Czech tag that ends an argument.",
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
  // The "updated YYYY · MM" label is computed in an effect so SSR
  // renders an empty string and the client fills it in after mount.
  // Doing it in render with `new Date()` would diverge between the
  // server build time and the visitor's clock (timezone, midnight,
  // month-boundary) and trip React's hydration check.
  const [updatedLabel, setUpdatedLabel] = useState("")
  useEffect(() => {
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        if (!Array.isArray(data)) return
        setPosts(data.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3))
      })
      .catch(() => {})
    const d = new Date()
    setUpdatedLabel(
      `updated · ${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`,
    )
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
              Not a site map. The nav has those. This is the human page — what i&rsquo;m into right now, the catalogue of inputs that shaped me, the things i&rsquo;m fighting, the ones i&rsquo;m not great at, the quieter weights, and the antidotes that keep the work moving. Scroll like you would a friend&rsquo;s notebook.
            </motion.p>
          </header>

          <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          {/* ===== NOW — hand-edited; pull request when stale ===== */}
          <section className="mb-20">
            <div className="mb-5 flex items-baseline gap-3">
              <h2
                className="text-2xl uppercase tracking-[0.3em] sm:text-3xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                — now
              </h2>
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                {updatedLabel}
              </span>
            </div>
            <dl
              className="grid gap-3 sm:gap-4 md:grid-cols-2"
              style={{ color: "var(--ink)" }}
            >
              {NOW.map((n) => (
                <div
                  key={n.k}
                  className="border-l-2 py-1.5 pl-4"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <dt
                    className="mb-0.5 text-[0.65rem] uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {n.k}
                  </dt>
                  <dd
                    className="text-base sm:text-lg"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                      lineHeight: 1.45,
                    }}
                  >
                    {n.v}
                  </dd>
                </div>
              ))}
            </dl>
            <p
              className="mt-4 text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              * hand-edited, not a feed. if it&rsquo;s stale by more than a season i&rsquo;ve probably ghosted the site.
            </p>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
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

          {/* ===== WHAT I’M FIGHTING — the cultural/political weights I want to push against ===== */}
          <MarkedList
            title="what i’m fighting"
            items={FIGHTING}
            glyph="▲"
            label="things i am pushing against"
            note="* these are the things I want to leave a dent in. nothing personal — except all of it."
          />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== NOT GREAT AT — the honest anti-list ===== */}
          <MarkedList
            title="not great at"
            items={NOT_GREAT}
            glyph="✕"
            label="things i am not great at"
            note="* the more useful list. anybody who doesn’t have one is lying about something else."
          />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== WHAT BUMS ME OUT — the quieter weight ===== */}
          <MarkedList
            title="what bums me out"
            items={BUMS}
            glyph="↓"
            label="what weighs on me"
            note="* the page wouldn’t be honest without it. these are not asks for sympathy; they’re the friction the work pushes against."
          />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== WHAT KEEPS ME GOING — the antidotes ===== */}
          <MarkedList
            title="what keeps me going"
            items={KEEPS}
            glyph="↑"
            label="what keeps me going"
            note="* the receipts. when the bums list gets long, this is what gets re-read."
          />

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

// MarkedList — the lightweight section pattern for the four
// stream-of-consciousness rails (fighting / not-great / bums /
// keeps). Each item is keyed by index+content so future duplicates
// don't collide, and the glyph carries an aria-hidden so AT users
// hear the text alone, framed by the list's aria-label.
function MarkedList({
  title,
  items,
  glyph,
  label,
  note,
}: {
  title: string
  items: string[]
  glyph: string
  label: string
  note?: string
}) {
  return (
    <section className="mb-20">
      <div className="mb-5 flex items-baseline gap-3">
        <h2
          className="text-2xl uppercase tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {title}
        </h2>
      </div>
      <ul
        aria-label={label}
        className="flex flex-col gap-1.5"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          lineHeight: 1.5,
        }}
      >
        {items.map((line, i) => (
          <li
            key={`${i}-${line}`}
            className="flex items-baseline gap-3 text-base sm:text-lg"
          >
            <span
              aria-hidden
              className="shrink-0 text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              {glyph}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {note && (
        <p
          className="mt-4 max-w-2xl text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          {note}
        </p>
      )}
    </section>
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
