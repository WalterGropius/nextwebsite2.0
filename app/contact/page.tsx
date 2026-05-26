"use client"

import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"

export default function ContactPage() {
  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        <div className="pt-20">
          <Contact withRadar />
        </div>
      </main>
    </PageLoader>
  )
}
