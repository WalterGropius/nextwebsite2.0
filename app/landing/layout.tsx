import type React from "react"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* The hero's gaussian-splat scene (light theme). React hoists this
          into <head>; keeping it here means only the landing route pays
          the 4MB download up-front — every other page skips it. */}
      <link
        rel="preload"
        as="fetch"
        href="/flowers_white.sog"
        crossOrigin="anonymous"
      />
      {children}
    </>
  )
}
