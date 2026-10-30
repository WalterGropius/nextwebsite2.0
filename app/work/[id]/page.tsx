"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"

type Media =
  | { type: "image"; src: string; alt?: Localized; caption?: Localized }
  | { type: "video"; src: string; poster?: string; caption?: Localized }
  | { type: "embed"; html: string; caption?: Localized }

interface ProjectLink {
  label: Localized
  href: string
}

interface ProjectItem {
  id: number
  image: string
  title: Localized
  description: Localized
  date: string
  link?: string
  tags: Localized
  media?: Media[]
  links?: ProjectLink[]
  body?: Localized | null
}


function findProject(list: ProjectItem[], id: string): ProjectItem | null {
  const numeric = Number.parseInt(id, 10)
  if (!Number.isNaN(numeric)) {
    const p = list.find((p) => p.id === numeric)
    if (p) return p
  }
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  // Slugs are language-independent: always derive from the English title.
  return list.find((p) => slugify(pick(p.title, "en")) === id) ?? null
}

export default function WorkPage() {
  const params = useParams()
  const id = String(params?.id ?? "")
  const { t } = useI18n()
  const [project, setProject] = useState<ProjectItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [related, setRelated] = useState<ProjectItem[]>([])

  useEffect(() => {
    let ignore = false
    fetch("/portfolio.json")
      .then((r) => r.json())
      .then((data: ProjectItem[]) => {
        if (ignore) return
        const list = Array.isArray(data) ? data : []
        const p = findProject(list, id)
        setProject(p)
        if (p) {
          // Match on the stable English tag set, regardless of UI language.
          // Shared tags are weighted by rarity, so two projects tagged
          // "multiplayer" outrank two that merely share the ubiquitous "r&d".
          const tagsOf = (q: ProjectItem) =>
            pick(q.tags, "en").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
          const freq = new Map<string, number>()
          for (const q of list) for (const t of tagsOf(q)) freq.set(t, (freq.get(t) ?? 0) + 1)
          const mine = new Set(tagsOf(p))
          setRelated(
            list
              .filter((q) => q.id !== p.id)
              .map((q, i) => ({
                q,
                i,
                score: tagsOf(q).reduce((s, t) => (mine.has(t) ? s + 1 / (freq.get(t) ?? 1) : s), 0),
              }))
              .filter((r) => r.score > 0)
              .sort((a, b) => b.score - a.score || a.i - b.i)
              .slice(0, 4)
              .map((r) => r.q),
          )
        } else {
          setError("work.notFound")
        }
      })
      .catch(() => setError("work.loadFail"))
      .finally(() => !ignore && setLoading(false))
    return () => { ignore = true }
  }, [id])

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <article
          className="section-container pb-24 pt-28 sm:pt-32"
          style={{ position: "relative", zIndex: 35 }}
        >
          <Link
            href="/portfolio-s"
            className="mb-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            <ArrowLeft size={14} className="ink-icon" />
            <span className="ink-underline-hover">{t("work.back")}</span>
          </Link>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>{t("common.loading")}</p>
          ) : error || !project ? (
            <p style={{ color: "var(--vermilion)", fontFamily: "var(--font-display)" }}>{t(error ?? "work.notFound")}</p>
          ) : (
            <ProjectArticle project={project} related={related} />
          )}
        </article>
      </main>
    </PageLoader>
  )
}

function ProjectArticle({ project, related }: { project: ProjectItem; related: ProjectItem[] }) {
  const { lang, t } = useI18n()
  const tags = pick(project.tags, lang).split(",").map((t) => t.trim()).filter(Boolean)
  // Merge the legacy single `link` field into the new `links` array
  // so we have one rendering path.
  const allLinks: ProjectLink[] = [
    ...(project.links ?? []),
    ...(project.link && !(project.links ?? []).some((l) => l.href === project.link)
      ? [{ label: t("work.openOriginal"), href: project.link }]
      : []),
  ]
  const media: Media[] = project.media ?? []

  return (
    <>
      <header className="mb-10">
        <div
          className="mb-4 flex flex-wrap items-baseline gap-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{project.date}</span>
          <span aria-hidden style={{ opacity: 0.4 }}>*</span>
          <span>{tags.join(" * ").toLowerCase()}</span>
        </div>

        <h1
          className="text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.92]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          <MotionText text={pick(project.title, lang).toLowerCase()} split="char" stagger={0.025} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-3xl text-lg sm:text-xl"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.55,
          }}
        >
          {pick(project.description, lang)}
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative my-10 overflow-hidden"
        style={{ zIndex: 35 }}
      >
        <img
          src={project.image}
          alt={pick(project.title, lang)}
          decoding="async"
          fetchPriority="high"
          className="block w-full"
          style={{ maxHeight: "70vh", objectFit: "cover" }}
        />
        {/* Inked frame for the hero image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            border: "2px solid var(--ink)",
            filter: "url(#ink-wobble-strong)",
          }}
        />
      </motion.div>

      <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
        <InkLine fade={false} thickness={1.2} />
      </div>

      <section className="prose-like grid gap-10 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-10">
          {/* Body — the project's own write-up when it has one. Projects
              without one used to get generic per-tag "how it was made"
              paragraphs stamped on, the same claims on every page; the
              description, media and links above say what's true. */}
          {project.body ? <BodyMarkdown body={pick(project.body, lang)} /> : null}

          {/* Media gallery — images, videos, and embeds, in the order
              the JSON lists them. Each gets its own caption block. */}
          {media.length > 0 && (
            <section>
              <h2
                className="mb-4 text-2xl sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                <span className="ink-underline">{t("work.media")}</span>
              </h2>
              <div className="flex flex-col gap-8">
                {media.map((m, i) => (
                  <MediaBlock key={i} media={m} />
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {allLinks.length > 0 && (
            <section>
              <h2
                className="mb-4 text-2xl sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                <span className="ink-underline">{t("work.links")}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {allLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex"
                    style={{ background: "var(--surface-elevated)" }}
                  >
                    <ExternalLink size={14} className="ink-icon" />
                    <span>{pick(l.label, lang)}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="md:sticky md:top-32 md:self-start">
          <div className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
            * {t("work.meta")}
          </div>
          <dl
            className="flex flex-col gap-2 text-sm"
            style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
          >
            <Meta k={t("work.date")} v={project.date.toLowerCase()} />
            <Meta k={t("work.tags")} v={tags.join(" * ").toLowerCase()} />
            <Meta k="id"   v={`#${project.id}`} />
          </dl>

          {related.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                * {t("work.related")}
              </div>
              <ul className="flex flex-col gap-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/work/${r.id}`}
                      className="group flex items-baseline gap-3"
                    >
                      <span
                        className="shrink-0 text-xs uppercase tracking-[0.3em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        →
                      </span>
                      <span
                        className="text-base"
                        style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
                      >
                        <span className="ink-underline-hover">{pick(r.title, lang).toLowerCase()}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  )
}

function BodyMarkdown({ body }: { body: string }) {
  return (
    <section
      className="prose-md flex flex-col gap-3 text-base sm:text-lg"
      style={{
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
        lineHeight: 1.6,
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </section>
  )
}

function MediaBlock({ media }: { media: Media }) {
  const { lang } = useI18n()
  if (media.type === "image") {
    return (
      <figure className="relative">
        <div className="relative overflow-hidden" style={{ zIndex: 35 }}>
          <img
            src={media.src}
            alt={pick(media.alt, lang)}
            loading="lazy"
            className="block w-full"
            style={{ maxHeight: "75vh", objectFit: "cover" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ border: "2px solid var(--ink)", filter: "url(#ink-wobble-strong)" }}
          />
        </div>
        {media.caption && <Caption>{pick(media.caption, lang)}</Caption>}
      </figure>
    )
  }
  if (media.type === "video") {
    return (
      <figure className="relative">
        <div className="relative overflow-hidden" style={{ zIndex: 35 }}>
          <video
            src={media.src}
            poster={media.poster}
            controls
            playsInline
            className="block w-full"
            style={{ maxHeight: "75vh" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ border: "2px solid var(--ink)", filter: "url(#ink-wobble-strong)" }}
          />
        </div>
        {media.caption && <Caption>{pick(media.caption, lang)}</Caption>}
      </figure>
    )
  }
  // embed — trust the author's HTML
  return (
    <figure className="relative">
      <div
        className="relative overflow-hidden"
        style={{ zIndex: 35 }}
        dangerouslySetInnerHTML={{ __html: media.html }}
      />
      {media.caption && <Caption>{pick(media.caption, lang)}</Caption>}
    </figure>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption
      className="mt-2 text-xs sm:text-sm"
      style={{
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
      }}
    >
      * {children}
    </figcaption>
  )
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-2" style={{ borderColor: "var(--border-subtle)" }}>
      <dt className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
        {k}
      </dt>
      <dd className="text-right">{v}</dd>
    </div>
  )
}
