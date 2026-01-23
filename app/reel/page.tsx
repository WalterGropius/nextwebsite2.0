"use client"

import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { Play, Volume2, VolumeX } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function Reel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <PageLoader>
      <main 
        className="relative min-h-screen flex flex-col"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />
        
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="accent-line mx-auto mb-4" />
            <h1 
              className="text-4xl font-bold sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="gradient-text">Showreel</span>
            </h1>
            <p className="mt-4 text-gray-400">
              A curated collection of VFX, 3D, and creative technology work
            </p>
          </div>

          {/* Video container */}
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl">
            {/* Video */}
            <video
              ref={videoRef}
              src="/reel_sm.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedData={() => setIsLoaded(true)}
              className="w-full rounded-2xl"
              style={{
                maxHeight: "70vh",
                objectFit: "contain",
                background: "var(--surface-elevated)",
              }}
            />

            {/* Loading state */}
            {!isLoaded && (
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{ background: "var(--surface-elevated)" }}
              >
                <div 
                  className="h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--vista-blue)", borderTopColor: "transparent" }}
                />
              </div>
            )}

            {/* Controls overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={togglePlay}
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <div className="flex gap-1">
                    <span className="h-3 w-1 rounded-full bg-white" />
                    <span className="h-3 w-1 rounded-full bg-white" />
                  </div>
                ) : (
                  <Play size={16} className="ml-1 text-white" fill="white" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex gap-4">
            <a href="/portfolio-s" className="btn-secondary">
              View Portfolio
            </a>
            <a href="mailto:zenbauhaus@gmail.com" className="btn-primary">
              Get in Touch
            </a>
          </div>
        </div>
      </main>
    </PageLoader>
  )
}
