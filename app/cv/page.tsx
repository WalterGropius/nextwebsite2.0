"use client"

import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { InkLine } from "@/components/ink-line"
import { MotionText } from "@/components/motion-text"
import { motion } from "motion/react"
import { Download, FileText, Printer } from "lucide-react"

const intro =
  "i build systems, untangle messy problems, and write code. no rigid title — sometimes that's leading a team scaling a startup zero-to-one, sometimes wiring agentic ai, building spatial interfaces in unreal, or tearing apart hardware just to understand it."

const experience = [
  {
    title: "co-founder · cto",
    company: "flipas",
    period: "2024 — 2025",
    blurb:
      "gen z ai life accelerator. architected the mvp, secured seed funding, led a team of five engineers. co-designed sombra — the empathetic conversational mentor. pioneered a dynamic ui framework for ai-driven, context-aware interfaces.",
  },
  {
    title: "founder · creator",
    company: "sombra os",
    period: "2024 — ongoing",
    blurb:
      "local-first cognitive partner. semantic tree-search rag, knowledge distillation, automation pipelines. a living sandbox for collaborating with ai without the ui getting in the way.",
  },
  {
    title: "creator",
    company: "revizor",
    period: "ongoing",
    blurb:
      "spatial computing in unreal 5. open-source intelligence threaded into real-time 3d. procedural generation, complex c++, visual systems that make impossibly dense information legible fast.",
  },
  {
    title: "vfx supervisor #2",
    company: "wilma film · hagen",
    period: "2023",
    blurb:
      "on-set vfx data collection — chrome ball, color chart, hdri pipeline. coordinated with script supervisors for accurate vfx documentation.",
  },
  {
    title: "technical artist",
    company: "numinos · vr historical recreations",
    period: "2023",
    blurb:
      "pushed real-time rendering boundaries for vr. engineered custom real-time flood simulation. immersive recreations of historical cities.",
  },
  {
    title: "spider",
    company: "new life · global innovation",
    period: "2018 — ongoing",
    blurb:
      "product integration, development, talent acquisition. international teams, emerging tech.",
  },
]

const capabilities = [
  {
    label: "3d · vfx · xr",
    items: [
      "unreal engine",
      "blender",
      "houdini",
      "three.js · r3f",
      "webgl · webgpu",
      "unity",
      "substance",
      "webxr",
      "virtual production",
      "glsl",
    ],
  },
  {
    label: "engineering",
    items: [
      "typescript",
      "next.js · react",
      "node.js",
      "python",
      "postgres",
      "docker",
      "c++ · c#",
      "graphql",
      "aws · gcp",
      "systems design",
    ],
  },
  {
    label: "ai",
    items: [
      "llms · prompting",
      "agentic systems",
      "rag · semantic search",
      "computer vision",
      "pytorch",
      "tensorflow.js",
      "neural nets",
      "nlp",
      "langchain",
      "embeddings",
    ],
  },
]

const education = [
  { what: "bac scientifique", where: "lycée français de prague", when: "2013" },
  { what: "self-taught", where: "full-stack · vr/ar · ai/ml · real-time graphics", when: "ongoing" },
]

const languages = [
  { l: "english", v: "fluent" },
  { l: "czech", v: "working" },
  { l: "french", v: "working" },
  { l: "spanish", v: "reading" },
]

const speaking = [
  "nike berlin",
  "fashion tech berlin",
  "czechvrfest",
  "čvut",
  "ciirc",
  "umprum",
]

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
  return (
    <PageLoader>
      <main
        className="min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />

        <article className="section-container pb-24 pt-28 sm:pt-32" id="cv-print">
          {/* Header */}
          <header className="mb-16">
            <h1
              className="text-[clamp(3rem,10vw,7rem)] leading-[0.9]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
              }}
            >
              <MotionText text="eliáš bauer" split="char" stagger={0.04} />
            </h1>
            <div
              className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm uppercase tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              <span>prague · cz</span>
              <span aria-hidden style={{ opacity: 0.4 }}>·</span>
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
              {intro}
            </motion.p>

            {/* Download row */}
            <div className="no-print ink-icons mt-10 flex flex-wrap items-center gap-3">
              <a href="/cvBauer.html" download className="btn-secondary">
                <Download size={14} />
                <span>html</span>
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary"
              >
                <Printer size={14} />
                <span>pdf</span>
              </button>
              <a href="/artBauer.pdf" download className="btn-secondary">
                <FileText size={14} />
                <span>art pdf</span>
              </a>
            </div>
          </header>

          <div className="my-12" style={{ color: "var(--ink)", opacity: 0.5 }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          {/* Experience */}
          <section className="mb-16">
            <SectionTitle>experience</SectionTitle>
            <div className="flex flex-col">
              {experience.map((job, i) => (
                <div key={job.company} className="py-6">
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

          {/* Capabilities */}
          <section className="mb-16">
            <SectionTitle>capabilities</SectionTitle>
            <div className="grid gap-12 md:grid-cols-3 md:gap-10">
              {capabilities.map((g, gi) => (
                <div key={g.label}>
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
                      {g.label}
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

          {/* Education + Languages */}
          <section className="mb-16 grid gap-12 md:grid-cols-2">
            <div>
              <SectionTitle>education</SectionTitle>
              <div className="flex flex-col">
                {education.map((e) => (
                  <div
                    key={e.what}
                    className="flex flex-col gap-0.5 border-b py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    style={{ borderColor: "rgba(15,17,23,0.08)" }}
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
              <SectionTitle>languages</SectionTitle>
              <div className="flex flex-col">
                {languages.map((l) => (
                  <div
                    key={l.l}
                    className="flex items-baseline justify-between border-b py-4"
                    style={{ borderColor: "rgba(15,17,23,0.08)" }}
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

          {/* Speaking */}
          <section className="mb-16">
            <SectionTitle>speaking</SectionTitle>
            <ul
              className="flex flex-wrap gap-x-6 gap-y-2 text-lg"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {speaking.map((s, i) => (
                <li key={s} className="flex items-baseline gap-6">
                  <span>{s}</span>
                  {i < speaking.length - 1 && (
                    <span aria-hidden style={{ opacity: 0.4 }}>·</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
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
                taking on work · 2026
              </span>
            </div>
          </section>
        </article>
      </main>
    </PageLoader>
  )
}
