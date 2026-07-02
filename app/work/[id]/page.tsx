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
const TAG_NOTES: Record<string, { para: Localized; aside?: string }> = {
  "3D":              { para: { en: "Modeled, lit, and rendered in a real-time pipeline. Topology kept clean enough to bake, sparse enough to push to the web. Materials wired with substance plus a handful of custom shaders.", cs: "Vymodelováno, nasvíceno a vyrenderováno v real-time pipeline. Topologie dost čistá na bake, dost řídká na web. Materiály postavené v Substance plus pár vlastních shaderů.", fr: "Modélisé, éclairé et rendu dans un pipeline temps réel. Topologie assez propre pour le bake, assez légère pour le web. Matériaux montés sous Substance plus une poignée de shaders maison." }, aside: "blender · houdini · substance" },
  "VR":              { para: { en: "Built for HMDs from the start — locomotion, comfort, and frame budget all came before visual polish. Spent more time tuning the IPD-corrected render than building the assets.", cs: "Stavěné pro headsety od začátku — pohyb, komfort a snímkový rozpočet měly přednost před vizuálem. Víc času padlo na ladění renderu s korekcí IPD než na samotné assety.", fr: "Conçu pour les casques dès le départ — locomotion, confort et budget d'images avant le vernis visuel. Plus de temps passé à régler le rendu corrigé en IPD qu'à fabriquer les assets." }, aside: "unreal · openxr · steamvr" },
  "AR":              { para: { en: "Markerless tracking on commodity phone hardware. The scene was authored once, retargeted to ARKit and ARCore via a thin platform adapter.", cs: "Bezmarkerový tracking na běžných telefonech. Scéna se vytvořila jednou a přemapovala na ARKit a ARCore přes tenký platformní adaptér.", fr: "Tracking sans marqueur sur du matériel de téléphone grand public. La scène a été créée une fois, puis reciblée sur ARKit et ARCore via un fin adaptateur de plateforme." }, aside: "arkit · arcore · usdz" },
  "VFX":             { para: { en: "On-set data capture and post pipeline. Chrome ball + macbeth + HDRI sphere for every setup so the comp had a fighting chance of believing the plate.", cs: "Sběr dat na place a postprodukční pipeline. Chrome ball + macbeth + HDRI koule u každého setupu, aby měl komp šanci plátu uvěřit.", fr: "Capture de données sur le plateau et pipeline de post. Chrome ball + macbeth + sphère HDRI à chaque setup, pour que le compositing ait une chance de croire la plaque." }, aside: "nuke · resolve · houdini" },
  "VP":              { para: { en: "Virtual production: real-time set extension on LED walls, camera tracking through the engine, and a content pipeline that survived directorial changes.", cs: "Virtuální produkce: real-time rozšíření scény na LED stěnách, tracking kamery skrz engine a obsahová pipeline, co přežila režisérské změny.", fr: "Production virtuelle : extension de décor en temps réel sur murs LED, tracking caméra via le moteur, et un pipeline de contenu qui a survécu aux changements de mise en scène." }, aside: "unreal · stype · disguise" },
  "Game Design":     { para: { en: "Loop design first, content second. Prototypes shipped in days to feel the seconds-per-decision before any art committed.", cs: "Nejdřív design smyčky, obsah až potom. Prototypy hotové za pár dní, aby šlo cítit vteřiny na rozhodnutí dřív, než se nasadí grafika.", fr: "Le design de boucle d'abord, le contenu ensuite. Prototypes livrés en quelques jours pour sentir les secondes-par-décision avant d'engager le moindre art." }, aside: "godot · unity" },
  "Graphic Design":  { para: { en: "Composed around silence as much as the marks themselves. Hand-set type, contrast that survives a phone screen and a printed sheet.", cs: "Komponováno kolem ticha stejně jako kolem samotných tahů. Ručně sázená typografie, kontrast, co přežije displej telefonu i potištěný arch.", fr: "Composé autour du silence autant que des signes eux-mêmes. Typographie composée à la main, contraste qui survit à un écran de téléphone comme à une feuille imprimée." }, aside: "figma · gimp · ink" },
  "r&d":             { para: { en: "An experiment more than a deliverable. Wanted to find the edge of what the tooling could do, write down what broke, and bring those edges into the next real project.", cs: "Spíš experiment než zakázka. Chtěl jsem najít hranici toho, co nástroje zvládnou, sepsat, co se rozbilo, a ty hranice přenést do dalšího opravdového projektu.", fr: "Une expérience plus qu'un livrable. Je voulais trouver la limite de ce que l'outillage pouvait faire, noter ce qui cassait, et amener ces limites dans le prochain vrai projet." }, aside: "notebook entry" },
  "NFT":             { para: { en: "On-chain artifact with off-chain provenance. Minted with the artist credited as the deployer, not the gallery — small fight worth picking.", cs: "On-chain artefakt s off-chain proveniencí. Mintnuté tak, že jako deployer je uvedený umělec, ne galerie — malá bitva, která stála za to.", fr: "Artefact on-chain à provenance off-chain. Minté avec l'artiste crédité comme déployeur, pas la galerie — petite bataille qui valait la peine." }, aside: "evm · ipfs" },
  "Web Design":      { para: { en: "Designed at the breakpoints I actually use. Real device tests over emulator screenshots. The CMS came after the design, never before.", cs: "Navrženo na breakpointech, které sám používám. Testy na opravdových zařízeních místo screenshotů z emulátoru. CMS přišel až po designu, nikdy předtím.", fr: "Conçu aux breakpoints que j'utilise vraiment. Tests sur appareils réels plutôt que captures d'émulateur. Le CMS est venu après le design, jamais avant." }, aside: "next.js · figma · motion" },
  "grading":         { para: { en: "Colour pass: lift, gamma, gain by node, then printlights to lock the look. Calibrated display so the SDR/HDR delivery actually matched the grade.", cs: "Barevný průchod: lift, gamma, gain po nodech, pak printlights pro zamknutí looku. Kalibrovaný monitor, aby SDR/HDR výstup opravdu odpovídal gradu.", fr: "Passe couleur : lift, gamma, gain par nœud, puis printlights pour verrouiller le look. Écran calibré pour que la livraison SDR/HDR colle vraiment à l'étalonnage." }, aside: "resolve · baselight" },
  "3D modeling":     { para: { en: "From reference board to silhouette to subdiv. Topology that bakes cleanly to a low-poly cage was non-negotiable.", cs: "Od reference boardu přes siluetu k subdivu. Topologie, co se čistě zapeče do low-poly klece, byla nediskutovatelná.", fr: "Du board de référence à la silhouette jusqu'au subdiv. Une topologie qui se bake proprement sur une cage low-poly était non négociable." }, aside: "blender · zbrush" },
  "Video":           { para: { en: "Edit-first. The reel was cut to music before a single shot was finalised, then we worked backward to deliver only what survived the cut.", cs: "Střih na prvním místě. Reel se sestříhal do hudby dřív, než byl hotový jediný záběr, a pak jsme šli pozpátku a dodali jen to, co střih přežilo.", fr: "Le montage d'abord. Le reel a été monté sur la musique avant qu'un seul plan ne soit finalisé, puis on a remonté à l'envers pour ne livrer que ce qui a survécu au montage." }, aside: "premiere · resolve" },
  "Rendering":       { para: { en: "Path-traced final frames with a few targeted shortcuts where the eye wouldn't notice. Render farm scheduled around the project's actual hot/cold weeks.", cs: "Finální snímky path-trace s pár cílenými zkratkami tam, kde to oko nepozná. Render farma naplánovaná podle skutečných hot/cold týdnů projektu.", fr: "Images finales en path-tracing avec quelques raccourcis ciblés là où l'œil ne voit rien. Ferme de rendu planifiée selon les vraies semaines chargées/creuses du projet." }, aside: "cycles · redshift" },
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
          const tags = pick(p.tags, "en").split(",").map((t) => t.trim()).filter(Boolean)
          setRelated(
            list
              .filter((q) => q.id !== p.id && pick(q.tags, "en").split(",").some((t) => tags.includes(t.trim())))
              .slice(0, 4),
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
  // Display tags follow the UI language; the English set drives the
  // TAG_NOTES fallback lookup (its keys are English).
  const tags = pick(project.tags, lang).split(",").map((t) => t.trim()).filter(Boolean)
  const enTags = pick(project.tags, "en").split(",").map((t) => t.trim()).filter(Boolean)
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

// Projects without their own `body` markdown get only the honest
// tag-driven craft notes. The old fallback also stamped an invented
// "context" + "what i'd change" story — identical on every project —
// which read as filler the moment you opened two pages. Gone.
function FallbackBody({ tags, lang }: { project: ProjectItem; tags: string[]; lang: string }) {
  const { t: tr } = useI18n()
  return (
    <Block title={tr("work.made")}>
      {tags.length === 0 ? (
        <p>{tr("work.bespoke")}</p>
      ) : (
        tags.map((t) => {
          const note = TAG_NOTES[t]
          if (!note) return null
          return (
            <p key={t}>
              <strong>{t.toLowerCase()}.</strong> {pick(note.para, lang)}{" "}
              {note.aside && (
                <em style={{ opacity: 0.7 }}>— {note.aside}</em>
              )}
            </p>
          )
        })
      )}
    </Block>
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
