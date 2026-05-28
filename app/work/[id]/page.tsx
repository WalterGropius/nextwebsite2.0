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

// Tag-driven fallback paragraphs — only used when a project doesn't
// ship its own `body` markdown yet, so the page still has texture.
const TAG_NOTES: Record<string, { para: string; aside?: string }> = {
  "3D":              { para: "Modeled, lit, and rendered in a real-time pipeline. Topology kept clean enough to bake, sparse enough to push to the web. Materials wired with substance plus a handful of custom shaders.", aside: "blender · houdini · substance" },
  "VR":              { para: "Built for HMDs from the start — locomotion, comfort, and frame budget all came before visual polish. Spent more time tuning the IPD-corrected render than building the assets.", aside: "unreal · openxr · steamvr" },
  "AR":              { para: "Markerless tracking on commodity phone hardware. The scene was authored once, retargeted to ARKit and ARCore via a thin platform adapter.", aside: "arkit · arcore · usdz" },
  "VFX":             { para: "On-set data capture and post pipeline. Chrome ball + macbeth + HDRI sphere for every setup so the comp had a fighting chance of believing the plate.", aside: "nuke · resolve · houdini" },
  "VP":              { para: "Virtual production: real-time set extension on LED walls, camera tracking through the engine, and a content pipeline that survived directorial changes.", aside: "unreal · stype · disguise" },
  "Game Design":     { para: "Loop design first, content second. Prototypes shipped in days to feel the seconds-per-decision before any art committed.", aside: "godot · unity" },
  "Graphic Design":  { para: "Composed around silence as much as the marks themselves. Hand-set type, contrast that survives a phone screen and a printed sheet.", aside: "figma · gimp · ink" },
  "r&d":             { para: "An experiment more than a deliverable. Wanted to find the edge of what the tooling could do, write down what broke, and bring those edges into the next real project.", aside: "notebook entry" },
  "NFT":             { para: "On-chain artifact with off-chain provenance. Minted with the artist credited as the deployer, not the gallery — small fight worth picking.", aside: "evm · ipfs" },
  "Web Design":      { para: "Designed at the breakpoints I actually use. Real device tests over emulator screenshots. The CMS came after the design, never before.", aside: "next.js · figma · motion" },
  "grading":         { para: "Colour pass: lift, gamma, gain by node, then printlights to lock the look. Calibrated display so the SDR/HDR delivery actually matched the grade.", aside: "resolve · baselight" },
  "3D modeling":     { para: "From reference board to silhouette to subdiv. Topology that bakes cleanly to a low-poly cage was non-negotiable.", aside: "blender · zbrush" },
  "Video":           { para: "Edit-first. The reel was cut to music before a single shot was finalised, then we worked backward to deliver only what survived the cut.", aside: "premiere · resolve" },
  "Rendering":       { para: "Path-traced final frames with a few targeted shortcuts where the eye wouldn't notice. Render farm scheduled around the project's actual hot/cold weeks.", aside: "cycles · redshift" },
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
          const tags = pick(p.tags, "en").split(",").map((t) => t.trim()).filter(Boolean)
          setRelated(
            list
              .filter((q) => q.id !== p.id && pick(q.tags, "en").split(",").some((t) => tags.includes(t.trim())))
              .slice(0, 4),
          )
        } else {
          setError("Project not found.")
        }
      })
      .catch(() => setError("Couldn't load."))
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
            <span className="ink-underline-hover">back to work</span>
          </Link>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>loading…</p>
          ) : error || !project ? (
            <p style={{ color: "var(--vermilion)", fontFamily: "var(--font-display)" }}>{error}</p>
          ) : (
            <ProjectArticle project={project} related={related} />
          )}
        </article>
      </main>
    </PageLoader>
  )
}

function ProjectArticle({ project, related }: { project: ProjectItem; related: ProjectItem[] }) {
  const { lang } = useI18n()
  // Display tags follow the UI language; the English set drives the
  // TAG_NOTES fallback lookup (its keys are English).
  const tags = pick(project.tags, lang).split(",").map((t) => t.trim()).filter(Boolean)
  const enTags = pick(project.tags, "en").split(",").map((t) => t.trim()).filter(Boolean)
  // Merge the legacy single `link` field into the new `links` array
  // so we have one rendering path.
  const allLinks: ProjectLink[] = [
    ...(project.links ?? []),
    ...(project.link && !(project.links ?? []).some((l) => l.href === project.link)
      ? [{ label: "open original", href: project.link }]
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
          {/* Body — either the project's own markdown, or the legacy
              tag-driven fallback. */}
          {project.body ? (
            <BodyMarkdown body={pick(project.body, lang)} />
          ) : (
            <FallbackBody project={project} tags={enTags} lang={lang} />
          )}

          {/* Media gallery — images, videos, and embeds, in the order
              the JSON lists them. Each gets its own caption block. */}
          {media.length > 0 && (
            <section>
              <h2
                className="mb-4 text-2xl sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                <span className="ink-underline">media</span>
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
                <span className="ink-underline">links</span>
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
            * meta
          </div>
          <dl
            className="flex flex-col gap-2 text-sm"
            style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
          >
            <Meta k="date" v={project.date.toLowerCase()} />
            <Meta k="tags" v={tags.join(" * ").toLowerCase()} />
            <Meta k="id"   v={`#${project.id}`} />
          </dl>

          {related.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                * related
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

function FallbackBody({ project, tags, lang }: { project: ProjectItem; tags: string[]; lang: string }) {
  return (
    <>
      <Block title="context">
        <p>
          {pick(project.description, lang)} It started in {project.date.toLowerCase()} and grew into
          the version you see above. The thing I keep coming back to is what the
          constraints did to the final shape — every tradeoff is visible if you know
          where to look.
        </p>
      </Block>

      <Block title="how it was made">
        {tags.length === 0 ? (
          <p>Bespoke build. Reach out if you want the actual stack.</p>
        ) : (
          tags.map((t) => {
            const note = TAG_NOTES[t]
            if (!note) return null
            return (
              <p key={t}>
                <strong>{t.toLowerCase()}.</strong> {note.para}{" "}
                {note.aside && (
                  <em style={{ opacity: 0.7 }}>— {note.aside}</em>
                )}
              </p>
            )
          })
        )}
      </Block>

      <Block title="what i&rsquo;d change">
        <p>
          The decision I&rsquo;d revisit now is how late the design was locked. The piece
          works, but a longer R&amp;D pass at the start would have saved a week of
          re-renders at the end. Lesson: pay for ambiguity early, never late.
        </p>
      </Block>
    </>
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="mb-3 text-2xl sm:text-3xl"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        <span className="ink-underline">{title}</span>
      </h2>
      <div
        className="flex flex-col gap-3 text-base sm:text-lg"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </section>
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
