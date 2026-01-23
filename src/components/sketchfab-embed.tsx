"use client"

import { useState } from "react"
import { Box, ExternalLink } from "lucide-react"

export function SketchfabEmbed() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="section-container">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="accent-line mx-auto mb-6" />
          <div className="mb-4 flex items-center justify-center gap-3">
            <Box size={32} style={{ color: "var(--vista-blue)" }} />
            <h2 
              className="text-4xl font-bold sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              3D <span className="gradient-text">Gallery</span>
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Interactive 3D models and digital sculptures from my portfolio
          </p>
        </div>

        {/* Embed container */}
        <div 
          className="glass-card relative mx-auto max-w-6xl overflow-hidden p-2"
        >
          {/* Loading state */}
          {!isLoaded && (
            <div 
              className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
              style={{ background: "var(--surface-elevated)" }}
            >
              <div className="text-center">
                <div 
                  className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--vista-blue)", borderTopColor: "transparent" }}
                />
                <p className="text-gray-400">Loading 3D gallery...</p>
              </div>
            </div>
          )}

          <iframe
            src="https://sketchfab.com/playlists/embed?collection=ff58263bbe42472fb3d657a709d71d81&autostart=1"
            title="3D Works Gallery"
            frameBorder="0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            onLoad={() => setIsLoaded(true)}
            className="w-full rounded-xl"
            style={{
              height: "clamp(400px, 60vw, 70vh)",
              minHeight: "400px",
              background: "var(--surface-elevated)",
            }}
          />
        </div>

        {/* External link */}
        <div className="mt-8 text-center">
          <a
            href="https://sketchfab.com/zenbauhaus"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            View on Sketchfab
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
