"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"

interface ProjectItem {
  id: number
  image: string
  title: string
  description: string
  date: string
  link: string
  tags: string
}

// Tiny content engine: each tag gets a paragraph + sometimes a
// side-note. Until each project gets a real write-up, this gives
// every subpage texture and signal rather than the same lorem.
const TAG_NOTES: Record<string, { para: string; aside?: string }> = {
  "3D": {
    para: "Modeled, lit, and rendered in a real-time pipeline. Topology kept clean enough to bake, sparse enough to push to the web. Materials wired with substance plus a handful of custom shaders.",
    aside: "blender · houdini · substance",
  },
  "VR": {
    para: "Built for HMDs from the start — locomotion, comfort, and frame budget all came before visual polish. Spent more time tuning the IPD-corrected render than building the assets.",
    aside: "unreal · openxr · steamvr",
  },
  "AR": {
    para: "Markerless tracking on commodity phone hardware. The scene was authored once, retargeted to ARKit and ARCore via a thin platform adapter.",
    aside: "arkit · arcore · usdz",
  },
  "VFX": {
    para: "On-set data capture and post pipeline. Chrome ball + macbeth + HDRI sphere for every setup so the comp had a fighting chance of believing the plate.",
    aside: "nuke · resolve · houdini",
  },
  "VP": {
    para: "Virtual production: real-time set extension on LED walls, camera tracking through the engine, and a content pipeline that survived directorial changes.",
    aside: "unreal · stype · disguise",
  },
  "Game Design": {
    para: "Loop design first, content second. Prototypes shipped in days to feel the seconds-per-decision before any art committed.",
    aside: "godot · unity",
  },
  "Graphic Design": {
    para: "Composed around silence as much as the marks themselves. Hand-set type, contrast that survives a phone screen and a printed sheet.",
    aside: "figma · gimp · ink",
  },
  "r&d": {
    para: "An experiment more than a deliverable. Wanted to find the edge of what the tooling could do, write down what broke, and bring those edges into the next real project.",
    aside: "notebook entry",
  },
  "NFT": {
    para: "On-chain artifact with off-chain provenance. Minted with the artist credited as the deployer, not the gallery — small fight worth picking.",
    aside: "evm · ipfs",
  },
  "Web Design": {
    para: "Designed at the breakpoints I actually use. Real device tests over emulator screenshots. The CMS came after the design, never before.",
    aside: "next.js · figma · motion",
  },
  "grading": {
    para: "Colour pass: lift, gamma, gain by node, then printlights to lock the look. Calibrated display so the SDR/HDR delivery actually matched the grade.",
    aside: "resolve · baselight",
  },
  "3D modeling": {
    para: "From reference board to silhouette to subdiv. Topology that bakes cleanly to a low-poly cage was non-negotiable.",
    aside: "blender · zbrush",
  },
  "Video": {
    para: "Edit-first. The reel was cut to music before a single shot was finalised, then we worked backward to deliver only what survived the cut.",
    aside: "premiere · resolve",
  },
  "Rendering": {
    para: "Path-traced final frames with a few targeted shortcuts where the eye wouldn't notice. Render farm scheduled around the project's actual hot/cold weeks.",
    aside: "cycles · redshift",
  },
}

function findProject(list: ProjectItem[], id: string): ProjectItem | null {
  const numeric = Number.parseInt(id, 10)
  if (!Number.isNaN(numeric)) {
    const p = list.find((p) => p.id === numeric)
    if (p) return p
  }
  // fallback: slug match
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return list.find((p) => slugify(p.title) === id) ?? null
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
          const tags = p.tags.split(",").map((t) => t.trim()).filter(Boolean)
          setRelated(
            list
              .filter((q) => q.id !== p.id && q.tags.split(",").some((t) => tags.includes(t.trim())))
              .slice(0, 4),
          )
        } else {
          setError("Project not found.")
        }
      })
      .catch(() => setError("Couldn't load."))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
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
  const tags = project.tags.split(",").map((t) => t.trim()).filter(Boolean)

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
          <MotionText text={project.title.toLowerCase()} split="char" stagger={0.025} />
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
          {project.description}
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
          alt={project.title}
          className="ink-photo block w-full"
          style={{ maxHeight: "70vh", objectFit: "cover" }}
        />
      </motion.div>

      <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
        <InkLine fade={false} thickness={1.2} />
      </div>

      <section className="prose-like grid gap-10 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <Block title="context">
            <p>
              {project.description} It started in {project.date.toLowerCase()} and grew into
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
                      <em style={{ opacity: 0.7 }}>
                        — {note.aside}
                      </em>
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

          {project.link && (
            <Block title="see it live">
              <p>
                The original is hosted off-site — the version below preserves what was
                shipped at the time.
              </p>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-3 inline-flex"
              >
                <ExternalLink size={14} className="ink-icon" />
                <span>open original</span>
              </a>
            </Block>
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
                        <span className="ink-underline-hover">{r.title.toLowerCase()}</span>
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
