"use client"

import { Navigation } from "@/components/navigation"
import { SketchfabEmbed } from "@/components/sketchfab-embed"
import { PageLoader } from "@/components/page-loader"

export default function Sketchfab() {
  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <div className="pt-20">
          <SketchfabEmbed />
        </div>
      </main>
    </PageLoader>
  )
}
