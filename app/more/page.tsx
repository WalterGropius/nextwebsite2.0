"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, ExternalLink, Github } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"

// /more is the off-the-record half of the site. Not a site map — the
// nav has those. A catalogue of inputs that shaped the work, written
// in the same flat, specific voice as the art book: say the thing,
// don't sell it. Layout breathes — featured items get an image and a
// side of the page; the rest stay as compact notes so the rhythm
// never settles into a wall.

type Item = {
  name: string
  href?: string
  note: string
  // featured items carry an image (or a self-hosted video) and break
  // to their own row, alternating which side they hug. Ratios vary on
  // purpose so the column never settles into a tidy strip.
  img?: string
  video?: string
  ratio?: string
  // every outbound/featured link gets a plain-spoken CTA, three words
  // max — a real button, not a hairline arrow you have to hunt for.
  cta?: string
}

const AESTHETIC: Item[] = [
  {
    name: "Caspar David Friedrich",
    href: "https://en.wikipedia.org/wiki/Wanderer_above_the_Sea_of_Fog",
    note: "Wanderer above the Sea of Fog, in the Kunsthalle Hamburg. I've stood in front of it twice. The second time was the real one.",
    img: "/more/wanderer.jpg",
    ratio: "4 / 5",
    cta: "read it",
  },
  {
    name: "František Kupka",
    href: "https://en.wikipedia.org/wiki/Franti%C5%A1ek_Kupka",
    note: "First abstract painter, if you ask a Czech. Amorpha, Fugue in Two Colors is a manual for leaving realism without losing structure.",
    img: "/more/kupka-amorpha.jpg",
    ratio: "1 / 1",
    cta: "the painter",
  },
  {
    name: "Bauhaus",
    href: "https://en.wikipedia.org/wiki/Bauhaus",
    note: "Gropius opened the school in 1919 to argue that craft and engineering are one discipline. Still the cleanest version of that argument. My git handle isn't a coincidence.",
  },
  {
    name: "Wabi-sabi",
    href: "https://en.wikipedia.org/wiki/Wabi-sabi",
    note: "Koren's small book is the only design treatise I keep on the shelf. The dent in the bowl is the bowl.",
  },
  {
    name: "Dieter Rams",
    href: "https://www.vitsoe.com/eu/about/good-design",
    note: "Ten principles. The discipline is asking would Rams keep it before adding the second feature — and stopping when the answer is no.",
  },
  {
    name: "Tony Garnier",
    href: "https://en.wikipedia.org/wiki/Tony_Garnier_(architect)",
    note: "Cité Industrielle, 1904 — a workers' city where every home gets a bathroom and a pool. He had no idea how to build it. He drew it anyway.",
  },
  {
    name: "Zen",
    href: "https://en.wikipedia.org/wiki/Zen",
    note: "Less a religion than a method. Sit, watch the thinking, notice it isn't you. Twelve minutes a day, nothing measurable, everything changed.",
  },
]

const MUSIC: Item[] = [
  {
    name: "Tom Waits",
    href: "https://www.youtube.com/watch?v=PCmZBeNVy7g",
    note: "Bone Machine lives next to the claw hammer. Same job. Start with Hold On.",
  },
  {
    name: "Iron Maiden",
    href: "https://www.youtube.com/watch?v=NCceAA0fIm0",
    note: "O2, 2018 — worth the queue and a week of half-deaf left ear. Hallowed Be Thy Name is a short story.",
  },
  {
    name: "Black Sabbath",
    href: "https://www.youtube.com/watch?v=0lkir-mvjqI",
    note: "Iommi lost two fingertips in a factory press at seventeen and built a genre with what was left. Disability into discipline into industry.",
    img: "/art/decay/021.webp",
    ratio: "4 / 5",
    cta: "play it",
  },
  {
    name: "Frank Zappa",
    href: "https://www.youtube.com/watch?v=u05PVbbI_zo",
    note: "Watermelon in Easter Hay — he knew it was his last solo, and you can hear it. The cleanest goodbye anyone played on a guitar.",
  },
  {
    name: "Mick Jenkins",
    href: "https://open.spotify.com/album/2GuJOMaxJpvgDM5MgKZUF8",
    note: "The Water[s] saved me about a year of therapy in 2014. Still on the list, still about hydration.",
  },
]

const FILM: Item[] = [
  {
    name: "David Lynch",
    href: "https://en.wikipedia.org/wiki/David_Lynch",
    note: "RIP. Mulholland Drive, top three. The daily weather report was a fifteen-year piece of conceptual art most people filed under hobby.",
    img: "/art/reflections/012.webp",
    ratio: "21 / 9",
    cta: "the man",
  },
]

const SKATE: Item[] = [
  {
    name: "Skateboarding",
    note: "Twenty-three years on a board. Two broken bones, neither on a trick. I can't walk past a curb without reading the line.",
    img: "/art/landscape/044.webp",
    ratio: "3 / 2",
  },
  {
    name: "Andy Anderson",
    href: "https://www.instagram.com/andyandersonsk8",
    note: "Helmet on, switch everything, Old Friends Skateboards. Proof the lifestyle is a discipline you age into, not out of.",
    cta: "follow",
  },
]

const CODE: Item[] = [
  {
    name: "John Carmack",
    href: "https://github.com/ESWAT/john-carmack-plan-archive",
    note: ".plan files from 1996, still the cleanest writing about programming I've read. He works the way I'd like to work for the rest of my life.",
  },
  {
    name: "Linus Torvalds",
    href: "https://www.kernel.org/",
    note: "Linux and git, both written out of disgust at the alternatives. Best ratio of mailing-list words to shipped software anyone's managed.",
  },
  {
    name: "Procedural generation",
    href: "https://en.wikipedia.org/wiki/Procedural_generation",
    note: "Rules plus randomness plus iteration — maps, music, mesh, narrative. The generator is always cheaper to keep than the asset.",
    img: "/art/weird/088.webp",
    ratio: "1 / 1",
    cta: "read it",
  },
  {
    name: "Garry's Mod",
    href: "https://gmod.facepunch.com/",
    note: "First place I felt powerful as a kid. A physics sandbox where bad ideas were free. Half my cohort traces back to wiring a thruster to a chair.",
  },
  {
    name: "Hacking",
    href: "https://en.wikipedia.org/wiki/Hacker_culture",
    note: "Finding the edge in a thing nobody built for that edge. Most programmers I trust are locksmiths in spirit, if not in fact.",
  },
]

const MIND: Item[] = [
  {
    name: "Computational neuroscience",
    href: "https://en.wikipedia.org/wiki/Computational_neuroscience",
    note: "Currently mapping the cache architecture of the brain. We'll know more about ourselves in twenty years than in the last two hundred thousand.",
    img: "/art/surfaces/120.webp",
    ratio: "4 / 3",
    cta: "read it",
  },
  {
    name: "Science × art",
    note: "The friction between rigour and intuition is where the work lives. Every painter I trust reads papers; every researcher I trust draws.",
  },
  {
    name: "Education",
    note: "The highest-leverage civic investment we have, performed badly on purpose. Yes, that's a fight I'll pick.",
  },
  {
    name: "Research",
    note: "Slow accumulation of usable truth — the opposite of news. Most decent ideas I've had came from someone else's footnote.",
  },
  {
    name: "Learning",
    note: "The only durable skill. Everything else gets automated, deprecated, or out-aged.",
  },
]

const PRACTICE: Item[] = [
  {
    name: "Shaolin method",
    href: "https://en.wikipedia.org/wiki/Shaolin_kung_fu",
    note: "Twenty thousand hours, one form. Under 1% reach the level you'd recognise on film. Worth knowing before you start anything serious.",
    img: "/art/decay/033.webp",
    ratio: "3 / 4",
    cta: "read it",
  },
  {
    name: "Ryōkan",
    href: "https://en.wikipedia.org/wiki/Ry%C5%8Dkan",
    note: "Wandering monk, eighteenth century. Wrote on rice paper, played ball with the village kids, refused to teach formally. Patron saint of doing it well and ignoring the credential.",
  },
  {
    name: "Chess",
    href: "https://lichess.org/",
    note: "The cleanest closed system we ever built — perfect information, no luck, just position. About 1850 on lichess, which means I lose 60% of the games I want. That's the point.",
  },
  {
    name: "80,000 Hours",
    href: "https://80000hours.org/",
    note: "Career is the biggest lever you have, with the math to prove it. Read once a year, adjust.",
  },
]

const PEOPLE: Item[] = [
  {
    name: "Sammy Obeid",
    href: "https://sammyobeid.com/",
    note: "Stand-up plus a maths degree, 1,001 consecutive nights. A serious craftsman dressed as a clown.",
    cta: "the act",
  },
  {
    name: "Ian Carroll",
    href: "https://www.youtube.com/@IanCarrollshow",
    note: "Independent journalist who keeps pulling the threads everyone else is paid to leave alone.",
    cta: "the show",
  },
  {
    name: "Zdislava Pokorná",
    note: "Personal. Quietly corrects my taste when I drift. Anything good here is partly her doing.",
  },
  {
    name: "Jan Špaček",
    note: "Personal. Shows up with the right question, not the obvious one. The one you phone when the prototype's on fire.",
  },
]

const MISC: Item[] = [
  {
    name: "Paint",
    note: "The medium that won't lie about effort. You can see where the brush hesitated.",
    img: "/art/acrylic/006.webp",
    ratio: "4 / 3",
  },
  {
    name: "Coconuts",
    note: "A self-contained system — water, fat, fibre, shell, fuel. Try and argue against it.",
    img: "/more/coconut.jpg",
    ratio: "2 / 3",
  },
]

// ============= "what i'm into right now" — hand-edited, current =====

interface NowEntry {
  k: string
  v: string
}

const NOW: NowEntry[] = [
  { k: "reading",    v: "Pirsig — Zen and the Art of Motorcycle Maintenance. Third pass; lands differently at 33." },
  { k: "building",   v: "the Sombra OS memory layer. Local works. Cloud doesn't — yet." },
  { k: "listening",  v: "Tom Waits, Bone Machine · Mick Jenkins, The Patience · Iron Maiden, Senjutsu." },
  { k: "learning",   v: "to weld. Badly, on purpose." },
  { k: "keeping",    v: "a strength routine, six weeks in. Knees grateful." },
  { k: "annoyed by", v: "the word “vision” with no number attached to it." },
]

// ============= "not great at" — anti-list, also true ================

const NOT_GREAT: string[] = [
  "sleeping before midnight",
  "finishing personal projects (present company excepted)",
  "saying no when I'm interested",
  "small talk past ninety seconds",
  "knees, after thirty",
  "coriander",
]

// ============= "what i'm fighting" — cultural irritations ============

const FIGHTING: string[] = [
  "the LARP economy — engineers who tweet more than they ship. The thing the work was meant to be a defence against.",
  "the firehose of falsehood — volume as the message, truth priced like a luxury.",
  "the gerontocracy: the same hands on the same levers.",
  "bullshit jobs. Read Graeber, then audit the calendar.",
  "“vision” decks with no number in them.",
  "the LinkedIn AI parade — people pretending the box didn't write the post.",
  "surveillance capitalism: kompromat on everyone, by default.",
  "nostalgia industries — the Kafka tote bag, never a page read.",
  "the podcast gold rush — microphones in the river, panning for status.",
  "institutional capture: the quiet web of red tape and routing numbers.",
  "flat-pack relationships, where step three is always rebuilding the wrong thing.",
  "the slow erosion of attention. Mine first.",
]

// ============= bums / keeps — the quieter weight and its antidote ====

const BUMS: string[] = [
  "my grandmother forgetting my face, one Sunday at a time.",
  "the time debt — every fragment I didn't ship, compounding.",
  "the silence after a release that didn't land. Worse: the silence when no one noticed.",
  "my Czech rusting with no time to sharpen it.",
  "the inverse curve between meetings and work done.",
  "knowing the next prodigy is six and about to lap me.",
  "December.",
]

const KEEPS: string[] = [
  "the studio before 7am, door locked.",
  "the build going green, the test suite finally quiet.",
  "my wife's text: “u eat lunch?”",
  "the dog at the door when I get home.",
  "coffee made the slow way.",
  "the next skater landing the line I bailed — proof it was possible.",
  "Sombra pulling a note from 2021 I'd forgotten writing.",
  "finishing one thing, even a small one.",
  "riffs that don't tire.",
  "the kid I was, asking nicely.",
  "a chord change I didn't see coming.",
  "my mother's quiet “že jo” — the Czech tag that ends an argument.",
]

const ANCHORS: Array<{ k: string; v: string }> = [
  { k: "my dog",        v: "a small menace who tested every prototype with her teeth." },
  { k: "my wife",       v: "the keel — quiet, patient, corrects my pitch when I drift." },
  { k: "my mother",     v: "taught me to read drawings before I could read words." },
  { k: "my skateboard", v: "an old indy-trucked deck. Taught me commitment before any boss did." },
  { k: "my values",     v: "honesty over politeness. shipping over polish. craft over speed. people over performance." },
]

const OUT_LINKS: Array<{ href: string; title: string; sub?: string; cta: string }> = [
  { href: "https://laifea.app",                                    title: "laifea.app",   sub: "where i ship the real ones", cta: "open it" },
  { href: "https://github.com/WalterGropius",                      title: "github",                                         cta: "see code" },
  { href: "https://linkedin.com/in/zenbauhaus",                    title: "linkedin",                                       cta: "connect" },
  { href: "https://instagram.com/y4ngyin",                         title: "instagram",                                      cta: "follow" },
  { href: "https://soundcloud.com/mczenbauhaus",                   title: "soundcloud",   sub: "mc zenbauhaus",             cta: "listen" },
  { href: "https://sketchfab.com/zenbauhaus",                      title: "sketchfab",                                      cta: "explore" },
  { href: "https://open.spotify.com/album/1V3m6SMvu8Bodq4scdqD3o", title: "cpt. demo ep", sub: "cover by me",              cta: "listen" },
]

interface BlogPost {
  id: string
  title: Localized
  date: string
  excerpt: Localized
  tags?: Localized
}

export default function MorePage() {
  const { lang } = useI18n()
  const [posts, setPosts] = useState<BlogPost[]>([])
  // The "updated YYYY · MM" label is computed in an effect so SSR
  // renders an empty string and the client fills it in after mount —
  // otherwise `new Date()` would diverge between build time and the
  // visitor's clock and trip React's hydration check.
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
          <header className="mb-16 grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
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
                Not a site map — the nav has those. This is the off-the-record half: what i&rsquo;m into now, the inputs that shaped the work, the things i&rsquo;m pushing against, the ones i&rsquo;m bad at, the quiet weights and the antidotes. Read it like a friend&rsquo;s notebook, not a CV.
              </motion.p>
            </div>
            {/* two overlapping frames, tipped opposite ways — a small
                collage so the masthead opens on work, not whitespace. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto hidden h-56 w-full max-w-sm md:block"
              style={{ position: "relative", zIndex: 36 }}
            >
              <span
                className="absolute left-2 top-0 block w-2/5 overflow-hidden"
                style={{
                  aspectRatio: "3 / 4",
                  border: "1.5px solid var(--ink)",
                  filter: "url(#ink-wobble)",
                  transform: "rotate(-3deg)",
                }}
              >
                <img
                  src="/art/surfaces/030.webp"
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
              <span
                className="absolute right-0 top-8 block w-1/2 overflow-hidden"
                style={{
                  aspectRatio: "4 / 3",
                  border: "1.5px solid var(--ink)",
                  filter: "url(#ink-wobble)",
                  transform: "rotate(2.4deg)",
                }}
              >
                <img
                  src="/art/weird/060.webp"
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
            </motion.div>
          </header>

          <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          {/* ===== Sketchbook strip — real work, links to /art ===== */}
          <Sketchbook />

          {/* ===== NOW — hand-edited; pull request when stale ===== */}
          <section className="mb-20">
            <div className="mb-5 flex items-baseline gap-3">
              <h2
                className="text-2xl uppercase tracking-[0.3em] sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
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
              {NOW.map((n, i) => (
                <div
                  key={n.k}
                  className="flex items-start gap-4 border-l-2 py-1.5 pl-4"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <Thumb seed={n.k} offset={i} className="w-16 sm:w-20" />
                  <div>
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
              The shortlist of people, movements, objects and disciplines I keep
              reaching for — in conversation and in code. Not a taste-dump; only
              the ones that actually shifted the work.
            </p>

            <Sub title="aesthetic & design" items={AESTHETIC} mark={<RamsGrid />} startSide="left" />
            <Sub
              title="music"
              items={MUSIC}
              mark={<TuningFork />}
              afterBlock={<MusicMedia />}
            />
            <Sub title="film" items={FILM} mark={<EyeMark />} />
            <Sub title="skating" items={SKATE} mark={<HillBombMark />} />
            <Sub title="code & tools" items={CODE} mark={<NodeMark />} />
            <Sub title="mind & science" items={MIND} mark={<BrainMark />} />
            <Sub title="discipline & practice" items={PRACTICE} mark={<EnsoMark />} />
            <Sub title="people" items={PEOPLE} mark={<PinMark />} />
            <Sub title="misc" items={MISC} mark={<CoconutMark />} startSide="right" />
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== REQUIEM — the one big self-hosted video ===== */}
          <RequiemVideo />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== WHAT I'M FIGHTING — image to one side, numbered rail ===== */}
          <Fighting />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== NOT GREAT AT — short, punchy, inline tags ===== */}
          <TagList
            title="not great at"
            items={NOT_GREAT}
            note="* the more useful list. anybody without one is lying about something else."
          />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== OFF THE WALL — organic painting scatter, breaks the grid ===== */}
          <ArtScatter />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== BUMS vs KEEPS — the weight and its antidote, side by side ===== */}
          <WeightAndAntidote />

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
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b py-4"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className="text-lg sm:text-xl"
                      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                    >
                      {l.title}
                    </span>
                    {l.sub && (
                      <span
                        className="text-xs sm:text-sm"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                      >
                        {l.sub}
                      </span>
                    )}
                  </span>
                  <CtaButton href={l.href} label={l.cta} />
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
                posts.map((p, i) => (
                  <article key={p.id} className="flex items-start gap-5">
                    <Thumb
                      seed={p.id}
                      href={`/blog/${p.id}`}
                      internal
                      offset={i * 5}
                      className="w-24 sm:w-32"
                    />
                    <div>
                      <div
                        className="mb-2 text-xs uppercase tracking-[0.3em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {fmtDate(p.date)}
                        {p.tags && <>&nbsp;*&nbsp;{pick(p.tags, lang)}</>}
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
                          <span className="ink-underline-hover">{pick(p.title, lang)}</span>
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
                        {pick(p.excerpt, lang)}
                      </p>
                      <div className="mt-3">
                        <CtaButton href={`/blog/${p.id}`} label="read it" internal />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="mt-7">
              <CtaButton href="/blog" label="all posts" internal />
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
              {ANCHORS.map((a, i) => (
                <div
                  key={a.k}
                  className="flex items-start gap-4 border-l-2 py-2 pl-4"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <Thumb seed={a.k} offset={i * 3} className="w-20 sm:w-24" />
                  <div>
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
//  CtaButton — the page's one link primitive. A wobbled ink box with a
//  plain, three-word-max label and an arrow that nudges on hover, so a
//  destination always reads as "go here", never a faint glyph. `internal`
//  routes through next/link and swaps the out-arrow for a forward one.
// =====================================================================

function CtaButton({
  href,
  label,
  internal = false,
  className = "",
}: {
  href: string
  label: string
  internal?: boolean
  className?: string
}) {
  const inner = (
    <span
      className="relative inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.25em] transition-colors duration-300 sm:text-sm"
      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-300 group-hover/cta:bg-[rgba(15,17,23,0.05)]"
        style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
      />
      <span className="relative">{label}</span>
      {internal ? (
        <ArrowRight
          size={15}
          className="ink-icon relative transition-transform duration-300 group-hover/cta:translate-x-1"
        />
      ) : (
        <ExternalLink
          size={14}
          className="ink-icon relative transition-transform duration-300 group-hover/cta:-translate-y-0.5"
        />
      )}
    </span>
  )

  const cls = `group/cta inline-flex w-fit ${className}`
  return internal ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  )
}

// =====================================================================
//  Thumb — a deterministic scrap of real work for any list item that
//  would otherwise be text-only. The label is hashed to a stable frame,
//  ratio and tilt from the archive, so every line carries an image
//  without a hydration-tripping random or a hand-assigned path per item.
// =====================================================================

const THUMB_POOL: string[] = [
  "/art/surfaces/008.webp", "/art/weird/014.webp", "/art/landscape/021.webp",
  "/art/decay/006.webp", "/art/reflections/018.webp", "/art/stalking/011.webp",
  "/art/acrylic/003.webp", "/art/surfaces/077.webp", "/art/weird/045.webp",
  "/art/landscape/099.webp", "/art/decay/028.webp", "/art/reflections/041.webp",
  "/art/stalking/072.webp", "/art/acrylic/019.webp", "/art/surfaces/150.webp",
  "/art/weird/180.webp", "/art/landscape/133.webp", "/art/decay/055.webp",
  "/art/reflections/063.webp", "/art/stalking/100.webp", "/art/surfaces/210.webp",
  "/art/weird/220.webp", "/art/landscape/058.webp", "/art/acrylic/025.webp",
  "/art/surfaces/260.webp", "/art/weird/099.webp",
]
const THUMB_RATIOS = ["1 / 1", "3 / 4", "4 / 3", "4 / 5", "5 / 4", "2 / 3"]
const THUMB_TILTS = ["-2.4deg", "1.8deg", "-1.2deg", "2.2deg", "-1.8deg", "1.4deg"]

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// A sensible three-word-max CTA from the link's flavour, so a list of
// destinations doesn't read "open it" twenty times. Explicit item.cta
// always wins.
function defaultCta(href: string): string {
  if (/youtube|youtu\.be|spotify|soundcloud/.test(href)) return "hear it"
  if (/wikipedia/.test(href)) return "read it"
  if (/github/.test(href)) return "see code"
  if (/instagram/.test(href)) return "follow"
  if (/lichess/.test(href)) return "play me"
  return "open it"
}

function Thumb({
  seed,
  href,
  internal = false,
  offset = 0,
  className = "w-20 sm:w-24",
}: {
  seed: string
  href?: string
  internal?: boolean
  // nudge into a different slice of the pool so neighbouring lines don't
  // land on the same frame.
  offset?: number
  className?: string
}) {
  const h = hashSeed(seed) + offset
  const src = THUMB_POOL[h % THUMB_POOL.length]
  const ratio = THUMB_RATIOS[h % THUMB_RATIOS.length]
  const tilt = THUMB_TILTS[h % THUMB_TILTS.length]
  const frame = (
    <span
      className={`relative block shrink-0 overflow-hidden transition-transform duration-500 ease-out group-hover/thumb:!rotate-0 ${className}`}
      style={{ aspectRatio: ratio, transform: `rotate(${tilt})` }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-[1.06]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
      />
    </span>
  )
  if (!href) return <span className="group/thumb block shrink-0">{frame}</span>
  return internal ? (
    <Link href={href} className="group/thumb block shrink-0">
      {frame}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/thumb block shrink-0"
    >
      {frame}
    </a>
  )
}

// =====================================================================
//  Sub-section: featured items (with an image) break to their own
//  alternating row; the rest collapse into a compact two-column grid.
// =====================================================================

function Sub({
  title,
  items,
  mark,
  afterBlock,
  startSide = "left",
}: {
  title: string
  items: Item[]
  mark?: React.ReactNode
  afterBlock?: React.ReactNode
  startSide?: "left" | "right"
}) {
  const featured = items.filter((i) => i.img)
  const rest = items.filter((i) => !i.img)
  return (
    <section className="mb-14">
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

      {featured.map((it, i) => (
        <ZigFeature
          key={it.name}
          item={it}
          side={
            (startSide === "left" ? i : i + 1) % 2 === 0 ? "left" : "right"
          }
        />
      ))}

      {rest.length > 0 && (
        <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
          {rest.map((it) => (
            <li key={it.name}>
              <Entry item={it} />
            </li>
          ))}
        </ul>
      )}
      {afterBlock}
    </section>
  )
}

// A featured row: a framed image (or self-hosted video) on one side,
// title + note + CTA on the other. `side` decides which edge the media
// hugs on desktop; on mobile it always sits on top. The columns are
// deliberately uneven and the frame is tipped a degree or two — the row
// should look set down by hand, not snapped to a grid.
function ZigFeature({ item, side }: { item: Item; side: "left" | "right" }) {
  const mediaRight = side === "right"
  // alternate the lean and the column split so no two featured rows
  // share the same geometry — this is what keeps the page from reading
  // as a tidy zig-zag template.
  const tilt = mediaRight ? "rotate(1.3deg)" : "rotate(-1.4deg)"
  const cols = mediaRight
    ? "md:grid-cols-[0.92fr_1.08fr]"
    : "md:grid-cols-[1.08fr_0.92fr]"
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 140, damping: 24 }}
      className={`mb-12 grid items-center gap-5 sm:gap-9 ${cols}`}
    >
      <figure
        className={mediaRight ? "md:order-2" : ""}
        style={{ position: "relative", zIndex: 36 }}
      >
        <div
          className="relative overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
          style={{
            aspectRatio: item.ratio ?? "4 / 3",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            transform: tilt,
          }}
        >
          {item.video ? (
            <video
              src={item.video}
              poster={item.img}
              controls
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <img
              src={item.img}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
            />
          )}
        </div>
      </figure>

      <div className={mediaRight ? "md:order-1" : ""}>
        <div className="mb-2 text-2xl sm:text-3xl" style={{ lineHeight: 1.05 }}>
          <span style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
            {item.name}
          </span>
        </div>
        <p
          className="max-w-md text-base sm:text-lg"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.55,
          }}
        >
          {item.note}
        </p>
        {item.href && (
          <div className="mt-4">
            <CtaButton href={item.href} label={item.cta ?? defaultCta(item.href)} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Compact entry: a small framed scrap of work on the left, then title,
// note and — for anything that links out — a clear CTA button. So even
// the densest list reads as image + words + a way in, never bare text.
function Entry({ item }: { item: Item }) {
  const TitleEl = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
    >
      <span className="ink-underline-hover">{item.name}</span>
    </a>
  ) : (
    <span style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
      {item.name}
    </span>
  )

  return (
    <div className="flex items-start gap-4">
      <Thumb seed={item.name} href={item.href} />
      <div className="flex flex-col gap-1.5">
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
        {item.href && (
          <div className="mt-1">
            <CtaButton href={item.href} label={item.cta ?? defaultCta(item.href)} />
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================================
//  Fighting — a framed texture to one side, the rail numbered so it
//  reads as a list of positions, not a rant.
// =====================================================================

function Fighting() {
  return (
    <section className="mb-20">
      <div className="mb-6 flex items-baseline gap-3">
        <h2
          className="text-2xl uppercase tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — what i&rsquo;m fighting
        </h2>
      </div>
      <div className="grid gap-6 sm:gap-10 md:grid-cols-[1fr_2fr]">
        <figure
          className="md:sticky md:top-28 md:self-start"
          style={{ position: "relative", zIndex: 36 }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "4 / 5",
              border: "1.5px solid var(--ink)",
              filter: "url(#ink-wobble)",
            }}
          >
            <img
              src="/art/decay/004.webp"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <figcaption
            className="mt-2 text-xs italic"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            * the things I want to leave a dent in. nothing personal — except all of it.
          </figcaption>
        </figure>

        <ol
          className="flex flex-col"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          {FIGHTING.map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 12)}`}
              className="flex items-baseline gap-4 border-b py-3 text-base sm:text-lg"
              style={{ borderColor: "var(--border-subtle)", lineHeight: 1.5 }}
            >
              <span
                aria-hidden
                className="shrink-0 text-xs tabular-nums tracking-[0.2em]"
                style={{ color: "var(--text-muted)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// =====================================================================
//  Not-great — short enough to wrap as inline tags rather than a list.
// =====================================================================

function TagList({
  title,
  items,
  note,
}: {
  title: string
  items: string[]
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
      <div className="grid items-start gap-6 sm:gap-8 md:grid-cols-[1fr_2fr]">
        <figure
          className="md:sticky md:top-28"
          style={{ position: "relative", zIndex: 36 }}
        >
          <div
            className="relative overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
            style={{
              aspectRatio: "4 / 5",
              border: "1.5px solid var(--ink)",
              filter: "url(#ink-wobble)",
              transform: "rotate(-1.6deg)",
            }}
          >
            <img
              src="/art/decay/041.webp"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </figure>
        <ul className="flex flex-wrap content-start gap-3" aria-label={title}>
          {items.map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 12)}`}
              className="px-4 py-2 text-sm sm:text-base"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                border: "1.5px solid var(--ink)",
                filter: "url(#ink-wobble)",
              }}
            >
              ✕&nbsp;&nbsp;{line}
            </li>
          ))}
        </ul>
      </div>
      {note && (
        <p
          className="mt-5 max-w-2xl text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          {note}
        </p>
      )}
    </section>
  )
}

// =====================================================================
//  Bums vs keeps — the weight and the antidote, two columns that
//  answer each other. Each column is headed by a framed image: a decay
//  texture for the weight, a brighter painting for the antidote.
// =====================================================================

function WeightAndAntidote() {
  return (
    <section className="mb-20">
      <div className="mb-6 flex items-baseline gap-3">
        <h2
          className="text-2xl uppercase tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — weight &amp; antidote
        </h2>
      </div>
      <div className="grid gap-8 sm:gap-12 md:grid-cols-2">
        <WeightColumn
          heading="what bums me out"
          glyph="↓"
          img="/art/decay/012.webp"
          items={BUMS}
        />
        <WeightColumn
          heading="what keeps me going"
          glyph="↑"
          img="/art/acrylic/014.webp"
          items={KEEPS}
        />
      </div>
      <p
        className="mt-6 max-w-2xl text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        * not asks for sympathy — the friction the work pushes against, and the receipts that get re-read when the left column gets long.
      </p>
    </section>
  )
}

function WeightColumn({
  heading,
  glyph,
  img,
  items,
}: {
  heading: string
  glyph: string
  img: string
  items: string[]
}) {
  return (
    <div className="flex flex-col" style={{ position: "relative", zIndex: 36 }}>
      <div
        className="relative mb-5 overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
        }}
      >
        <img
          src={img}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <h3
        className="mb-3 text-lg uppercase tracking-[0.3em]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        — {heading}
      </h3>
      <ul
        aria-label={heading}
        className="flex flex-col gap-1.5"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1.5 }}
      >
        {items.map((line, i) => (
          <li
            key={`${i}-${line.slice(0, 12)}`}
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
          // The embed is below the fold for most viewers. Lazy-load so
          // the youtube player iframe doesn't block initial paint, and
          // trim the `allow` list to only what the embed needs.
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
//  Sketchbook strip — a row of real images from the art book, linking
//  to /art. Pre-optimized WebP, lazy below the first card, so it adds
//  texture without weight.
// =====================================================================

// Each tile carries its own aspect, lean and vertical nudge so the row
// reads as paintings laid out on a table, not thumbnails in a grid.
const SKETCHBOOK: Array<{ src: string; ratio: string; tilt: string; shift: string }> = [
  { src: "/art/img-001.webp", ratio: "3 / 4", tilt: "-2.2deg", shift: "sm:mt-0" },
  { src: "/art/img-009.webp", ratio: "1 / 1", tilt: "1.6deg",  shift: "sm:mt-8" },
  { src: "/art/img-019.webp", ratio: "4 / 5", tilt: "-1.1deg", shift: "sm:mt-2" },
  { src: "/art/img-031.webp", ratio: "3 / 4", tilt: "2.4deg",  shift: "sm:mt-10" },
  { src: "/art/img-041.webp", ratio: "2 / 3", tilt: "-1.8deg", shift: "sm:mt-1" },
  { src: "/art/img-052.webp", ratio: "1 / 1", tilt: "1.2deg",  shift: "sm:mt-7" },
]

function Sketchbook() {
  return (
    <section className="mb-16" style={{ position: "relative", zIndex: 36 }}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2
          className="text-xl uppercase tracking-[0.3em] sm:text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — from the sketchbook
        </h2>
        <CtaButton href="/art" label="see the work" internal />
      </div>
      {/* horizontal scroll on phones; an off-baseline scatter on desktop */}
      <div className="-mx-1 flex snap-x items-start gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:gap-4 sm:overflow-visible">
        {SKETCHBOOK.map((tile) => (
          <Link
            key={tile.src}
            href="/art"
            className={`group relative w-40 shrink-0 snap-start overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0 sm:w-auto ${tile.shift}`}
            style={{ aspectRatio: tile.ratio, transform: `rotate(${tile.tilt})` }}
          >
            <img
              src={tile.src}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

// =====================================================================
//  Requiem — a self-hosted moving piece (Pietà). The page's one big
//  video: it bleeds a little past the column on desktop and sits at a
//  slight angle so it lands as a centerpiece, not an embed in a box.
// =====================================================================

function RequiemVideo() {
  return (
    <section
      className="mb-20"
      style={{ position: "relative", zIndex: 36 }}
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2
          className="text-2xl uppercase tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — requiem
        </h2>
        <CtaButton href="/art" label="more work" internal />
      </div>
      <figure className="sm:-mx-6 lg:-mx-16">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 130, damping: 24 }}
          className="relative overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
          style={{
            aspectRatio: "16 / 9",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            transform: "rotate(-0.8deg)",
          }}
        >
          <video
            src="/art/requiem/pieta.mp4"
            poster="/art/decay/050.webp"
            controls
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 size-full object-cover"
          />
        </motion.div>
        <figcaption
          className="mt-3 text-xs italic sm:text-sm"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
        >
          * Pietà — a moving piece of mine. Sound optional; the loop does the talking.
        </figcaption>
      </figure>
    </section>
  )
}

// =====================================================================
//  Art scatter — a deliberately un-gridded cluster of paintings at
//  mixed sizes, angles and baselines, two of them bleeding past the
//  column edge. Breaks up the text-heavy lower half and points at /art.
// =====================================================================

const SCATTER: Array<{ src: string; span: string; ratio: string; tilt: string; extra: string }> = [
  { src: "/art/surfaces/045.webp",   span: "sm:col-span-7", ratio: "3 / 2", tilt: "-1.6deg", extra: "sm:-ml-6 lg:-ml-14 sm:mt-0" },
  { src: "/art/weird/120.webp",      span: "sm:col-span-5", ratio: "4 / 5", tilt: "2deg",    extra: "sm:mt-12" },
  { src: "/art/landscape/077.webp",  span: "sm:col-span-4", ratio: "1 / 1", tilt: "-2.2deg", extra: "sm:mt-3" },
  { src: "/art/reflections/030.webp",span: "sm:col-span-5", ratio: "3 / 2", tilt: "1.4deg",  extra: "sm:mt-0" },
  { src: "/art/stalking/060.webp",   span: "sm:col-span-3", ratio: "2 / 3", tilt: "-1deg",   extra: "sm:-mr-6 lg:-mr-14 sm:mt-9" },
]

function ArtScatter() {
  return (
    <section className="mb-20" style={{ position: "relative", zIndex: 36 }}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2
          className="text-xl uppercase tracking-[0.3em] sm:text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — off the wall
        </h2>
        <CtaButton href="/art" label="the whole wall" internal />
      </div>
      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-12 sm:gap-5">
        {SCATTER.map((tile) => (
          <Link
            key={tile.src}
            href="/art"
            className={`group relative block overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0 ${tile.span} ${tile.extra}`}
            style={{ aspectRatio: tile.ratio, transform: `rotate(${tile.tilt})` }}
          >
            <img
              src={tile.src}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

// =====================================================================
//  Music media — a wall of video cards (thumbnail + link, cheap) plus a
//  couple of real embedded players. Everything below the fold is
//  lazy-loaded so the iframes never block paint.
// =====================================================================

const WATCH: Array<{ id: string; title: string }> = [
  { id: "PCmZBeNVy7g", title: "Tom Waits — Hold On" },
  { id: "NCceAA0fIm0", title: "Iron Maiden — Hallowed Be Thy Name" },
  { id: "0lkir-mvjqI", title: "Black Sabbath — Black Sabbath" },
  { id: "u05PVbbI_zo", title: "Zappa — Watermelon in Easter Hay" },
]

function MusicMedia() {
  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* thumbnail wall — images + links, no third-party JS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WATCH.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-video overflow-hidden"
            title={v.title}
          >
            <img
              src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
              alt={v.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
            />
            <span
              className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: "var(--surface-dark)", color: "var(--ink)", fontFamily: "var(--font-display)" }}
            >
              {v.title}
            </span>
          </a>
        ))}
      </div>

      {/* the one full player worth autoloading the chrome for */}
      <TomWaitsEmbed />

      {/* streaming embeds — one i listen to, one i made */}
      <div className="grid gap-6 md:grid-cols-2">
        <figure>
          <iframe
            title="Mick Jenkins — The Water[s]"
            src="https://open.spotify.com/embed/album/2GuJOMaxJpvgDM5MgKZUF8?utm_source=generator"
            loading="lazy"
            width="100%"
            height="352"
            frameBorder="0"
            allow="encrypted-media"
            className="block"
            style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
          />
          <figcaption className="mt-2 text-xs italic" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            * Mick Jenkins — The Water[s]. Still on the shortlist.
          </figcaption>
        </figure>
        <figure>
          <iframe
            title="mc zenbauhaus on SoundCloud"
            src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/mczenbauhaus&color=%23ee4a44&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false"
            loading="lazy"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay"
            scrolling="no"
            className="block"
            style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
          />
          <figcaption className="mt-2 text-xs italic" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            * mc zenbauhaus — the other side of the desk.
          </figcaption>
        </figure>
      </div>
    </div>
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
