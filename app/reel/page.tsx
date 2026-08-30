"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Maximize2, Play, Volume2, VolumeX } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { useT } from "@/lib/i18n/provider"

// Pick the reel rendition per device: the 720p file is 26MB, the 480p
// 13MB. Small screens can't show the extra pixels and data-saver
// connections shouldn't pay for them.
function pickReelSrc(): string {
  if (typeof window === "undefined") return "/reel_720.mp4"
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection
  const small = window.innerWidth * (window.devicePixelRatio || 1) < 1000
  const frugal =
    conn?.saveData === true ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "3g"
  return small || frugal ? "/reel_480.mp4" : "/reel_720.mp4"
}

export default function Reel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  const t = useT()

  useEffect(() => {
    // Resolved on the client so SSR markup stays deterministic.
    setSrc(pickReelSrc())
  }, [])

  useEffect(() => {
    if (src) videoRef.current?.play().catch(() => {})
  }, [src])

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
  }
  const toggleFullscreen = () => {
    const el = videoRef.current
    if (!el) return
    // Standard + WebKit fallback for iOS Safari, which only exposes
    // the per-video webkitEnterFullscreen API.
    type WebkitFullscreen = HTMLVideoElement & {
      webkitEnterFullscreen?: () => void
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else {
      const wk = el as WebkitFullscreen
      wk.webkitEnterFullscreen?.()
    }
  }

  return (
    <PageLoader>
      <main
        className="relative min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />

        <section className="section-container pb-16 pt-28 sm:pt-32">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h1
              className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.9]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
              }}
            >
              <MotionText text={t("reel.title.0")} split="char" from="up" stagger={0.045} />
              <MotionText
                text={t("reel.title.1")}
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
              {t("reel.descriptor")}
            </motion.p>
          </div>

          <div className="mb-6" style={{ color: "var(--ink)", opacity: 0.6 }}>
            <InkLine fade={false} thickness={1.2} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full overflow-hidden"
            style={{
              border: "1.5px solid var(--ink)",
              filter: "url(#ink-wobble)",
              zIndex: 35,
            }}
          >
            <video
              ref={videoRef}
              poster="/reel-poster.webp"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onLoadedData={() => setIsLoaded(true)}
              className="block w-full"
              style={{
                maxHeight: "72vh",
                objectFit: "contain",
                background: "var(--surface-dark)",
              }}
            >
              {/* H.264 baseline — plays in every browser. The old
                  reel_sm.mp4 was HEVC, which Chrome and Firefox cannot
                  decode, so the reel was silently blank for most
                  visitors. Rendition (480p/720p) picked client-side by
                  screen size + connection. */}
              {src && <source src={src} type="video/mp4" />}
            </video>
            {!isLoaded && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                style={{ background: "var(--surface-dark)" }}
              >
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {t("reel.loading")}
                </p>
              </div>
            )}
            <div className="ink-icons absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: "var(--surface-dark)",
                  color: "var(--ink)",
                  border: "1.5px solid var(--ink)",
                }}
                aria-label={t(isPlaying ? "reel.pause" : "reel.play")}
              >
                {isPlaying ? (
                  <span className="flex gap-1">
                    <span
                      className="h-3 w-1 rounded-full"
                      style={{ background: "var(--ink)" }}
                    />
                    <span
                      className="h-3 w-1 rounded-full"
                      style={{ background: "var(--ink)" }}
                    />
                  </span>
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: "var(--surface-dark)",
                  color: "var(--ink)",
                  border: "1.5px solid var(--ink)",
                }}
                aria-label={t(isMuted ? "reel.unmute" : "reel.mute")}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: "var(--surface-dark)",
                  color: "var(--ink)",
                  border: "1.5px solid var(--ink)",
                }}
                aria-label={t("reel.fullscreen")}
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </motion.div>

          {/* Related — keep visitors moving through the work instead of
              dead-ending on the player. */}
          <div className="mt-16">
            <h2
              className="mb-6 text-2xl sm:text-3xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {t("reel.more")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { href: "/portfolio-s", label: t("nav.work"), blurb: t("reel.more.work") },
                { href: "/sketchfab", label: t("nav.3d"), blurb: t("reel.more.3d") },
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
          </div>
        </section>
      </main>
    </PageLoader>
  )
}
