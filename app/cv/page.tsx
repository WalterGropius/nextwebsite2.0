"use client"

import { useRef, useState } from "react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { InkLine } from "@/components/ink-line"
import { MotionText } from "@/components/motion-text"
import { Philosophy } from "@/components/philosophy"
import { Testimonials } from "@/components/testimonials"
import { motion } from "motion/react"
import { Download, Printer } from "lucide-react"
import { useT } from "@/lib/i18n/provider"

const EXPERIENCE_COUNT = 8
const EDUCATION_COUNT = 2
const LANGUAGE_COUNT = 4

// Tool / brand lists — stay English; only the group label is translated.
const capabilityItems: Array<{ labelKey: string; items: string[] }> = [
  {
    labelKey: "cv.cap.0.label",
    items: [
      "unreal engine",
      "blender",
      "houdini",
      "three.js * r3f",
      "webgl * webgpu",
      "unity",
      "substance",
      "webxr",
      "virtual production",
      "glsl",
    ],
  },
  {
    labelKey: "cv.cap.1.label",
    items: [
      "typescript",
      "next.js * react",
      "node.js",
      "python",
      "postgres",
      "docker",
      "c++ * c#",
      "graphql",
      "aws * gcp",
      "systems design",
    ],
  },
  {
    labelKey: "cv.cap.2.label",
    items: [
      "llms * prompting",
      "agentic systems",
      "rag * semantic search",
      "computer vision",
      "pytorch",
      "tensorflow.js",
      "neural nets",
      "nlp",
      "langchain",
      "embeddings",
    ],
  },
  {
    labelKey: "cv.cap.3.label",
    items: [
      "esp32 * arduino",
      "pcb design",
      "3d printing",
      "rapid prototyping",
      "real-time fluid sim",
      "shader pipeline",
    ],
  },
]

const speaking = [
  "nike berlin",
  "fashion tech berlin",
  "czechvrfest",
  "čvut",
  "ciirc",
  "umprum",
]

// Single portrait — the studio shot — inside a wobbled ink frame.
// Faces deform under a heavy displacement filter, so the frame
// (not the photo) carries the wobble; the face stays sharp. The
// outer div is no-print so the portrait stays out of the PDF
// export.
function CVPortrait() {
  return (
    <div
      className="no-print relative mx-auto w-full max-w-[20rem]"
      style={{ aspectRatio: "4 / 5", zIndex: 35 }}
    >
      {/* Inked frame — wobble lives here, not on the photo, so the
          face stays sharp. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          border: "2px solid var(--ink)",
          filter: "url(#ink-wobble-strong)",
          zIndex: 2,
        }}
      />
      <div className="relative h-full w-full overflow-hidden">
        <img
          src="/eli2.webp"
          alt="eliáš bauer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}

// Both download buttons share a single source: /cvBauer.html.
// - HTML button: fetch as a blob and click a synthetic anchor so the
//   browser actually downloads it instead of opening it inline.
// - PDF button: render the same html in a hidden iframe, then run
//   html2pdf on the iframe body — direct download, no print dialog.
function CVDownloads() {
  const [busy, setBusy] = useState<"none" | "html" | "pdf">("none")
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const t = useT()

  const downloadHtml = async () => {
    if (busy !== "none") return
    setBusy("html")
    try {
      const res = await fetch("/cvBauer.html", { cache: "no-store" })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "elias-bauer-cv.html"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setBusy("none")
    }
  }

  const downloadPdf = async () => {
    if (busy !== "none") return
    setBusy("pdf")
    let frame: HTMLIFrameElement | null = null
    try {
      // 1) load cvBauer.html into an offscreen iframe (the &pdf=1
      //    flag suppresses its own download buttons + the autoprint
      //    redirect so we own the rendering).
      frame = document.createElement("iframe")
      frame.style.position = "fixed"
      frame.style.left = "-9999px"
      frame.style.top = "0"
      frame.style.width = "210mm"
      frame.style.height = "297mm"
      frame.src = "/cvBauer.html?pdf=1"
      iframeRef.current = frame
      document.body.appendChild(frame)
      await new Promise<void>((resolve) => {
        if (!frame) return resolve()
        frame.addEventListener("load", () => resolve(), { once: true })
      })
      // give the in-page font + photos a moment to settle
      const doc = frame.contentDocument
      if (doc?.fonts?.ready) {
        await doc.fonts.ready.catch(() => {})
      }
      await new Promise((r) => setTimeout(r, 350))

      // 2) html2pdf renders the iframe body to PDF and downloads it.
      const html2pdf = (await import("html2pdf.js")).default
      const target = doc?.body
      if (!target) throw new Error("iframe body missing")
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: "elias-bauer-cv.pdf",
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f6f6f4",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(target)
        .save()
    } finally {
      if (frame && frame.parentNode) frame.parentNode.removeChild(frame)
      iframeRef.current = null
      setBusy("none")
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={downloadHtml}
        disabled={busy !== "none"}
        className="btn-secondary"
      >
        <Download size={14} />
        <span>{busy === "html" ? "…" : t("cv.downloads.html")}</span>
      </button>
      <button
        type="button"
        onClick={downloadPdf}
        disabled={busy !== "none"}
        className="btn-secondary"
      >
        <Printer size={14} />
        <span>{busy === "pdf" ? "…" : t("cv.downloads.pdf")}</span>
      </button>
    </>
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

export default function CVPage() {
  const t = useT()

  const experience = Array.from({ length: EXPERIENCE_COUNT }, (_, i) => ({
    title: t(`cv.exp.${i}.title`),
    company: t(`cv.exp.${i}.company`),
    period: t(`cv.exp.${i}.period`),
    blurb: t(`cv.exp.${i}.blurb`),
  }))

  const education = Array.from({ length: EDUCATION_COUNT }, (_, i) => ({
    what: t(`cv.edu.${i}.what`),
    where: t(`cv.edu.${i}.where`),
    when: t(`cv.edu.${i}.when`),
  }))

  const languages = Array.from({ length: LANGUAGE_COUNT }, (_, i) => ({
    l: t(`cv.lang.${i}.l`),
    v: t(`cv.lang.${i}.v`),
  }))

  return (
    <PageLoader>
      <main
        className="min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />

        <article className="section-container pb-24 pt-28 sm:pt-32" id="cv-print">
          <header className="mb-16 grid items-start gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h1
                className="text-[clamp(3rem,10vw,7rem)] leading-[0.9]"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                {/* split="word" so a narrow column wraps "eliáš
                    bauer" to two lines on the inter-word space —
                    never mid-letter. */}
                <MotionText text="eliáš bauer" split="word" stagger={0.08} />
              </h1>
              <div
                className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                <span>{t("cv.location")}</span>
                <span aria-hidden style={{ opacity: 0.4 }}>*</span>
                <a href="mailto:zenbauhaus@gmail.com" className="ink-underline-hover">
                  zenbauhaus@gmail.com
                </a>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 max-w-3xl text-lg sm:text-xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {t("cv.intro")}
              </motion.p>

              <div className="no-print ink-icons mt-10 flex flex-wrap items-center gap-3">
                <CVDownloads />
              </div>
            </div>

            <CVPortrait />
          </header>

          <div className="my-12" style={{ color: "var(--ink)", opacity: 0.5 }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          <section className="mb-16">
            <SectionTitle>{t("cv.section.experience")}</SectionTitle>
            <div className="flex flex-col">
              {experience.map((job, i) => (
                <div key={i} className="py-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <div className="flex flex-col">
                      <span
                        className="text-xl sm:text-2xl"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink)",
                          lineHeight: 1.1,
                        }}
                      >
                        {job.title}
                      </span>
                      <span
                        className="text-sm sm:text-base"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {job.company}
                      </span>
                    </div>
                    <span
                      className="shrink-0 text-xs uppercase tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {job.period}
                    </span>
                  </div>
                  <p
                    className="mt-3 max-w-3xl text-base"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    {job.blurb}
                  </p>
                  {i < experience.length - 1 && (
                    <div
                      className="mt-6 opacity-30"
                      style={{ color: "var(--ink)" }}
                    >
                      <InkLine fade thickness={0.9} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <SectionTitle>{t("cv.section.capabilities")}</SectionTitle>
            <div className="grid gap-12 sm:grid-cols-2 md:gap-10 lg:grid-cols-4">
              {capabilityItems.map((g, gi) => (
                <div key={g.labelKey}>
                  <div className="mb-4 flex items-baseline gap-3">
                    <span
                      className="text-[0.7rem] uppercase tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {String(gi + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                      }}
                    >
                      {t(g.labelKey)}
                    </span>
                  </div>
                  <div className="mb-4" style={{ color: "var(--ink)" }}>
                    <InkLine fade={false} thickness={1} />
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {g.items.map((item) => (
                      <li
                        key={item}
                        className="text-base"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink)",
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* "how i build" — moved here from the landing page: the
              philosophy belongs next to the experience it explains, in
              front of the reader who is deciding whether to hire. */}
          <section className="mb-16">
            <Philosophy embedded />
          </section>

          <section className="mb-16 grid gap-12 md:grid-cols-2">
            <div>
              <SectionTitle>{t("cv.section.education")}</SectionTitle>
              <div className="flex flex-col">
                {education.map((e, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 border-b py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex flex-col">
                      <span
                        className="text-lg"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink)",
                        }}
                      >
                        {e.what}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {e.where}
                      </span>
                    </div>
                    <span
                      className="text-xs uppercase tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {e.when}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>{t("cv.section.languages")}</SectionTitle>
              <div className="flex flex-col">
                {languages.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between border-b py-4"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span
                      className="text-lg"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                      }}
                    >
                      {l.l}
                    </span>
                    <span
                      className="text-sm uppercase tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {l.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-16">
            <SectionTitle>{t("cv.section.speaking")}</SectionTitle>
            <ul
              className="flex flex-wrap gap-x-6 gap-y-2 text-lg"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {speaking.map((s, i) => (
                <li key={s} className="flex items-baseline gap-6">
                  <span>{s}</span>
                  {i < speaking.length - 1 && (
                    <span aria-hidden style={{ opacity: 0.4 }}>*</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* client words — also moved off the landing page; social
              proof reads strongest right next to the track record. */}
          <section className="no-print mb-16">
            <Testimonials embedded />
          </section>

          <section className="no-print">
            <div
              className="my-10"
              style={{ color: "var(--ink)", opacity: 0.5 }}
            >
              <InkLine fade={false} thickness={1.4} />
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <a
                href="mailto:zenbauhaus@gmail.com"
                className="text-2xl sm:text-3xl ink-underline"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                zenbauhaus@gmail.com
              </a>
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                {t("cv.cta.taking")}
              </span>
            </div>
          </section>
        </article>
      </main>
    </PageLoader>
  )
}
