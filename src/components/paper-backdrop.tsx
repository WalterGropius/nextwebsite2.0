"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

// PaperBackdrop — global texture layer mounted once at the root.
//
//   1. Paper: a pre-rendered, seamless tile of embossed tooth and fibre
//      (scripts/gen-paper.py) plus a slow mottle, centred on 50% grey and
//      blended with soft-light so one asset works on cream and on the dark
//      blueprint. It is attached to the document, not the viewport — the
//      texture scrolls with the words, the way a sheet would. (It used to
//      be a fixed WebGL canvas: the text slid over a static noise field,
//      which broke the illusion, and it held a GL context all session.)
//   2. An SVG millimeter-grid pattern rotated 6° and warped by the
//      ink-wobble filter so the lines feel like a hand-folded sheet.
//
// Both layers are absolute to <body> (position: relative), so they span
// the whole scrollable page and move with it. pointer-events: none.

function PaperGrain() {
  return <div aria-hidden data-paper-grain className="paper-grain" />
}

function MillimeterGrid({ dark }: { dark: boolean }) {
  // Lines: deeply saturated spruce on cream, near-white on the dark
  // blueprint paper.
  const lineColor = dark ? "#ffffff" : "#0e3a1d"
  return (
    <div
      aria-hidden
      data-paper-grid
      style={{
        // Absolute, not fixed — the grid spans the full scrollable height
        // of the document so the lines scroll past with the content like a
        // real sheet. Body is `position: relative`, so inset 0 is the page.
        // The 6° lean lives on the SVG pattern, not on this element: a
        // rotated page-tall box swings hundreds of px past the viewport at
        // its ends on long pages, which widened the document.
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Above the page-level content backgrounds (z-20) so the grid
        // reads on top of every section, but below the navigation
        // (z-50) and below the hero/canvas section (which sets z-[40]
        // on the landing page to mask the grid out from the 3D view).
        zIndex: 30,
        opacity: dark ? 0.45 : 0.72,
        color: lineColor,
        mixBlendMode: dark ? "screen" : "multiply",
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          filter: "url(#ink-wobble)",
          display: "block",
        }}
      >
        <defs>
          <pattern
            id="paper-mm"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 14 0 L 0 0 0 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              strokeOpacity="0.55"
            />
          </pattern>
          <pattern
            id="paper-cm"
            width="70"
            height="70"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-6)"
          >
            <rect width="70" height="70" fill="url(#paper-mm)" />
            <path
              d="M 70 0 L 0 0 0 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeOpacity="0.9"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paper-cm)" />
      </svg>
    </div>
  )
}

export function PaperBackdrop() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === "dark"
  return (
    <>
      {/* Pure CSS (theme handled by html.dark), so it is in the server
          HTML — no flash of flat colour before hydration. */}
      <PaperGrain />
      {mounted && <MillimeterGrid dark={dark} />}
    </>
  )
}
