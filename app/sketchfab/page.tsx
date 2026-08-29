"use client"

import { Navigation } from "@/components/navigation"
import { SketchfabEmbed } from "@/components/sketchfab-embed"
import { PageLoader } from "@/components/page-loader"
import { useT } from "@/lib/i18n/provider"

export default function Sketchfab() {
  const t = useT()
  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <div className="pt-20">
          <SketchfabEmbed />

          {/* Related work — keep the visitor moving. */}
          <section className="section-container pb-24">
            <h2
              className="mb-6 text-2xl sm:text-3xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {t("reel.more")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { href: "/reel", label: t("nav.reel"), blurb: t("reel.more.reel") },
                { href: "/portfolio-s", label: t("nav.work"), blurb: t("reel.more.work") },
                { href: "/art", label: t("reel.more.art.label"), blurb: t("reel.more.art") },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group block p-5"
                  style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      className="text-xl sm:text-2xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                        lineHeight: 1,
                      }}
                    >
                      {item.label}
                    </h3>
                    <span aria-hidden style={{ color: "var(--ink)" }}>→</span>
                  </div>
                  <p
                    className="mt-3 text-sm"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {item.blurb}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </PageLoader>
  )
}
