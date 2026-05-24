"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Play, Volume2, VolumeX } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { useT } from "@/lib/i18n/provider"

export default function Reel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const t = useT()

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

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
            }}
          >
            <video
              ref={videoRef}
              src="/reel_sm.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedData={() => setIsLoaded(true)}
              className="block w-full"
              style={{
                maxHeight: "72vh",
                objectFit: "contain",
                background: "var(--surface-dark)",
              }}
            />
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
            </div>
          </motion.div>
        </section>
      </main>
    </PageLoader>
  )
}
