"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, ArrowRight, Github, Shuffle, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"
import { CHAPTERS, CHAPTER_IDS, LOVE_ITEMS, NOW, UI, isChapterId, type Chapter, type ChapterId } from "./data"
import {
  Anchors,
  Blog,
  ChapterMark,
  Elsewhere,
  Fighting,
  InkFrame,
  Lab,
  LoveShelf,
  MusicMedia,
  NotGreat,
  NowList,
  RequiemVideo,
  Wall,
  WeightAndAntidote,
} from "./parts"

// /more is the off-the-record half of the site. It used to be one long
// column of eighteen sections that nobody scrolled to the bottom of. Now
// the first screen is the whole map — a contact sheet of chapters — and
// each chapter opens in a sheet over it (deep-linkable by #hash, Esc or
// back to close, prev / next / surprise to wander sideways). Heavy media
// only mounts while its chapter is open.

const ink = { color: "var(--ink)", fontFamily: "var(--font-display)" } as const
const muted = { color: "var(--text-muted)", fontFamily: "var(--font-display)" } as const

const byId = Object.fromEntries(CHAPTERS.map((c) => [c.id, c])) as Record<ChapterId, Chapter>
const num = (id: ChapterId) => String(CHAPTER_IDS.indexOf(id)).padStart(2, "0")

const SHELVES: Array<{ key: Chapter["shelf"]; title: Localized; sub?: Localized }> = [
  { key: "love", title: UI.shelfLove, sub: UI.shelfLoveSub },
  { key: "record", title: UI.shelfRecord },
  { key: "made", title: UI.shelfMade },
]

export default function MorePage() {
  const { lang } = useI18n()
  const tr = (v: Localized) => pick(v, lang)
  const [openId, setOpenId] = useState<ChapterId | null>(null)
  const [dir, setDir] = useState(1)
  const openRef = useRef<ChapterId | null>(null)
  // true while the open sheet owns a history entry, so close = back()
  const pushedRef = useRef(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  openRef.current = openId

  // Hash <-> sheet. A link to /more#music opens that chapter; the back
  // gesture closes whatever is open.
  useEffect(() => {
    const sync = () => {
      const h = decodeURIComponent(window.location.hash.slice(1))
      if (isChapterId(h)) {
        setOpenId(h)
      } else {
        pushedRef.current = false
        setOpenId(null)
      }
    }
    sync()
    window.addEventListener("popstate", sync)
    window.addEventListener("hashchange", sync)
    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener("hashchange", sync)
    }
  }, [])

  const open = useCallback((id: ChapterId, trigger?: HTMLElement | null, delta = 1) => {
    if (trigger) triggerRef.current = trigger
    setDir(delta)
    if (!openRef.current) {
      window.history.pushState(window.history.state, "", `#${id}`)
      pushedRef.current = true
    } else {
      window.history.replaceState(window.history.state, "", `#${id}`)
    }
    setOpenId(id)
  }, [])

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
      return
    }
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search)
    setOpenId(null)
  }, [])

  const step = useCallback(
    (delta: number) => {
      const cur = openRef.current
      if (!cur) return
      const n = CHAPTER_IDS.length
      const i = CHAPTER_IDS.indexOf(cur)
      open(CHAPTER_IDS[(i + delta + n) % n], null, delta)
    },
    [open],
  )

  const surprise = useCallback(
    (trigger?: HTMLElement | null) => {
      const pool = CHAPTER_IDS.filter((c) => c !== openRef.current)
      open(pool[Math.floor(Math.random() * pool.length)], trigger ?? null, 1)
    },
    [open],
  )

  // Return focus to whatever opened the sheet.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (openId) {
      wasOpen.current = true
      return
    }
    if (wasOpen.current) {
      wasOpen.current = false
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [openId])

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />

        <article
          // The fixed nav is transparent but still catches clicks, so the
          // first interactive row has to clear it: on phones and tablets
          // that is the header's surprise button; on desktop the button
          // lives in the ticker row and only the title sits up here.
          className="section-container pb-12 pt-[118px] md:pt-[148px] lg:pt-[104px]"
          style={{ position: "relative", zIndex: 35 }}
        >
          <header className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-baseline gap-x-5">
                <h1 className="whitespace-nowrap text-[clamp(2.2rem,5vw,3.2rem)] leading-[0.95]" style={ink}>
                  <MotionText text={tr(UI.title)} split="char" stagger={0.05} />
                </h1>
                <Intro text={tr(UI.intro)} className="hidden md:block" />
              </div>
              <SurpriseButton label={tr(UI.surprise)} onClick={(el) => surprise(el)} className="lg:hidden" />
            </div>
            <Intro text={tr(UI.intro)} className="mt-1 md:hidden" />
          </header>

          <NowTicker
            title={tr(UI.now)}
            openLabel={tr(UI.open)}
            expanded={openId === "now"}
            onOpen={(el) => open("now", el)}
            extra={
              <SurpriseButton label={tr(UI.surprise)} onClick={(el) => surprise(el)} className="hidden lg:inline-flex" />
            }
          />

          {/* The contact sheet: every chapter on one grid. Shelf names are
              handwritten notes sitting in the grid among the photos on
              desktop, and plain row headings on narrower screens. */}
          <ul className="grid grid-cols-3 items-start gap-x-3 gap-y-5 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-7 lg:gap-x-5 lg:gap-y-6">
            {SHELVES.map((shelf) => [
                <li
                  key={`shelf-${shelf.key}`}
                  className="col-span-3 -mb-2 md:col-span-5 lg:col-span-1 lg:mb-0 lg:pt-2"
                >
                  <h2 className="text-lg leading-tight lg:text-[0.9rem]" style={ink}>
                    <span className="ink-underline">{tr(shelf.title)}</span>
                    <span aria-hidden className="ml-2 hidden lg:inline" style={{ filter: "url(#ink-wobble)" }}>
                      →
                    </span>
                  </h2>
                  {shelf.sub && (
                    <p className="mt-1.5 hidden text-[0.56rem] leading-snug sm:block" style={muted}>
                      {tr(shelf.sub)}
                    </p>
                  )}
                </li>,
                ...CHAPTERS.filter((c) => c.shelf === shelf.key).map((c) => (
                  <li key={c.id}>
                    <Tile
                      chapter={c}
                      index={CHAPTER_IDS.indexOf(c.id)}
                      title={tr(c.title)}
                      hook={tr(c.hook)}
                      expanded={openId === c.id}
                      onOpen={(el) => open(c.id, el)}
                    />
                  </li>
                )),
            ])}
          </ul>

          <footer
            className="mt-14 flex flex-col items-baseline justify-between gap-2 text-sm sm:flex-row"
            style={muted}
          >
            <a
              href="https://github.com/WalterGropius/nextwebsite2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2"
            >
              <Github size={14} className="ink-icon" />
              <span className="ink-underline-hover">{tr(UI.openSource)}</span>
            </a>
            <span>© {new Date().getFullYear()} · eliáš bauer</span>
          </footer>
        </article>

        <Sheet
          openId={openId}
          dir={dir}
          onClose={close}
          onStep={step}
          onSurprise={() => surprise()}
        />
      </main>
    </PageLoader>
  )
}

// =====================================================================
//  Overview pieces
// =====================================================================

function Intro({ text, className }: { text: string; className: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`text-base ${className}`}
      style={muted}
    >
      {text}
    </motion.p>
  )
}

function SurpriseButton({
  label,
  onClick,
  className = "",
}: {
  label: string
  onClick: (el: HTMLElement) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => onClick(e.currentTarget)}
      aria-haspopup="dialog"
      aria-controls="more-sheet"
      data-surprise
      className={`group relative inline-flex min-h-[44px] shrink-0 items-center gap-2 px-4 py-1.5 text-sm transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      style={{ ...ink, background: "var(--ink)", color: "var(--ink-inverse)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[2px]"
        style={{ border: "4px solid var(--ink)", filter: "url(#ink-wobble-strong)" }}
      />
      <Shuffle size={16} className="relative transition-transform duration-500 group-hover:rotate-180" />
      <span className="relative">{label}</span>
    </button>
  )
}

// "Now" is the freshest thing on the page, so it rides along the top as a
// slow ticker — one line, always moving, paused under the pointer. With
// reduced motion it becomes a plain row you can swipe.
const TICKER_CSS = `
@keyframes more-now { to { transform: translate3d(-50%, 0, 0) } }
.more-now-track { animation: more-now 80s linear infinite; }
.more-now:hover .more-now-track, .more-now:focus-within .more-now-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .more-now-track { animation: none; }
  .more-now-view { overflow-x: auto; }
}`

function NowTicker({
  title,
  openLabel,
  expanded,
  onOpen,
  extra,
}: {
  title: string
  openLabel: string
  expanded: boolean
  onOpen: (el: HTMLElement) => void
  extra?: React.ReactNode
}) {
  const { lang } = useI18n()
  const items = NOW.map((n) => ({ k: n.k, label: pick(n.kl, lang), value: pick(n.v, lang) }))
  return (
    <section aria-labelledby="now-ticker" className="more-now relative mb-5 flex items-center gap-3 sm:mb-6 sm:gap-5">
      <style>{TICKER_CSS}</style>
      <h2 id="now-ticker" className="flex shrink-0 items-baseline gap-1.5 text-lg sm:text-xl" style={ink}>
        <span className="text-xs tabular-nums" style={muted}>
          00
        </span>
        <span className="ink-underline">{title}</span>
      </h2>
      <div
        className="more-now-view relative min-w-0 flex-1 overflow-hidden py-2"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <ul className="more-now-track flex w-max">
          {[0, 1].map((copy) =>
            items.map((it) => (
              <li
                key={`${copy}-${it.k}`}
                aria-hidden={copy === 1 || undefined}
                className="whitespace-nowrap pr-10 text-sm"
                style={ink}
              >
                <span style={muted}>{it.label}</span>&nbsp;&nbsp;{it.value}
                <span aria-hidden className="pl-10" style={muted}>
                  *
                </span>
              </li>
            )),
          )}
        </ul>
      </div>
      <button
        type="button"
        onClick={(e) => onOpen(e.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-controls="more-sheet"
        aria-label={`${openLabel}: ${title}`}
        className="group/cta relative inline-flex min-h-[44px] shrink-0 items-center gap-2 px-3 text-sm sm:px-4"
        style={ink}
      >
        <InkFrame />
        <span className="relative hidden sm:inline">{openLabel}</span>
        <ArrowRight size={15} className="ink-icon relative transition-transform duration-300 group-hover/cta:translate-x-1" />
      </button>
      {extra}
    </section>
  )
}

function Tile({
  chapter,
  index,
  title,
  hook,
  expanded,
  onOpen,
}: {
  chapter: Chapter
  index: number
  title: string
  hook: string
  expanded: boolean
  onOpen: (el: HTMLElement) => void
}) {
  return (
    <motion.button
      type="button"
      id={`tile-${chapter.id}`}
      onClick={(e) => onOpen(e.currentTarget)}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-controls="more-sheet"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className="group relative block w-full text-left"
    >
      <span
        className="relative block overflow-hidden transition-transform duration-500 ease-out group-hover:!-translate-y-1 group-hover:!rotate-0 group-focus-visible:!rotate-0"
        style={{ aspectRatio: chapter.ratio, transform: `rotate(${chapter.tilt}deg)` }}
      >
        <Image
          src={chapter.img}
          alt=""
          fill
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 190px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <InkFrame />
        <span
          className="absolute left-0 top-0 px-1.5 py-0.5 text-xs tabular-nums"
          style={{ ...ink, background: "var(--surface-dark)" }}
        >
          {num(chapter.id)}
        </span>
      </span>
      <span className="mt-2 block text-[0.78rem] leading-tight lg:text-[0.7rem]" style={ink}>
        <span className="ink-underline-hover">{title}</span>
      </span>
      <span className="mt-0.5 hidden text-[0.56rem] leading-snug sm:line-clamp-2 lg:text-[0.52rem]" style={muted}>
        {hook}
      </span>
    </motion.button>
  )
}

// =====================================================================
//  The sheet — one chapter at a time, over the map.
// =====================================================================

function ChapterBody({ id }: { id: ChapterId }) {
  switch (id) {
    case "now":
      return <NowList />
    case "fighting":
      return <Fighting />
    case "not-great":
      return <NotGreat />
    case "weight":
      return <WeightAndAntidote />
    case "anchors":
      return <Anchors />
    case "requiem":
      return <RequiemVideo />
    case "wall":
      return <Wall />
    case "lab":
      return <Lab />
    case "blog":
      return <Blog />
    case "elsewhere":
      return <Elsewhere />
    default:
      return <LoveShelf items={LOVE_ITEMS[id] ?? []} after={id === "music" ? <MusicMedia /> : undefined} />
  }
}

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, video[controls], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function Sheet({
  openId,
  dir,
  onClose,
  onStep,
  onSurprise,
}: {
  openId: ChapterId | null
  dir: number
  onClose: () => void
  onStep: (delta: number) => void
  onSurprise: () => void
}) {
  const { lang } = useI18n()
  const tr = (v: Localized) => pick(v, lang)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const isOpen = openId !== null

  // Lock the page behind the sheet (and keep the scrollbar's width so
  // the map doesn't jump sideways).
  useEffect(() => {
    if (!isOpen) return
    const html = document.documentElement
    const gap = window.innerWidth - html.clientWidth
    const prev = { h: html.style.overflow, b: document.body.style.overflow, p: document.body.style.paddingRight }
    html.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    // Focus the dialog itself: screen readers announce it, and the next
    // Tab lands on the close button without painting a ring on load.
    panelRef.current?.focus({ preventScroll: true })
    return () => {
      html.style.overflow = prev.h
      document.body.style.overflow = prev.b
      document.body.style.paddingRight = prev.p
    }
  }, [isOpen])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [openId])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      const t = e.target as HTMLElement | null
      const typing = t && /^(INPUT|TEXTAREA|SELECT|VIDEO)$/.test(t.tagName)
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "ArrowRight") onStep(1)
        else if (e.key === "ArrowLeft") onStep(-1)
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        )
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose, onStep])

  const n = CHAPTER_IDS.length
  const i = openId ? CHAPTER_IDS.indexOf(openId) : 0
  const prev = byId[CHAPTER_IDS[(i - 1 + n) % n]]
  const next = byId[CHAPTER_IDS[(i + 1) % n]]
  const cur = openId ? byId[openId] : null

  return (
    <AnimatePresence>
      {cur && (
        <motion.div key="more-sheet" className="fixed inset-0 z-[70]" initial="hidden" animate="shown" exit="hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0"
            onClick={onClose}
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
            transition={{ duration: 0.3 }}
            style={{ background: "color-mix(in srgb, var(--surface-dark) 72%, transparent)" }}
          />
          <motion.div
            ref={panelRef}
            id="more-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-sheet-title"
            tabIndex={-1}
            variants={{ hidden: { opacity: 0, y: 48 }, shown: { opacity: 1, y: 0 } }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-0 mx-auto flex w-full max-w-[1120px] flex-col outline-none sm:inset-x-4 sm:bottom-0 sm:top-[3.5vh] sm:w-auto lg:inset-x-0 lg:w-[min(1120px,calc(100vw-4rem))]"
            style={{ background: "var(--surface-dark)" }}
          >
            <span className="pointer-events-none absolute inset-0 hidden sm:block">
              <InkFrame width={2} />
            </span>

            <header
              className="relative flex items-center gap-3 border-b px-4 py-2.5 sm:px-8 sm:py-4"
              style={{ borderColor: "var(--border-subtle)", paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
            >
              <span className="text-sm tabular-nums" style={muted}>
                {num(cur.id)}
              </span>
              <span className="hidden shrink-0 sm:block" style={{ color: "var(--ink)" }}>
                <ChapterMark name={cur.mark} size={28} />
              </span>
              <h2
                id="more-sheet-title"
                aria-live="polite"
                className="min-w-0 flex-1 truncate text-2xl leading-tight sm:text-3xl"
                style={ink}
              >
                {tr(cur.title)}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={tr(UI.close)}
                className="-mr-2 flex size-11 shrink-0 items-center justify-center"
                style={{ color: "var(--ink)" }}
              >
                <X size={28} strokeWidth={2.4} style={{ filter: "url(#ink-wobble-strong)" }} />
              </button>
            </header>

            <div
              ref={bodyRef}
              className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8 sm:py-8 lg:px-12"
              style={{
                // the sheet sits above the page's paper layer, so it carries
                // its own faint millimetre grid — attached to the content,
                // so it scrolls with the words like real paper
                backgroundImage:
                  "linear-gradient(color-mix(in srgb, var(--ink) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--ink) 5%, transparent) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                backgroundAttachment: "local",
              }}
            >
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={cur.id}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 28 }),
                    center: { opacity: 1, x: 0 },
                    leave: (d: number) => ({ opacity: 0, x: d * -28 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="leave"
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="mb-6 text-base sm:mb-8" style={muted}>
                    {tr(cur.hook)}
                  </p>
                  <ChapterBody id={cur.id} />
                </motion.div>
              </AnimatePresence>
            </div>

            <nav
              aria-label={tr(UI.surprise)}
              className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 border-t px-1 py-1.5 sm:gap-2 sm:px-6 sm:py-2.5"
              style={{ borderColor: "var(--border-subtle)", paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={() => onStep(-1)}
                className="group flex min-h-[44px] w-full min-w-0 items-center justify-start gap-2 px-2 text-left text-sm sm:text-base"
                style={ink}
                aria-label={`${tr(UI.prev)}: ${tr(prev.title)}`}
              >
                <ArrowLeft size={18} className="ink-icon shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="truncate">{tr(prev.title)}</span>
              </button>
              <button
                type="button"
                onClick={onSurprise}
                className="group flex min-h-[44px] items-center gap-2 px-3 text-sm sm:text-base"
                style={muted}
              >
                <Shuffle size={16} className="transition-transform duration-500 group-hover:rotate-180" />
                <span className="hidden sm:inline">{tr(UI.surprise)}</span>
                <span className="sr-only sm:hidden">{tr(UI.surprise)}</span>
              </button>
              <button
                type="button"
                onClick={() => onStep(1)}
                className="group flex min-h-[44px] w-full min-w-0 items-center justify-end gap-2 px-2 text-right text-sm sm:text-base"
                style={ink}
                aria-label={`${tr(UI.next)}: ${tr(next.title)}`}
              >
                <span className="truncate">{tr(next.title)}</span>
                <ArrowRight size={18} className="ink-icon shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
