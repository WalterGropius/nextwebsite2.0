"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ExternalLink } from "lucide-react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { useT } from "@/lib/i18n/provider"

export function SketchfabEmbed() {
  const [isLoaded, setIsLoaded] = useState(false)
  const t = useT()

  return (
    <section className="relative py-16 sm:py-24">
      <div className="section-container">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1
            className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            <MotionText text={t("sketchfab.title.0")} split="char" from="up" stagger={0.05} />{" "}
            <MotionText
              text={t("sketchfab.title.1")}
              split="char"
              from="up"
              delay={0.15}
              stagger={0.04}
              className="ink-underline"
            />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md text-base"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {t("sketchfab.descriptor")}
          </motion.p>
        </div>

        <div className="mb-6" style={{ color: "var(--ink)", opacity: 0.6 }}>
          <InkLine fade={false} thickness={1.2} />
        </div>

        {/* Embed — lifted above the paper grid (z-30) so the 3d view
            reads at full opacity, not dimmed by the texture overlay. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto overflow-hidden"
          style={{
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            zIndex: 35,
          }}
        >
          {!isLoaded && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: "var(--surface-dark)" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-muted)",
                }}
              >
                {t("sketchfab.loading")}
              </p>
            </div>
          )}
          <iframe
            src="https://sketchfab.com/playlists/embed?collection=ff58263bbe42472fb3d657a709d71d81&autostart=1"
            title="3d works"
            frameBorder="0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            onLoad={() => setIsLoaded(true)}
            className="block w-full"
            style={{
              height: "clamp(440px, 65vh, 760px)",
              background: "var(--surface-dark)",
            }}
          />
        </motion.div>

        <div className="ink-icons mt-8 flex items-center justify-end">
          <a
            href="https://sketchfab.com/zenbauhaus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
            }}
          >
            <span className="ink-underline">{t("sketchfab.cta")}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
