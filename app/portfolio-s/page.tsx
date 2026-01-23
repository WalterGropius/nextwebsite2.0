"use client"

import { Creations } from "@/components/creations"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"

export default function PortfolioPage() {
  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <div className="pt-20">
          <Creations />
        </div>
      </main>
    </PageLoader>
  )
}
