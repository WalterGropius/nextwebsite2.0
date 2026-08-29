"use client"

import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useRef } from "react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { TiltCard } from "./tilt-card"
import { useT } from "@/lib/i18n/provider"

export function Philosophy({ embedded = false }: { embedded?: boolean }) {
  // embedded — rendered inside an existing section-container (the CV
  // article): skip the outer container and the landing-scale padding.
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const t = useT()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.4,
  })
  const titleY = useTransform(smooth, [0, 1], [80, -50])

  // Three pillars, three different motion profiles. The middle one
  // races past while the outer two drag — like film tracking shots
  // catching different focal planes.
  const pillarSpeeds = [
    { y: 60, rot: -1.2 },
    { y: -90, rot: 1.6 },
    { y: 40, rot: -0.9 },
  ]

  const pillars = [
    {
      n: "01",
      title: t("philosophy.0.title"),
      body: (
        <>
          {t("philosophy.0.body.0")} <strong>{t("philosophy.0.body.1")}</strong>
          {t("philosophy.0.body.2")} <em>{t("philosophy.0.body.3")}</em>
          {t("philosophy.0.body.4")}
        </>
      ),
    },
    {
      n: "02",
      title: t("philosophy.1.title"),
      body: (
        <>
          {t("philosophy.1.body.0")} <em>{t("philosophy.1.body.1")}</em>{" "}
          {t("philosophy.1.body.2")}{" "}
          <strong>{t("philosophy.1.body.3")}</strong>
        </>
      ),
    },
    {
      n: "03",
      title: t("philosophy.2.title"),
      body: (
        <>
          {t("philosophy.2.body.0")} <em>{t("philosophy.2.body.1")}</em>
          {t("philosophy.2.body.2")} <strong>{t("philosophy.2.body.3")}</strong>
          {t("philosophy.2.body.4")}
        </>
      ),
    },
  ]

  const inner = (
    <>
      <motion.h2
        className={
          embedded
            ? "mb-10 text-3xl sm:text-4xl"
            : "mb-14 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]"
        }
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          y: embedded ? undefined : titleY,
        }}
      >
        {embedded ? (
          <span className="ink-underline">
            {t("philosophy.title.0")} {t("philosophy.title.1")}
          </span>
        ) : (
          <>
            <MotionText text={t("philosophy.title.0")} split="word" from="up" />{" "}
            <MotionText
              text={t("philosophy.title.1")}
              split="word"
              from="up"
              delay={0.2}
              className="ink-underline"
            />
          </>
        )}
      </motion.h2>

      <div className="grid gap-12 md:grid-cols-3 md:gap-10">
        {pillars.map((p, i) => (
          <Pillar
            key={p.n}
            p={p}
            i={i}
            inView={inView}
            smooth={smooth}
            speed={embedded ? { y: 0, rot: 0 } : pillarSpeeds[i]}
          />
        ))}
      </div>
    </>
  )

  if (embedded) {
    return (
      <section className="relative" ref={ref}>
        {inner}
      </section>
    )
  }

  return (
    <section className="relative py-20 sm:py-32" ref={ref}>
      <div className="section-container">{inner}</div>
    </section>
  )
}

function Pillar({
  p,
  i,
  inView,
  smooth,
  speed,
}: {
  p: { n: string; title: string; body: React.ReactNode }
  i: number
  inView: boolean
  smooth: MotionValue<number>
  speed: { y: number; rot: number }
}) {
  const y = useTransform(smooth, [0, 1], [speed.y, -speed.y])
  const r = useTransform(smooth, [0, 0.5, 1], [speed.rot, 0, -speed.rot])
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 30, filter: "blur(10px)" }
      }
      transition={{
        type: "spring",
        stiffness: 160,
        damping: 22,
        delay: 0.15 + i * 0.12,
      }}
      style={{
        y,
        rotate: r,
        transformOrigin: "50% 0%",
        perspective: 1000,
      }}
      className="flex flex-col"
    >
      <TiltCard max={7} lift={4} className="flex flex-col gap-4 p-1">
        <div
          className="flex items-baseline gap-3 text-sm uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{p.n}</span>
          <div className="flex-1" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1} />
          </div>
        </div>
        <h3
          className="text-3xl sm:text-4xl"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            lineHeight: 1,
          }}
        >
          {p.title}
        </h3>
        <p
          className="text-base sm:text-lg"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.55,
          }}
        >
          {p.body}
        </p>
      </TiltCard>
    </motion.div>
  )
}
