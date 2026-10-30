"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"
import artData from "../../public/art.json"
import {
  ANCHORS,
  BUMS,
  CHAPTERS,
  CTA,
  FIGHTING,
  KEEPS,
  LAB_LINKS,
  LOVE_ITEMS,
  NOT_GREAT,
  NOW,
  OUT_LINKS,
  SCATTER,
  SKETCHBOOK,
  UI,
  WATCH,
  type Item,
  type Mark as MarkName,
} from "./data"

const ink = { color: "var(--ink)", fontFamily: "var(--font-display)" } as const
const muted = { color: "var(--text-muted)", fontFamily: "var(--font-display)" } as const

// Hand-drawn frame edge. Lives on its own layer so the wobble filter never
// touches the image or the text inside the frame.
export function InkFrame({ width = 1.5 }: { width?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ border: `${width}px solid var(--ink)`, filter: "url(#ink-wobble)" }}
    />
  )
}

// =====================================================================
//  CtaButton — the page's one link primitive: a wobbled ink box with a
//  short label and an arrow. `internal` routes through next/link.
// =====================================================================

export function CtaButton({
  href,
  label,
  internal = false,
}: {
  href: string
  label: string
  internal?: boolean
}) {
  const inner = (
    <span
      className="relative inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm"
      style={ink}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-300 group-hover/cta:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]"
        style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
      />
      <span className="relative">{label}</span>
      {internal ? (
        <ArrowRight size={15} className="ink-icon relative transition-transform duration-300 group-hover/cta:translate-x-1" />
      ) : (
        <ExternalLink size={14} className="ink-icon relative transition-transform duration-300 group-hover/cta:-translate-y-0.5" />
      )}
    </span>
  )
  const cls = "group/cta inline-flex w-fit shrink-0"
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

function defaultCta(href: string): Localized {
  if (/youtube|youtu\.be|spotify|soundcloud/.test(href)) return CTA.hear
  if (/wikipedia/.test(href)) return CTA.read
  if (/github/.test(href)) return CTA.see
  if (/instagram/.test(href)) return CTA.follow
  if (/lichess/.test(href)) return CTA.play
  return CTA.open
}

// =====================================================================
//  Thumb — a deterministic scrap of real work for any text-only line.
//  Each seed maps to its own frame from the art archive (minus frames
//  already used elsewhere on the page), so no image repeats and SSR and
//  client agree.
// =====================================================================

const THUMB_RATIOS = ["1 / 1", "3 / 4", "4 / 3", "4 / 5", "5 / 4", "2 / 3"]
const THUMB_TILTS = ["-2.4deg", "1.8deg", "-1.2deg", "2.2deg", "-1.8deg", "1.4deg"]

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const LOVE_FLAT = Object.values(LOVE_ITEMS).flat() as Item[]

let THUMB_POOL: string[] | null = null
function thumbPool(): string[] {
  if (THUMB_POOL) return THUMB_POOL
  const used = new Set<string>([
    "/art/decay/004.webp",
    "/art/decay/041.webp",
    "/art/decay/012.webp",
    "/art/acrylic/014.webp",
    "/art/decay/050.webp",
  ])
  CHAPTERS.forEach((c) => used.add(c.img))
  LOVE_FLAT.forEach((i) => i.img && used.add(i.img))
  SKETCHBOOK.forEach((s) => used.add(s.src))
  SCATTER.forEach((s) => used.add(s.src))
  const pool: string[] = []
  for (const series of artData as Array<{ images?: string[] }>) {
    for (const img of series.images ?? []) {
      if (img.startsWith("/art/img-")) continue
      if (!used.has(img) && !pool.includes(img)) pool.push(img)
    }
  }
  THUMB_POOL = pool
  return pool
}

const STATIC_SEEDS: string[] = [
  ...NOW.map((n) => n.k),
  ...LOVE_FLAT.filter((i) => !i.img).map((i) => i.name),
  ...ANCHORS.map((a) => a.k),
  ...LAB_LINKS.map((l) => l.title),
]

function thumbSrc(seed: string): string {
  const pool = thumbPool()
  const i = STATIC_SEEDS.indexOf(seed)
  const idx = i >= 0 ? i : STATIC_SEEDS.length + (hashSeed(seed) % 16)
  return pool[idx % pool.length]
}

function blogThumbSrc(i: number): string {
  const pool = thumbPool()
  return pool[(STATIC_SEEDS.length + 32 + i) % pool.length]
}

export function Thumb({
  seed,
  href,
  internal = false,
  src: srcOverride,
  className = "w-20 sm:w-24",
}: {
  seed: string
  href?: string
  internal?: boolean
  src?: string
  className?: string
}) {
  const h = hashSeed(seed)
  const src = srcOverride ?? thumbSrc(seed)
  const frame = (
    <span
      className={`relative block shrink-0 overflow-hidden transition-transform duration-500 ease-out group-hover/thumb:!rotate-0 ${className}`}
      style={{ aspectRatio: THUMB_RATIOS[h % THUMB_RATIOS.length], transform: `rotate(${THUMB_TILTS[h % THUMB_TILTS.length]})` }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-[1.06]"
      />
      <InkFrame />
    </span>
  )
  if (!href) return <span className="group/thumb block shrink-0">{frame}</span>
  return internal ? (
    <Link href={href} className="group/thumb block shrink-0" tabIndex={-1} aria-hidden>
      {frame}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group/thumb block shrink-0" tabIndex={-1} aria-hidden>
      {frame}
    </a>
  )
}

// =====================================================================
//  Chapter bodies
// =====================================================================

export function LoveShelf({ items, after }: { items: Item[]; after?: React.ReactNode }) {
  const featured = items.filter((i) => i.img)
  const rest = items.filter((i) => !i.img)
  return (
    <div>
      {featured.map((it, i) => (
        <Feature key={it.name} item={it} flip={i % 2 === 1} />
      ))}
      {rest.length > 0 && (
        <ul className="grid gap-x-10 gap-y-7 md:grid-cols-2">
          {rest.map((it) => (
            <li key={it.name}>
              <Entry item={it} />
            </li>
          ))}
        </ul>
      )}
      {after}
    </div>
  )
}

function Feature({ item, flip }: { item: Item; flip: boolean }) {
  const { lang } = useI18n()
  return (
    <div className={`mb-10 grid items-center gap-5 sm:gap-8 ${flip ? "md:grid-cols-[1fr_1.1fr]" : "md:grid-cols-[1.1fr_1fr]"}`}>
      <figure className={flip ? "md:order-2" : ""}>
        <div
          className="relative max-h-[52vh] overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
          style={{ aspectRatio: item.ratio ?? "4 / 3", transform: `rotate(${flip ? 1.2 : -1.2}deg)` }}
        >
          <Image
            src={item.img!}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 92vw, 520px"
            className="object-cover"
          />
          <InkFrame />
        </div>
      </figure>
      <div className={flip ? "md:order-1" : ""}>
        <h3 className="mb-2 text-2xl" style={{ ...ink, lineHeight: 1.05 }}>
          {pick(item.label ?? item.name, lang)}
        </h3>
        <p className="max-w-md text-base" style={{ ...muted, lineHeight: 1.5 }}>
          {pick(item.note, lang)}
        </p>
        {item.href && (
          <div className="mt-4">
            <CtaButton href={item.href} label={pick(item.cta ?? defaultCta(item.href), lang)} />
          </div>
        )}
      </div>
    </div>
  )
}

function Entry({ item }: { item: Item }) {
  const { lang } = useI18n()
  const name = pick(item.label ?? item.name, lang)
  return (
    <div className="flex items-start gap-4">
      <Thumb seed={item.name} href={item.href} className="w-16 sm:w-20" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-lg" style={{ ...ink, lineHeight: 1.1 }}>
          {item.href ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              <span className="ink-underline-hover">{name}</span>
            </a>
          ) : (
            name
          )}
        </h3>
        <p className="text-base" style={{ ...muted, lineHeight: 1.5 }}>
          {pick(item.note, lang)}
        </p>
        {item.href && (
          <div className="mt-1">
            <CtaButton href={item.href} label={pick(item.cta ?? defaultCta(item.href), lang)} />
          </div>
        )}
      </div>
    </div>
  )
}

export function NowList() {
  const { lang } = useI18n()
  return (
    <dl className="grid gap-5 md:grid-cols-2">
      {NOW.map((n) => (
        <div key={n.k} className="flex items-start gap-4">
          <Thumb seed={n.k} className="w-16 sm:w-20" />
          <div>
            <dt className="mb-1 text-sm" style={muted}>
              {pick(n.kl, lang)}
            </dt>
            <dd className="text-base" style={{ ...ink, lineHeight: 1.4 }}>
              {pick(n.v, lang)}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

export function Fighting() {
  const { lang } = useI18n()
  return (
    <ol className="flex flex-col" style={ink}>
      {FIGHTING.map((line, i) => (
        <li
          key={i}
          className="flex items-baseline gap-4 border-b py-3 text-base"
          style={{ borderColor: "var(--border-subtle)", lineHeight: 1.45 }}
        >
          <span aria-hidden className="w-7 shrink-0 text-sm tabular-nums" style={muted}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{pick(line, lang)}</span>
        </li>
      ))}
    </ol>
  )
}

export function NotGreat() {
  const { lang } = useI18n()
  return (
    <ul className="flex flex-wrap content-start gap-3">
      {NOT_GREAT.map((line, i) => (
        <li key={i} className="relative px-4 py-2 text-base" style={ink}>
          <InkFrame />
          <span className="relative">✕&nbsp;&nbsp;{pick(line, lang)}</span>
        </li>
      ))}
    </ul>
  )
}

export function WeightAndAntidote() {
  const { lang } = useI18n()
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <WeightColumn heading={pick(UI.bumsHeading, lang)} glyph="↓" img="/art/decay/012.webp" items={BUMS} />
      <WeightColumn heading={pick(UI.keepsHeading, lang)} glyph="↑" img="/art/acrylic/014.webp" items={KEEPS} />
    </div>
  )
}

function WeightColumn({ heading, glyph, img, items }: { heading: string; glyph: string; img: string; items: Localized[] }) {
  const { lang } = useI18n()
  return (
    <div className="flex flex-col">
      <div className="relative mb-5 overflow-hidden" style={{ aspectRatio: "16 / 7" }}>
        <img src={img} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        <InkFrame />
      </div>
      <h3 className="mb-3 text-xl" style={ink}>
        {heading}
      </h3>
      <ul aria-label={heading} className="flex flex-col gap-2" style={{ ...ink, lineHeight: 1.45 }}>
        {items.map((line, i) => (
          <li key={i} className="flex items-baseline gap-3 text-base">
            <span aria-hidden className="shrink-0 text-sm" style={muted}>
              {glyph}
            </span>
            <span>{pick(line, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Anchors() {
  const { lang } = useI18n()
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      {ANCHORS.map((a) => (
        <div key={a.k} className="flex items-start gap-4">
          <Thumb seed={a.k} className="w-16 sm:w-20" />
          <div>
            <dt className="mb-1 text-sm" style={muted}>
              {pick(a.kl, lang)}
            </dt>
            <dd className="text-base" style={{ ...ink, lineHeight: 1.45 }}>
              {pick(a.v, lang)}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

export function RequiemVideo() {
  const { lang } = useI18n()
  return (
    <figure>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        {/* Mounted only while this chapter is open; metadata only until play. */}
        <video
          src="/art/requiem/pieta.mp4"
          poster="/art/decay/050.webp"
          controls
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
        />
        <InkFrame />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm" style={muted}>
        <span>{pick(UI.requiemCap, lang)}</span>
        <CtaButton href="/art" label={pick(UI.seeWork, lang)} internal />
      </figcaption>
    </figure>
  )
}

export function Wall() {
  const { lang } = useI18n()
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-12 sm:gap-5">
        {SCATTER.map((tile) => (
          <Link
            key={tile.src}
            href="/art"
            className={`group relative block overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0 ${tile.span} ${tile.extra}`}
            style={{ aspectRatio: tile.ratio, transform: `rotate(${tile.tilt})` }}
            aria-label={pick(UI.wholeWall, lang)}
          >
            <img
              src={tile.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <InkFrame />
          </Link>
        ))}
      </div>
      <div>
        <h3 className="mb-4 text-xl" style={ink}>
          {pick(UI.sketchbook, lang)}
        </h3>
        <div className="-mx-1 flex snap-x items-start gap-3 overflow-x-auto px-1 pb-3 sm:grid sm:grid-cols-6 sm:gap-4 sm:overflow-visible">
          {SKETCHBOOK.map((tile, i) => (
            <Link
              key={tile.src}
              href="/art"
              className={`group relative w-32 shrink-0 snap-start overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0 sm:w-auto ${i % 2 ? "sm:mt-6" : ""}`}
              style={{ aspectRatio: tile.ratio, transform: `rotate(${tile.tilt})` }}
              aria-label={pick(UI.seeWork, lang)}
            >
              <img src={tile.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              <InkFrame />
            </Link>
          ))}
        </div>
      </div>
      <div>
        <CtaButton href="/art" label={pick(UI.wholeWall, lang)} internal />
      </div>
    </div>
  )
}

export function MusicMedia() {
  const { lang } = useI18n()
  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WATCH.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block"
            title={v.title}
          >
            <span className="relative block aspect-video overflow-hidden">
              <img
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <InkFrame />
            </span>
            <span className="mt-1.5 block text-sm leading-tight" style={muted}>
              {v.title}
            </span>
          </a>
        ))}
      </div>
      <figure className="max-w-2xl">
        <div className="relative" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src="https://www.youtube.com/embed/PCmZBeNVy7g?rel=0"
            title="Tom Waits — Hold On"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="block size-full"
          />
          <InkFrame />
        </div>
        <figcaption className="mt-2 text-sm" style={muted}>
          {pick(UI.waitsCap, lang)}
        </figcaption>
      </figure>
      <div className="grid gap-6 md:grid-cols-2">
        <figure>
          <div className="relative">
            <iframe
              title="Mick Jenkins — The Water[s]"
              src="https://open.spotify.com/embed/album/2GuJOMaxJpvgDM5MgKZUF8?utm_source=generator"
              loading="lazy"
              width="100%"
              height="352"
              allow="encrypted-media"
              className="block"
            />
            <InkFrame />
          </div>
          <figcaption className="mt-2 text-sm" style={muted}>
            {pick(UI.jenkinsCap, lang)}
          </figcaption>
        </figure>
        <figure>
          <div className="relative">
            <iframe
              title="mc zenbauhaus on SoundCloud"
              src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/mczenbauhaus&color=%23ee4a44&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false"
              loading="lazy"
              width="100%"
              height="352"
              allow="autoplay"
              className="block"
            />
            <InkFrame />
          </div>
          <figcaption className="mt-2 text-sm" style={muted}>
            {pick(UI.zenbauhausCap, lang)}
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

export function Lab() {
  const { lang } = useI18n()
  return (
    <div>
      <ul className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        {LAB_LINKS.map((l) => (
          <li key={l.href} className="flex items-start gap-4">
            <Thumb seed={l.title} href={l.href} internal className="w-16 sm:w-20" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <h3 className="text-lg" style={{ ...ink, lineHeight: 1.1 }}>
                {l.title}
              </h3>
              <p className="text-base" style={{ ...muted, lineHeight: 1.5 }}>
                {pick(l.sub, lang)}
              </p>
              <div className="mt-1">
                <CtaButton href={l.href} label={pick(l.cta, lang)} internal />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm" style={muted}>
        {pick(UI.labNote, lang)}
      </p>
    </div>
  )
}

export function Elsewhere() {
  const { lang } = useI18n()
  return (
    <ul className="flex flex-col">
      {OUT_LINKS.map((l) => (
        <li
          key={l.href}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b py-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-lg" style={ink}>
              {l.title}
            </span>
            {l.sub && (
              <span className="text-sm" style={muted}>
                {pick(l.sub, lang)}
              </span>
            )}
          </span>
          <CtaButton href={l.href} label={pick(l.cta, lang)} />
        </li>
      ))}
    </ul>
  )
}

interface BlogPost {
  id: string
  title: Localized
  date: string
  excerpt: Localized
  tags?: Localized
}

// blogs.json carries every post body (~300 KB), so it is fetched only
// once someone actually opens this chapter.
let postsCache: BlogPost[] | null = null

export function Blog() {
  const { lang } = useI18n()
  const [posts, setPosts] = useState<BlogPost[] | null>(postsCache)
  useEffect(() => {
    if (postsCache) return
    let live = true
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        if (!Array.isArray(data)) return
        postsCache = data.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3)
        if (live) setPosts(postsCache)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  const fmt = (s: string) => {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`
  }
  return (
    <div className="flex flex-col gap-8">
      {!posts ? (
        <p style={muted}>{pick(UI.loading, lang)}</p>
      ) : (
        posts.map((p, i) => (
          <article key={p.id} className="flex items-start gap-5">
            <Thumb seed={p.id} href={`/blog/${p.id}`} internal src={blogThumbSrc(i)} className="w-20 sm:w-28" />
            <div className="min-w-0">
              <div className="mb-1.5 text-sm" style={muted}>
                {fmt(p.date)}
                {p.tags && <>&nbsp;*&nbsp;{pick(p.tags, lang)}</>}
              </div>
              <Link href={`/blog/${p.id}`} className="block">
                <h3 className="text-xl" style={{ ...ink, lineHeight: 1.1 }}>
                  <span className="ink-underline-hover">{pick(p.title, lang)}</span>
                </h3>
              </Link>
              <p className="mt-2 max-w-2xl text-base" style={{ ...muted, lineHeight: 1.5 }}>
                {pick(p.excerpt, lang)}
              </p>
            </div>
          </article>
        ))
      )}
      <div>
        <CtaButton href="/blog" label={pick(UI.allPosts, lang)} internal />
      </div>
    </div>
  )
}

// =====================================================================
//  Blueprint marks — small ink sketches, one per chapter.
// =====================================================================

function Svg({ children, size = 30 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "url(#ink-wobble)" }}
    >
      {children}
    </svg>
  )
}

const MARKS: Record<MarkName, React.ReactNode> = {
  bauhaus: (
    <>
      <rect x="3" y="12" width="10" height="10" />
      <circle cx="26" cy="17" r="6" />
      <path d="M10 33 L18 22 L26 33 Z" />
    </>
  ),
  rams: (
    <>
      <rect x="3" y="3" width="30" height="30" />
      <circle cx="18" cy="18" r="9" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </>
  ),
  fork: (
    <>
      <path d="M14 4 L14 18" />
      <path d="M22 4 L22 18" />
      <rect x="11" y="18" width="14" height="4" />
      <path d="M18 22 L18 32" />
    </>
  ),
  eye: (
    <>
      <path d="M3 18 Q 18 4 33 18 Q 18 32 3 18 Z" />
      <circle cx="18" cy="18" r="5" />
    </>
  ),
  hill: (
    <>
      <path d="M3 6 L33 30" />
      <path d="M3 30 L33 30" />
      <circle cx="16" cy="22" r="2" fill="currentColor" />
    </>
  ),
  node: (
    <>
      <rect x="3" y="10" width="10" height="8" />
      <rect x="23" y="20" width="10" height="8" />
      <path d="M13 14 C 19 14, 18 24, 23 24" />
    </>
  ),
  brain: (
    <>
      <path d="M6 22 Q 6 10 18 8 Q 30 10 30 22 Q 30 30 24 30 L 12 30 Q 6 30 6 22 Z" />
      <path d="M12 16 Q 18 20 24 16" />
    </>
  ),
  enso: <path d="M30 18 a 12 12 0 1 0 -12 12" />,
  pin: (
    <>
      <circle cx="18" cy="12" r="4" />
      <path d="M18 16 L18 32" />
    </>
  ),
  coconut: (
    <>
      <circle cx="18" cy="18" r="12" />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" />
      <circle cx="22" cy="14" r="1.4" fill="currentColor" />
    </>
  ),
  fist: (
    <>
      <path d="M8 30 L8 14 L28 14 L28 30" />
      <path d="M13 14 L13 8 M18 14 L18 6 M23 14 L23 8" />
    </>
  ),
  cross: (
    <>
      <path d="M8 8 L28 28" />
      <path d="M28 8 L8 28" />
    </>
  ),
  scale: (
    <>
      <path d="M18 5 L18 31" />
      <path d="M6 11 L30 11" />
      <path d="M6 11 L3 20 L9 20 Z" />
      <path d="M30 11 L27 20 L33 20 Z" />
    </>
  ),
  anchor: (
    <>
      <circle cx="18" cy="7" r="3" />
      <path d="M18 10 L18 31" />
      <path d="M6 22 Q 8 31 18 31 Q 28 31 30 22" />
    </>
  ),
  play: (
    <>
      <rect x="3" y="7" width="30" height="22" />
      <path d="M15 13 L23 18 L15 23 Z" />
    </>
  ),
  frame: (
    <>
      <rect x="5" y="5" width="26" height="26" />
      <path d="M5 26 L14 17 L21 24 L25 20 L31 26" />
    </>
  ),
  flask: (
    <>
      <path d="M14 4 L14 14 L5 31 L31 31 L22 14 L22 4" />
      <path d="M11 4 L25 4" />
    </>
  ),
  pen: (
    <>
      <path d="M6 30 L9 21 L25 5 L31 11 L15 27 Z" />
      <path d="M21 9 L27 15" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 18 L30 18" />
      <path d="M22 10 L30 18 L22 26" />
    </>
  ),
}

export function ChapterMark({ name, size }: { name: MarkName; size?: number }) {
  return <Svg size={size}>{MARKS[name]}</Svg>
}
