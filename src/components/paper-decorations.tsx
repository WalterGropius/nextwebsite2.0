"use client"

import { useEffect, useMemo, useState } from "react"

// PaperDecorations — coffee stains + a sprawl of hand-sketched
// doodles. Doodles live in the *side margins* outside the centered
// content column so they never collide with text. Their vertical
// position inside a band is randomised on mount, so a refresh gives
// you a slightly different layout — the sketches feel laid out by
// hand, not pinned by a CSS author.

// ---- Coffee stains (deterministic, large enough to anchor pages) ----

const COFFEE_STAINS: Array<{
  src: string
  top: string
  side: "left" | "right"
  offset: string
  size: number
  rotate: number
  opacity: number
}> = [
  { src: "/coffee2.png", top: "85vh",   side: "right", offset: "-3vw",  size: 360, rotate: -14, opacity: 0.22 },
  { src: "/coffee1.png", top: "190vh",  side: "left",  offset: "-4vw",  size: 420, rotate: 22,  opacity: 0.18 },
  { src: "/coffee4.png", top: "310vh",  side: "right", offset: "2vw",   size: 300, rotate: -38, opacity: 0.2  },
  { src: "/coffee3.png", top: "440vh",  side: "left",  offset: "6vw",   size: 260, rotate: 9,   opacity: 0.16 },
  { src: "/coffee1.png", top: "580vh",  side: "right", offset: "-2vw",  size: 360, rotate: 47,  opacity: 0.19 },
  { src: "/coffee2.png", top: "720vh",  side: "left",  offset: "-3vw",  size: 300, rotate: 18,  opacity: 0.17 },
  { src: "/coffee4.png", top: "860vh",  side: "right", offset: "0vw",   size: 280, rotate: -22, opacity: 0.18 },
]

function CoffeeStains() {
  return (
    <>
      {COFFEE_STAINS.map((s, i) => (
        <img
          key={i}
          src={s.src}
          aria-hidden
          alt=""
          style={{
            position: "absolute",
            top: s.top,
            [s.side]: s.offset,
            width: s.size,
            height: "auto",
            transform: `rotate(${s.rotate}deg)`,
            transformOrigin: "50% 50%",
            opacity: s.opacity,
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 25,
            filter: "saturate(0.75) contrast(1.05)",
            userSelect: "none",
          }}
        />
      ))}
    </>
  )
}

// ---- Doodle catalog + smart placement ----------------------------

// content-column half-width is 660px (--content-max-width 1320px).
// Doodles are positioned `calc(50% ± (HALF + GUTTER))` so their
// inner edge never crosses into the centered text column.
const CONTENT_HALF = 660
const GUTTER = 28

type Doodle = {
  id: string
  width: number
  height: number
  // band: vertical range (in vh) within which to randomly place
  // the doodle. Hand-picked so doodles cluster at points where the
  // page actually has enough vertical real estate.
  band: [number, number]
  // optional preferred side ('any' = randomised)
  side?: "left" | "right" | "any"
  rotate: number
  opacity?: number
  render: () => React.ReactNode
}

const DOODLES: Doodle[] = [
  // === MATH / PHYSICS / CS — margin-notebook tier ===

  // Schrödinger ψ — moved up so it lives near the hero, as requested.
  {
    id: "psi",
    width: 280, height: 160,
    band: [35, 75],
    side: "left",
    rotate: -4,
    render: () => (
      <svg width="280" height="160" viewBox="0 0 280 160" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="28" fontFamily="var(--font-display)" fontSize="18" fill="currentColor" stroke="none">ψ(x, t) — schrödinger</text>
        <path d="M14 90 L268 90" />
        <path d="M30 28 L30 142" />
        <path d="M30 90 Q 55 18, 80 90 T 130 90 T 180 90 T 230 90 T 268 90" strokeWidth="1.5" />
        <path d="M30 42 Q 140 70, 268 86" strokeDasharray="3 3" opacity="0.6" />
        <text x="220" y="130" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">x →</text>
        <text x="6"   y="46" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.55">|ψ|² → prob.</text>
      </svg>
    ),
  },

  // Big O — bumped to the right side, higher up.
  {
    id: "bigo",
    width: 260, height: 180,
    band: [60, 130],
    side: "right",
    rotate: 5,
    render: () => (
      <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="16" fill="currentColor" stroke="none">big o — knowing the cost</text>
        <path d="M28 150 L250 150" />
        <path d="M28 26 L28 150" />
        <path d="M28 150 L240 30"   />
        <text x="220" y="24" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">n</text>
        <path d="M28 150 Q 80 100, 240 88" />
        <text x="212" y="82" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">log n</text>
        <path d="M28 150 Q 110 150, 170 30" />
        <text x="174" y="34" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">n²</text>
        <path d="M28 150 Q 60 150, 90 30" />
        <text x="92" y="34" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">2ⁿ</text>
      </svg>
    ),
  },

  {
    id: "euler",
    width: 260, height: 120,
    band: [150, 230],
    side: "any",
    rotate: -5,
    render: () => (
      <svg width="260" height="120" viewBox="0 0 260 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="48" fontFamily="var(--font-display)" fontSize="32" fill="currentColor" stroke="none">e<tspan baselineShift="super" fontSize="20">iπ</tspan> + 1 = 0</text>
        <text x="6" y="80" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none" opacity="0.65">* the most beautiful equation.</text>
        <text x="6" y="98" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.55">five constants. one breath.</text>
        <path d="M5 110 Q 130 118, 255 110" strokeWidth="1.1" opacity="0.7" />
      </svg>
    ),
  },

  {
    id: "maxwell",
    width: 300, height: 120,
    band: [240, 320],
    side: "any",
    rotate: -7,
    render: () => (
      <svg width="300" height="120" viewBox="0 0 300 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="48" fontFamily="var(--font-display)" fontSize="30" fill="currentColor" stroke="none">∇ × E = − ∂B/∂t</text>
        <text x="6" y="80" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none" opacity="0.7">faraday — fields like to whirl.</text>
        <path d="M0 100 Q150 108, 300 96" strokeWidth="0.9" opacity="0.7" />
      </svg>
    ),
  },

  {
    id: "phi",
    width: 240, height: 180,
    band: [330, 420],
    side: "any",
    rotate: 5,
    render: () => (
      <svg width="240" height="180" viewBox="0 0 240 180" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="26" fontFamily="var(--font-display)" fontSize="18" fill="currentColor" stroke="none">φ ≈ 1.61803398…</text>
        <text x="6" y="46" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">a / b = (a + b) / a</text>
        <path d="M180 160 Q 180 90, 110 90 Q 60 90, 60 140 Q 60 170, 100 170 Q 124 170, 124 156" />
        <rect x="60"  y="90"  width="120" height="80" />
        <rect x="60"  y="90"  width="50"  height="80" />
        <rect x="110" y="120" width="40"  height="50" />
        <rect x="150" y="142" width="20"  height="28" />
      </svg>
    ),
  },

  {
    id: "dfs",
    width: 250, height: 170,
    band: [430, 520],
    side: "any",
    rotate: -3,
    render: () => (
      <svg width="250" height="170" viewBox="0 0 250 170" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dfs(g, v) — depth before breadth</text>
        <path d="M40 90 L100 50" />
        <path d="M40 90 L100 130" />
        <path d="M100 50 L180 80" />
        <path d="M100 130 L180 140" />
        <path d="M180 80 L180 140" />
        <path d="M180 80 L230 50" />
        {[[40,90],[100,50],[100,130],[180,80],[180,140],[230,50]].map(([x,y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="11" fill="var(--surface-dark, #f6f6f4)" />
        ))}
        {["a","b","c","d","e","f"].map((c, i) => (
          <text key={c} x={[40,100,100,180,180,230][i] - 4} y={[90,50,130,80,140,50][i] + 4} fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">{c}</text>
        ))}
      </svg>
    ),
  },

  // === PERSONAL CONCEPTUAL — the substrate of obsessions ===

  {
    id: "splat-skull",
    width: 260, height: 200,
    band: [535, 620],
    side: "any",
    rotate: -6,
    render: () => (
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">gaussian splat — 3d from photons</text>
        <path d="M30 50 L210 40 L235 130 L55 145 Z" strokeDasharray="3 3" opacity="0.5" />
        <path d="M115 60 q -55 4 -55 60 q 0 24 14 36 l 8 12 l 14 -2 l 0 16 l 14 0 l 0 -16 l 14 2 l 8 -12 q 14 -12 14 -36 q 0 -56 -55 -60 z" />
        <ellipse cx="100" cy="108" rx="9" ry="11" />
        <ellipse cx="138" cy="106" rx="9" ry="11" />
        <path d="M120 118 l -3 18 l 6 0 z" />
        {[
          [88,84,8,3,20], [104,72,6,2,40], [128,68,9,3,-12], [148,86,7,2,30],
          [170,110,10,3,-25], [86,138,8,2,15], [120,150,11,3,5], [156,148,8,2,-20],
          [60,100,5,2,55], [200,90,6,2,-40], [192,130,9,3,12], [70,124,6,2,-10],
        ].map(([cx, cy, rx, ry, r], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${r} ${cx} ${cy})`} opacity="0.55" />
        ))}
      </svg>
    ),
  },

  {
    id: "sdf",
    width: 240, height: 200,
    band: [630, 720],
    side: "any",
    rotate: 5,
    render: () => (
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">sdf — smooth min(a, b)</text>
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={`h${i}`} d={`M30 ${50 + i * 22} L210 ${50 + i * 22}`} opacity="0.18" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={`v${i}`} d={`M${30 + i * 25} 50 L${30 + i * 25} 182`} opacity="0.18" />
        ))}
        <path d="M60 130 q -10 -40 30 -40 q 25 -30 60 -10 q 35 -10 40 30 q 10 30 -30 40 q -50 18 -75 0 q -35 0 -25 -20 z" strokeWidth="1.6" />
        <circle cx="78"  cy="118" r="20" opacity="0.35" />
        <rect   x="118"  y="92" width="44" height="44" opacity="0.35" />
        <ellipse cx="180" cy="135" rx="22" ry="10" opacity="0.35" />
        <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">distance fields melt like mercury</text>
      </svg>
    ),
  },

  {
    id: "hourglass",
    width: 220, height: 240,
    band: [730, 820],
    side: "any",
    rotate: -4,
    render: () => (
      <svg width="220" height="240" viewBox="0 0 220 240" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">the polymath&rsquo;s time debt</text>
        <path d="M40 40 L180 40 L180 60 Q 180 100, 110 120 Q 40 100, 40 60 Z" />
        <path d="M70 50 L82 70" />
        <path d="M82 70 L94 64" />
        <path d="M120 48 L132 64 L120 70" opacity="0.7" />
        {[[50,46,3],[150,42,2],[170,48,2],[60,38,2],[100,34,2],[140,36,3],[30,52,2]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
        <path d="M40 240 L180 240 L180 220 Q 180 180, 110 160 Q 40 180, 40 220 Z" />
        <circle cx="110" cy="230" r="3" />
        <circle cx="118" cy="232" r="2" />
        <text x="6" y="200" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">ideas: 99.9%</text>
        <text x="6" y="214" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">execution: ε</text>
      </svg>
    ),
  },

  {
    id: "blackbox",
    width: 200, height: 240,
    band: [830, 920],
    side: "any",
    rotate: 4,
    render: () => (
      <svg width="200" height="240" viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">the black box</text>
        <path d="M70 40 L130 40 L138 220 L62 220 Z" fill="currentColor" stroke="none" opacity="0.85" />
        <path d="M70 40 L130 40 L138 220 L62 220 Z" />
        <path d="M80 60 q 10 30 -4 80 q -10 50 12 70" stroke="rgba(255,255,255,0.9)" />
        <path d="M120 70 q -8 40 4 70 q 12 40 -6 65"  stroke="rgba(255,255,255,0.9)" opacity="0.8" />
        <path d="M95 100 q -6 24 6 36 q 8 12 -2 24"   stroke="rgba(255,255,255,0.6)" />
        <text x="6" y="234" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.65">interpretability ↗</text>
      </svg>
    ),
  },

  {
    id: "osint",
    width: 300, height: 220,
    band: [930, 1030],
    side: "any",
    rotate: -3,
    render: () => (
      <svg width="300" height="220" viewBox="0 0 300 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">revizor — string on a corkboard</text>
        {[
          [30, 50, 60, 36], [150, 40, 70, 30], [240, 70, 50, 40],
          [60, 130, 70, 40], [170, 140, 60, 36], [255, 150, 40, 32],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} />
            <path d={`M${x + 5} ${y + 10} L${x + w - 10} ${y + 10}`} opacity="0.6" />
            <path d={`M${x + 5} ${y + 22} L${x + w - 18} ${y + 22}`} opacity="0.6" />
          </g>
        ))}
        <path d="M60 86  L185 70"   opacity="0.7" />
        <path d="M185 70 L265 90"   opacity="0.7" />
        <path d="M60 86  L95 150"   opacity="0.7" />
        <path d="M95 150 L200 158"  opacity="0.7" />
        <path d="M200 158 L275 166" opacity="0.7" />
        <path d="M185 70 L200 158"  strokeDasharray="2 3" opacity="0.6" />
        <path d="M155 45 L215 65" strokeWidth="2" />
        <path d="M215 45 L155 65" strokeWidth="2" />
      </svg>
    ),
  },

  {
    id: "dmn",
    width: 280, height: 220,
    band: [1040, 1140],
    side: "any",
    rotate: 6,
    render: () => (
      <svg width="280" height="220" viewBox="0 0 280 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dmn → mycorrhizae</text>
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={`gh${i}`} d={`M20 ${50 + i * 22} L130 ${50 + i * 22}`} opacity="0.6" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={`gv${i}`} d={`M${20 + i * 22} 50 L${20 + i * 22} 160`} opacity="0.6" />
        ))}
        <path d="M150 105 q 30 -10 50 -40" />
        <path d="M150 105 q 20 5 40 -2" />
        <path d="M150 105 q 30 20 60 30" />
        <path d="M150 105 q -10 30 15 60" />
        <path d="M200 65 q 10 -8 20 -10" />
        <path d="M200 65 q 14 -2 22 -14" />
        <path d="M190 103 q 12 -4 24 -2" />
        <path d="M210 135 q 18 6 26 0" />
        <path d="M165 165 q 14 0 22 -8" />
        <path d="M165 165 q 18 12 24 6" />
        {[[220,55,2],[220,33,2],[245,40,2],[228,98,2],[245,135,2],[195,170,2],[212,170,2]].map(([x,y,r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
        <path d="M132 105 L148 105" />
        <path d="M148 105 L142 100" />
        <path d="M148 105 L142 110" />
        <text x="6" y="200" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">order → emergence</text>
      </svg>
    ),
  },

  {
    id: "boids",
    width: 320, height: 180,
    band: [1150, 1250],
    side: "any",
    rotate: -4,
    render: () => (
      <svg width="320" height="180" viewBox="0 0 320 180" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">boids — local rules, global shape</text>
        <path d="M40 100 q 60 -60 160 -50 q 70 6 100 20 l -22 14 l -8 -8 l -18 14 l -30 8 q -50 14 -110 4 q -50 -8 -72 -2 z" strokeDasharray="3 3" opacity="0.5" />
        {[
          [70,90,8],[90,82,-10],[110,76,5],[130,72,-8],[155,70,4],[180,68,-6],
          [210,72,2],[235,80,-12],[260,88,6],[280,98,-4],[88,108,12],[112,112,-6],
          [138,112,8],[162,110,-2],[188,108,4],[215,108,-10],[238,112,6],[155,90,3],
          [185,90,-7],[215,90,5],[120,98,-9],[148,98,4],
        ].map(([cx, cy, r], i) => (
          <path key={i} d={`M${cx} ${cy - 5} L${cx + 4} ${cy + 3} L${cx - 4} ${cy + 3} Z`} transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
      </svg>
    ),
  },

  {
    id: "ouroboros",
    width: 220, height: 200,
    band: [1260, 1340],
    side: "any",
    rotate: 3,
    render: () => (
      <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">hyperstition — narrative engine</text>
        <circle cx="110" cy="115" r="62" />
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i / 20) * Math.PI * 2
          const x1 = 110 + Math.cos(a) * 57
          const y1 = 115 + Math.sin(a) * 57
          const x2 = 110 + Math.cos(a) * 67
          const y2 = 115 + Math.sin(a) * 67
          return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />
        })}
        <circle cx="170" cy="100" r="4" fill="currentColor" />
        <path d="M168 116 q -12 6 -22 0" />
        <path d="M82 60 L60 32" />
        <path d="M60 32 l 8 -6 l 6 8" />
        <text x="44" y="22" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">writes itself</text>
      </svg>
    ),
  },

  {
    id: "curta",
    width: 240, height: 200,
    band: [1350, 1440],
    side: "any",
    rotate: -5,
    render: () => (
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">curta — hardware as artifact</text>
        <ellipse cx="120" cy="120" rx="56" ry="14" />
        <path d="M64 120 L64 80" />
        <path d="M176 120 L176 80" />
        <ellipse cx="120" cy="80" rx="56" ry="14" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = -Math.PI / 2 + (i / 8) * Math.PI
          const x = 120 + Math.cos(a) * 50
          const y =  78 + Math.sin(a) *  6
          return <rect key={i} x={x - 6} y={y - 4} width="12" height="8" />
        })}
        <path d="M120 70 L120 40" />
        <circle cx="120" cy="36" r="6" />
        <path d="M50 120 L20 140"  strokeDasharray="2 3" opacity="0.6" />
        <path d="M190 120 L220 140" strokeDasharray="2 3" opacity="0.6" />
        <text x="6"   y="156" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">step drum</text>
        <text x="186" y="156" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">registers</text>
      </svg>
    ),
  },

  {
    id: "markov",
    width: 280, height: 160,
    band: [1450, 1530],
    side: "any",
    rotate: -3,
    render: () => (
      <svg width="280" height="160" viewBox="0 0 280 160" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">markov chain — memoryless leap</text>
        <circle cx="50"  cy="90" r="22" fill="var(--surface-dark, #f6f6f4)" />
        <circle cx="140" cy="60" r="22" fill="var(--surface-dark, #f6f6f4)" />
        <circle cx="140" cy="120" r="22" fill="var(--surface-dark, #f6f6f4)" />
        <circle cx="230" cy="90" r="22" fill="var(--surface-dark, #f6f6f4)" />
        <text x="45"  y="94"  fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₀</text>
        <text x="135" y="64"  fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₁</text>
        <text x="134" y="124" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₂</text>
        <text x="225" y="94"  fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₃</text>
        <path d="M68 80  L120 64" />  <path d="M120 64 L116 60" /> <path d="M120 64 L118 70" />
        <path d="M68 100 L120 120" /> <path d="M120 120 L116 116" /> <path d="M120 120 L118 124" />
        <path d="M162 60  L210 84" /> <path d="M210 84 L204 84" /> <path d="M210 84 L208 78" />
        <path d="M162 120 L210 96" /> <path d="M210 96 L204 96" /> <path d="M210 96 L208 102" />
        <path d="M252 78 q 24 -10 0 -28 q -24 18 0 28" />
      </svg>
    ),
  },

  {
    id: "ifs",
    width: 220, height: 200,
    band: [1540, 1630],
    side: "any",
    rotate: 4,
    render: () => (
      <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">internal family — orbits of self</text>
        <path d="M110 100 L150 60 L200 90 L188 138 L142 170 L96 168 L50 142 L40 96 L70 58 Z" />
        <path d="M110 100 L150 60"  /> <path d="M110 100 L200 90" />
        <path d="M110 100 L188 138" /> <path d="M110 100 L142 170" />
        <path d="M110 100 L96 168"  /> <path d="M110 100 L50 142" />
        <path d="M110 100 L40 96"   /> <path d="M110 100 L70 58" />
        <circle cx="110" cy="100" r="6" fill="currentColor" />
        <text x="158" y="64"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">manager</text>
        <text x="204" y="92"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">exile</text>
        <text x="146" y="180" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">firefighter</text>
        <text x="20"  y="120" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">critic</text>
      </svg>
    ),
  },

  {
    id: "cymatics",
    width: 220, height: 200,
    band: [1640, 1730],
    side: "any",
    rotate: -4,
    render: () => (
      <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">cymatics — sand listening</text>
        {Array.from({ length: 6 }).map((_, i) => {
          const r = 18 + i * 12
          return <circle key={i} cx="110" cy="115" r={r} opacity={0.85 - i * 0.08} />
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <path key={i} d={`M${110 + Math.cos(a) * 14} ${115 + Math.sin(a) * 14} L${110 + Math.cos(a) * 86} ${115 + Math.sin(a) * 86}`} opacity="0.7" />
          )
        })}
        <text x="6" y="192" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">frequency = form</text>
      </svg>
    ),
  },

  {
    id: "penrose",
    width: 240, height: 200,
    band: [1740, 1820],
    side: "any",
    rotate: 5,
    render: () => (
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">penrose stair — lucid dream</text>
        <path d="M70 160 L170 160 L150 130 L60 130 Z" />
        <path d="M150 130 L150 80  L70 80   L70 160" />
        <path d="M150 80  L170 60  L170 140 L150 130" />
        <path d="M70 80   L60 60   L160 60  L170 60" />
        <path d="M60 60   L60 130" />
        <path d="M160 60  L150 80" />
        <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">always climbing.</text>
      </svg>
    ),
  },

  // === NEW — pulled from the conceptual blueprint ===

  // Pulse motor — rotor + magnets + sparks (Bedini / mad-scientist
  // basement). One of the things on Eliáš's actual workbench.
  {
    id: "pulse-motor",
    width: 260, height: 220,
    band: [70, 150],
    side: "right",
    rotate: -3,
    render: () => (
      <svg width="260" height="220" viewBox="0 0 260 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">pulse motor — bedini</text>
        {/* rotor */}
        <circle cx="130" cy="115" r="50" />
        <circle cx="130" cy="115" r="6" fill="currentColor" />
        {/* magnets around rotor */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          const x = 130 + Math.cos(a) * 50
          const y = 115 + Math.sin(a) * 50
          return (
            <rect key={i}
              x={x - 6} y={y - 9}
              width="12" height="18"
              transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
            />
          )
        })}
        {/* coil */}
        <path d="M30 115 q 0 -20 20 -20 q 20 0 20 20 q 0 20 -20 20 q -20 0 -20 -20 z" />
        <path d="M30 115 L10 115" />
        <path d="M70 115 L80 115" />
        {/* sparks */}
        <path d="M10 110 L0  100 M10 115 L-4 118 M10 120 L0 130" />
        <text x="180" y="200" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">excess energy?</text>
      </svg>
    ),
  },

  // Node-graph (Unreal blueprint / ComfyUI vibe)
  {
    id: "node-graph",
    width: 320, height: 200,
    band: [200, 290],
    side: "left",
    rotate: 4,
    render: () => (
      <svg width="320" height="200" viewBox="0 0 320 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">node-graph — thought as wiring</text>
        {/* three nodes */}
        <rect x="20"  y="50"  width="70" height="40" />
        <rect x="20"  y="120" width="70" height="40" />
        <rect x="140" y="80"  width="80" height="50" />
        <rect x="250" y="40"  width="60" height="40" />
        <rect x="250" y="130" width="60" height="40" />
        {/* pin dots */}
        {[[90,70],[90,140],[140,95],[140,115],[220,95],[220,115],[250,60],[250,150]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" />
        ))}
        {/* bezier wires */}
        <path d="M90 70  C 115 70, 115 95, 140 95" />
        <path d="M90 140 C 115 140, 115 115, 140 115" />
        <path d="M220 95  C 240 95,  240 60,  250 60" />
        <path d="M220 115 C 240 115, 240 150, 250 150" />
        {/* labels */}
        <text x="30"  y="74"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">input.a</text>
        <text x="30"  y="144" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">input.b</text>
        <text x="148" y="108" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">transform()</text>
        <text x="258" y="64"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">out.0</text>
        <text x="258" y="154" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">out.1</text>
      </svg>
    ),
  },

  // Substrate — neuron ↔ logic gate
  {
    id: "substrate",
    width: 300, height: 180,
    band: [380, 470],
    side: "left",
    rotate: -5,
    render: () => (
      <svg width="300" height="180" viewBox="0 0 300 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">substrate independent — carbon ⇌ silicon</text>
        {/* neuron */}
        <circle cx="70" cy="100" r="22" />
        <circle cx="70" cy="100" r="6" fill="currentColor" />
        {/* dendrites */}
        <path d="M50 88  q -16 -2 -22 -14" />
        <path d="M48 100 q -22 6 -34 -2" />
        <path d="M50 112 q -16 14 -28 16" />
        <path d="M90 88  q 18 -10 26 -22" />
        <path d="M92 100 L116 100" />
        <path d="M90 112 q 14 18 24 22" />
        {/* axon to gate */}
        <path d="M92 100 L160 100" strokeDasharray="3 3" />
        <path d="M150 95 L160 100 L150 105" />
        {/* NAND gate */}
        <path d="M180 80 L220 80 Q 252 80, 252 100 Q 252 120, 220 120 L180 120 Z" />
        <path d="M252 100 L266 100" />
        <circle cx="258" cy="100" r="4" />
        <path d="M180 88  L168 88" />
        <path d="M180 112 L168 112" />
        <text x="200" y="106" fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">nand</text>
      </svg>
    ),
  },

  // Tape reel — analog noir
  {
    id: "tape-reel",
    width: 260, height: 180,
    band: [560, 640],
    side: "right",
    rotate: 5,
    render: () => (
      <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">tape reel — analog noir</text>
        {/* two reels */}
        {[60, 200].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="100" r="40" />
            <circle cx={cx} cy="100" r="12" />
            {/* spokes */}
            {Array.from({ length: 4 }).map((_, k) => {
              const a = (k / 4) * Math.PI
              const dx = Math.cos(a) * 28
              const dy = Math.sin(a) * 28
              return <path key={k} d={`M${cx - dx} ${100 - dy} L${cx + dx} ${100 + dy}`} />
            })}
          </g>
        ))}
        {/* tape running */}
        <path d="M80 70  q 50 -22 100 0" />
        <path d="M80 130 q 50 22 100 0" />
        {/* heads */}
        <rect x="120" y="60"  width="20" height="10" />
        <rect x="120" y="130" width="20" height="10" />
        <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">memory on a strip</text>
      </svg>
    ),
  },

  // The Watcher — brutalist radar tower scanning a forest of papers
  {
    id: "watcher",
    width: 240, height: 230,
    band: [750, 850],
    side: "left",
    rotate: -4,
    render: () => (
      <svg width="240" height="230" viewBox="0 0 240 230" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">the watcher — knowledge distilled</text>
        {/* tower */}
        <path d="M100 70 L140 70 L150 200 L90 200 Z" />
        <path d="M110 70 L110 200" opacity="0.5" />
        <path d="M130 70 L130 200" opacity="0.5" />
        {/* dish */}
        <path d="M80 60 q 40 -50 80 0" />
        <path d="M120 60 L120 30" />
        <circle cx="120" cy="26" r="3" fill="currentColor" />
        {/* scattered papers below */}
        {[
          [30, 195, 16, 12, 8],   [60, 205, 14, 10, -6],
          [180, 198, 16, 12, -4], [205, 210, 14, 10, 10],
          [40, 215, 16, 12, 2],   [200, 220, 14, 10, -16],
        ].map(([x, y, w, h, r], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`} opacity="0.6" />
        ))}
        {/* sweep cone (faint) */}
        <path d="M120 30 L70 80 M120 30 L170 80" opacity="0.45" strokeDasharray="3 3" />
      </svg>
    ),
  },

  // Sisyphus iterating — pushing an upgrading boulder
  {
    id: "sisyphus",
    width: 280, height: 200,
    band: [930, 1020],
    side: "right",
    rotate: 3,
    render: () => (
      <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">sisyphus — iterate the boulder</text>
        {/* incline */}
        <path d="M10 180 L270 60" />
        {/* boulder = combustion engine */}
        <g transform="translate(150 130) rotate(-24)">
          <rect x="-22" y="-22" width="44" height="44" />
          <circle cx="-10" cy="-6" r="5" />
          <circle cx="10"  cy="-6" r="5" />
          <path d="M-22 12 L22 12" />
          <path d="M-12 -22 L-12 -32" /> {/* spark plug */}
          <path d="M12 -22 L12 -32" />
        </g>
        {/* figure */}
        <g transform="translate(110 150)">
          <circle cx="0" cy="-30" r="8" />
          <path d="M0 -22 L0 0" />
          <path d="M0 -10 L18 -22" />
          <path d="M0 -10 L-12 -2" />
          <path d="M0 0 L10 18" />
          <path d="M0 0 L-10 18" />
        </g>
        {/* arrow up incline */}
        <path d="M40 170 L60 158" strokeDasharray="2 3" opacity="0.6" />
        <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">each cycle = +1 upgrade</text>
      </svg>
    ),
  },

  // Hill bomb — calculated risk in skate aesthetics
  {
    id: "hill-bomb",
    width: 260, height: 200,
    band: [1100, 1190],
    side: "left",
    rotate: -3,
    render: () => (
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">hill bomb — total commitment</text>
        {/* descending street, vanishing point */}
        <path d="M10 50 L130 180" />
        <path d="M250 50 L130 180" />
        <path d="M30 64 L130 180" opacity="0.5" />
        <path d="M230 64 L130 180" opacity="0.5" />
        {/* dashed centre line */}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M${130 - i*4} ${180 - i*22} L${130 + i*4} ${180 - i*22}`} opacity={0.7 - i*0.1} />
        ))}
        {/* skater dot + velocity vector */}
        <circle cx="130" cy="170" r="4" fill="currentColor" />
        <path d="M130 170 L130 196" strokeWidth="2" />
        <path d="M125 192 L130 196 L135 192" strokeWidth="2" />
        <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">g · sinθ — gravity does the rest</text>
      </svg>
    ),
  },

  // Software-engineer void / black hole
  {
    id: "void",
    width: 260, height: 200,
    band: [1280, 1370],
    side: "right",
    rotate: -6,
    render: () => (
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">software engineer void</text>
        {/* black hole */}
        <circle cx="180" cy="120" r="44" fill="currentColor" stroke="none" opacity="0.92" />
        <circle cx="180" cy="120" r="56" strokeDasharray="2 4" opacity="0.6" />
        <circle cx="180" cy="120" r="70" strokeDasharray="2 6" opacity="0.4" />
        {/* laptop being sucked in */}
        <g transform="translate(60 130) rotate(-12)">
          <rect x="0" y="0" width="50" height="32" />
          <path d="M0 32 L50 32 L60 42 L-10 42 Z" />
          <path d="M6 6 L44 6 M6 14 L44 14 M6 22 L44 22" opacity="0.6" />
        </g>
        {/* trail */}
        <path d="M110 130 Q 140 120, 168 120" strokeDasharray="3 4" opacity="0.7" />
        <text x="6" y="190" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">aesthetic ≠ capability</text>
      </svg>
    ),
  },

  // Wag the dog — manufactured consensus
  {
    id: "wag-the-dog",
    width: 280, height: 200,
    band: [1460, 1560],
    side: "left",
    rotate: 4,
    render: () => (
      <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">wag the dog — manufactured</text>
        {/* camera */}
        <rect x="20" y="80" width="80" height="50" />
        <rect x="100" y="92" width="20" height="26" />
        <circle cx="110" cy="105" r="6" />
        <rect x="35" y="70" width="20" height="14" />
        {/* cardboard cutout */}
        <path d="M150 60 L210 60 L210 150 L150 150 Z" strokeDasharray="3 3" />
        <circle cx="180" cy="86" r="10" />
        <path d="M170 100 L190 100 L190 130 L170 130 Z" />
        {/* cable */}
        <path d="M120 105 Q 140 105, 152 105" />
        {/* observer with phone */}
        <g transform="translate(240 100)">
          <circle cx="0" cy="-20" r="8" />
          <path d="M0 -12 L0 16" />
          <path d="M0 -4 L12 -10" />
          <path d="M0 -4 L-12 -10" />
          <rect x="8" y="-16" width="6" height="10" />
        </g>
        <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">consent → wiring → screen</text>
      </svg>
    ),
  },

  // Cellular automata — Langton's ant
  {
    id: "langton",
    width: 220, height: 220,
    band: [1640, 1730],
    side: "right",
    rotate: -4,
    render: () => (
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">langton — order from rule</text>
        {/* grid */}
        {Array.from({ length: 11 }).map((_, i) => (
          <path key={`h${i}`} d={`M20 ${36 + i*16} L196 ${36 + i*16}`} opacity="0.25" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={`v${i}`} d={`M${20 + i*16} 36 L${20 + i*16} 196`} opacity="0.25" />
        ))}
        {/* filled cells = the trail */}
        {[
          [3,5],[4,5],[4,4],[4,3],[5,3],[5,4],[5,5],[5,6],[5,7],[4,7],[3,7],
          [3,6],[6,5],[6,4],[7,4],[7,5],[7,6],[7,7],[7,8],[6,8],
          [8,5],[8,6],[9,6],[9,7],[10,7],
        ].map(([x,y], i) => (
          <rect key={i} x={20 + x*16} y={36 + y*16} width="16" height="16" fill="currentColor" opacity="0.85" />
        ))}
        {/* ant */}
        <path d="M148 100 L156 100 M152 96 L152 104 M152 100 L160 92" strokeWidth="2" />
      </svg>
    ),
  },

  // Dieter Rams — the Braun phonograph anchor
  {
    id: "rams",
    width: 260, height: 180,
    band: [1810, 1900],
    side: "left",
    rotate: 3,
    render: () => (
      <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dieter rams — less, better</text>
        {/* box */}
        <rect x="30" y="50" width="200" height="100" />
        {/* turntable platter */}
        <circle cx="100" cy="100" r="36" />
        <circle cx="100" cy="100" r="4"  fill="currentColor" />
        {/* tonearm */}
        <path d="M150 60 L122 90" />
        <circle cx="150" cy="60" r="5" />
        {/* speaker grille */}
        {Array.from({ length: 4 }).map((_, i) => (
          <circle key={i} cx={185 + i*9} cy="120" r="2.5" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <circle key={`b${i}`} cx={185 + i*9} cy="135" r="2.5" />
        ))}
        {/* knobs */}
        <circle cx="190" cy="78" r="6" />
        <circle cx="210" cy="78" r="6" />
        <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">silence as a feature</text>
      </svg>
    ),
  },
]

// ---- Layout: side-margin only, randomised top within each band ---

type Placed = Doodle & { side: "left" | "right"; topVh: number }

function place(doodles: Doodle[]): Placed[] {
  // Deterministic shuffle per-mount: simple LCG seeded by Date.now()
  // so each load varies but no two doodles stack identically.
  let seed = Math.floor(Math.random() * 1e9)
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  let lastSide: "left" | "right" = rand() < 0.5 ? "left" : "right"
  return doodles.map((d) => {
    const side: "left" | "right" =
      d.side && d.side !== "any"
        ? d.side
        : // alternate sides most of the time, otherwise force flip
          (rand() < 0.6 ? (lastSide === "left" ? "right" : "left") : lastSide)
    lastSide = side
    const [lo, hi] = d.band
    const topVh = lo + rand() * (hi - lo)
    return { ...d, side, topVh }
  })
}

function DoodleLayer({ items }: { items: Placed[] }) {
  return (
    <>
      {items.map((d) => (
        <div
          key={d.id}
          aria-hidden
          style={{
            position: "absolute",
            top: `${d.topVh}vh`,
            // Push the doodle's inner edge to just outside the
            // centered content column (HALF + GUTTER = ~688px from
            // the viewport centre). On narrower screens the layer's
            // container hides itself entirely (see PaperDecorations
            // below), so we don't have to clamp the offsets here.
            [d.side]: `calc(50% + ${CONTENT_HALF + GUTTER}px)`,
            transform: `rotate(${d.rotate}deg)`,
            transformOrigin: "50% 50%",
            opacity: d.opacity ?? 0.55,
            pointerEvents: "none",
            zIndex: 26,
            color: "var(--ink)",
            fontFamily: "var(--font-display)",
            filter: "url(#ink-wobble)",
          }}
        >
          {d.render()}
        </div>
      ))}
    </>
  )
}

// ---- Margin stars (sparse, deterministic) ------------------------

function MarginStar({ top, side, offset, rotate = 0, size = 18, opacity = 0.5 }: {
  top: string
  side: "left" | "right"
  offset: string
  rotate?: number
  size?: number
  opacity?: number
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top,
        [side]: offset,
        opacity,
        pointerEvents: "none",
        zIndex: 26,
        color: "var(--ink)",
        transform: `rotate(${rotate}deg)`,
        filter: "url(#ink-wobble)",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 L13.6 9.2 L21 10 L15.4 14.6 L17.2 22 L12 18 L6.8 22 L8.6 14.6 L3 10 L10.4 9.2 Z" />
      </svg>
    </div>
  )
}

// ---- Root --------------------------------------------------------

export function PaperDecorations() {
  // Layout the doodles once per mount. SSR renders nothing — we wait
  // for the client so the random placement matches what's drawn.
  const [items, setItems] = useState<Placed[] | null>(null)
  useEffect(() => {
    setItems(place(DOODLES))
  }, [])
  const stars = useMemo(
    () => [
      { top: "20vh",   side: "right" as const, offset: "6vw",  rotate: 12,  size: 16 },
      { top: "105vh",  side: "left"  as const, offset: "6vw",  rotate: -22, size: 13 },
      { top: "210vh",  side: "right" as const, offset: "10vw", rotate: 6,   size: 15 },
      { top: "380vh",  side: "left"  as const, offset: "10vw", rotate: 32,  size: 12 },
      { top: "490vh",  side: "right" as const, offset: "6vw",  rotate: -9,  size: 14 },
      { top: "720vh",  side: "left"  as const, offset: "4vw",  rotate: 18,  size: 14 },
      { top: "930vh",  side: "right" as const, offset: "4vw",  rotate: -14, size: 13 },
      { top: "1140vh", side: "left"  as const, offset: "2vw",  rotate: 26,  size: 15 },
      { top: "1370vh", side: "right" as const, offset: "6vw",  rotate: -2,  size: 12 },
      { top: "1620vh", side: "left"  as const, offset: "2vw",  rotate: 11,  size: 14 },
    ],
    [],
  )

  return (
    <>
      {/* doodles only show when there's actually side-margin room
          for them — under ~1400px viewport the centred content
          fills the screen and stamping doodles over text would
          look bad. */}
      <style>{`
        .doodle-layer { display: block; }
        @media (max-width: 1400px) {
          .doodle-layer { display: none; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 25,
          overflow: "hidden",
        }}
      >
        <CoffeeStains />
        <div className="doodle-layer">
          {items && <DoodleLayer items={items} />}
          {stars.map((s, i) => (
            <MarginStar key={i} {...s} opacity={0.45} />
          ))}
        </div>
      </div>
    </>
  )
}
