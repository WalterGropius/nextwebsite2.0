"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"

// PaperDecorations — the full catalog of hand-sketched marginalia.
// Every doodle is line-drawn SVG that picks up `var(--ink)` and the
// `ink-wobble` filter, so the whole layer reads like one notebook
// owner's hand. Doodles live in the side margins outside the centred
// content column so they never collide with text. Their `top` is
// randomised within a band on mount so reloads vary slightly.

// half-width of the centred content column (--content-max-width:
// 1320px → 660px) + a small gutter. Doodles sit *just* past this.
const CONTENT_HALF = 660
const GUTTER = 28

// ---- Coffee stains (deterministic) ------------------------------

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
  { src: "/coffee4.png", top: "880vh",  side: "right", offset: "0vw",   size: 280, rotate: -22, opacity: 0.18 },
  { src: "/coffee3.png", top: "1080vh", side: "left",  offset: "4vw",   size: 320, rotate: 35,  opacity: 0.16 },
  { src: "/coffee1.png", top: "1280vh", side: "right", offset: "-3vw",  size: 340, rotate: -19, opacity: 0.18 },
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

// ---- Doodle catalog ---------------------------------------------

type Doodle = {
  id: string
  baseVh: number
  side: "left" | "right"
  rotate: number
  opacity?: number
  render: () => ReactNode
}

// Bigger SVGs render with `fontFamily="var(--font-display)"` so the
// inked text matches Zenhand. fontSize values are ~14–32 for clarity
// at the standard 0.55 layer opacity.

const DOODLES: Doodle[] = [
  // === MATH / PHYSICS / CS — margin-notebook tier =================

  // ψ — moved UP, near the hero (user request).
  { id: "psi", baseVh: 40, side: "left", rotate: -4, render: () => (
    <svg width="280" height="160" viewBox="0 0 280 160" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="28" fontFamily="var(--font-display)" fontSize="18" fill="currentColor" stroke="none">ψ(x, t) — schrödinger</text>
      <path d="M14 90 L268 90" />
      <path d="M30 28 L30 142" />
      <path d="M30 90 Q 55 18, 80 90 T 130 90 T 180 90 T 230 90 T 268 90" strokeWidth="1.5" />
      <path d="M30 42 Q 140 70, 268 86" strokeDasharray="3 3" opacity="0.6" />
      <text x="220" y="130" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">x →</text>
      <text x="6"   y="46" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.55">|ψ|² → prob.</text>
    </svg>
  ) },

  // Big O — moved RIGHT and UP (user request).
  { id: "bigo", baseVh: 80, side: "right", rotate: 5, render: () => (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="16" fill="currentColor" stroke="none">big o — knowing the cost</text>
      <path d="M28 150 L250 150" /><path d="M28 26 L28 150" /><path d="M28 150 L240 30" />
      <text x="220" y="24" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">n</text>
      <path d="M28 150 Q 80 100, 240 88" />
      <text x="212" y="82" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">log n</text>
      <path d="M28 150 Q 110 150, 170 30" />
      <text x="174" y="34" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">n²</text>
      <path d="M28 150 Q 60 150, 90 30" />
      <text x="92" y="34" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">2ⁿ</text>
    </svg>
  ) },

  { id: "pulse-motor", baseVh: 130, side: "right", rotate: -3, render: () => (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">pulse motor — bedini</text>
      <circle cx="130" cy="115" r="50" /><circle cx="130" cy="115" r="6" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const x = 130 + Math.cos(a) * 50, y = 115 + Math.sin(a) * 50
        return <rect key={i} x={x - 6} y={y - 9} width="12" height="18" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />
      })}
      <path d="M30 115 q 0 -20 20 -20 q 20 0 20 20 q 0 20 -20 20 q -20 0 -20 -20 z" />
      <path d="M30 115 L10 115" /><path d="M70 115 L80 115" />
      <path d="M10 110 L0 100 M10 115 L-4 118 M10 120 L0 130" />
      <text x="180" y="200" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">excess energy?</text>
    </svg>
  ) },

  { id: "euler", baseVh: 170, side: "left", rotate: -5, render: () => (
    <svg width="260" height="120" viewBox="0 0 260 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="48" fontFamily="var(--font-display)" fontSize="32" fill="currentColor" stroke="none">e<tspan baselineShift="super" fontSize="20">iπ</tspan> + 1 = 0</text>
      <text x="6" y="80" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none" opacity="0.65">* the most beautiful equation.</text>
      <text x="6" y="98" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.55">five constants. one breath.</text>
      <path d="M5 110 Q 130 118, 255 110" strokeWidth="1.1" opacity="0.7" />
    </svg>
  ) },

  { id: "node-graph", baseVh: 220, side: "right", rotate: 4, render: () => (
    <svg width="320" height="200" viewBox="0 0 320 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">node-graph — thought as wiring</text>
      <rect x="20"  y="50"  width="70" height="40" /><rect x="20"  y="120" width="70" height="40" />
      <rect x="140" y="80"  width="80" height="50" /><rect x="250" y="40"  width="60" height="40" />
      <rect x="250" y="130" width="60" height="40" />
      {[[90,70],[90,140],[140,95],[140,115],[220,95],[220,115],[250,60],[250,150]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" />
      ))}
      <path d="M90 70  C 115 70, 115 95, 140 95" />
      <path d="M90 140 C 115 140, 115 115, 140 115" />
      <path d="M220 95  C 240 95, 240 60,  250 60" />
      <path d="M220 115 C 240 115, 240 150, 250 150" />
      <text x="30"  y="74"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">input.a</text>
      <text x="30"  y="144" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">input.b</text>
      <text x="148" y="108" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">transform()</text>
      <text x="258" y="64"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">out.0</text>
      <text x="258" y="154" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">out.1</text>
    </svg>
  ) },

  { id: "maxwell", baseVh: 270, side: "left", rotate: -7, render: () => (
    <svg width="300" height="120" viewBox="0 0 300 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="48" fontFamily="var(--font-display)" fontSize="30" fill="currentColor" stroke="none">∇ × E = − ∂B/∂t</text>
      <text x="6" y="80" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none" opacity="0.7">faraday — fields like to whirl.</text>
      <path d="M0 100 Q150 108, 300 96" strokeWidth="0.9" opacity="0.7" />
    </svg>
  ) },

  { id: "substrate", baseVh: 320, side: "right", rotate: -5, render: () => (
    <svg width="300" height="180" viewBox="0 0 300 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">substrate independent — carbon ⇌ silicon</text>
      <circle cx="70" cy="100" r="22" /><circle cx="70" cy="100" r="6" fill="currentColor" />
      <path d="M50 88  q -16 -2 -22 -14" /><path d="M48 100 q -22 6 -34 -2" />
      <path d="M50 112 q -16 14 -28 16" /><path d="M90 88  q 18 -10 26 -22" />
      <path d="M92 100 L116 100" /><path d="M90 112 q 14 18 24 22" />
      <path d="M92 100 L160 100" strokeDasharray="3 3" />
      <path d="M150 95 L160 100 L150 105" />
      <path d="M180 80 L220 80 Q 252 80, 252 100 Q 252 120, 220 120 L180 120 Z" />
      <path d="M252 100 L266 100" /><circle cx="258" cy="100" r="4" />
      <path d="M180 88 L168 88" /><path d="M180 112 L168 112" />
      <text x="200" y="106" fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">nand</text>
    </svg>
  ) },

  { id: "phi", baseVh: 370, side: "left", rotate: 5, render: () => (
    <svg width="240" height="180" viewBox="0 0 240 180" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="26" fontFamily="var(--font-display)" fontSize="18" fill="currentColor" stroke="none">φ ≈ 1.61803398…</text>
      <text x="6" y="46" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">a / b = (a + b) / a</text>
      <path d="M180 160 Q 180 90, 110 90 Q 60 90, 60 140 Q 60 170, 100 170 Q 124 170, 124 156" />
      <rect x="60"  y="90"  width="120" height="80" />
      <rect x="60"  y="90"  width="50"  height="80" />
      <rect x="110" y="120" width="40"  height="50" />
      <rect x="150" y="142" width="20"  height="28" />
    </svg>
  ) },

  { id: "tape-reel", baseVh: 420, side: "right", rotate: 5, render: () => (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">tape reel — analog noir</text>
      {[60, 200].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="100" r="40" /><circle cx={cx} cy="100" r="12" />
          {Array.from({ length: 4 }).map((_, k) => {
            const a = (k / 4) * Math.PI
            const dx = Math.cos(a) * 28, dy = Math.sin(a) * 28
            return <path key={k} d={`M${cx - dx} ${100 - dy} L${cx + dx} ${100 + dy}`} />
          })}
        </g>
      ))}
      <path d="M80 70  q 50 -22 100 0" /><path d="M80 130 q 50 22 100 0" />
      <rect x="120" y="60"  width="20" height="10" /><rect x="120" y="130" width="20" height="10" />
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">memory on a strip</text>
    </svg>
  ) },

  { id: "dfs", baseVh: 470, side: "left", rotate: -3, render: () => (
    <svg width="250" height="170" viewBox="0 0 250 170" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dfs(g, v) — depth before breadth</text>
      <path d="M40 90 L100 50" /><path d="M40 90 L100 130" />
      <path d="M100 50 L180 80" /><path d="M100 130 L180 140" />
      <path d="M180 80 L180 140" /><path d="M180 80 L230 50" />
      {[[40,90],[100,50],[100,130],[180,80],[180,140],[230,50]].map(([x,y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="11" fill="var(--surface-dark, #f6f6f4)" />
      ))}
      {["a","b","c","d","e","f"].map((c, i) => (
        <text key={c} x={[40,100,100,180,180,230][i] - 4} y={[90,50,130,80,140,50][i] + 4} fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">{c}</text>
      ))}
    </svg>
  ) },

  { id: "sdf", baseVh: 520, side: "right", rotate: 5, render: () => (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">sdf — smooth min(a, b)</text>
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={`h${i}`} d={`M30 ${50 + i * 22} L210 ${50 + i * 22}`} opacity="0.18" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={`v${i}`} d={`M${30 + i * 25} 50 L${30 + i * 25} 182`} opacity="0.18" />
      ))}
      <path d="M60 130 q -10 -40 30 -40 q 25 -30 60 -10 q 35 -10 40 30 q 10 30 -30 40 q -50 18 -75 0 q -35 0 -25 -20 z" strokeWidth="1.6" />
      <circle cx="78" cy="118" r="20" opacity="0.35" />
      <rect x="118" y="92" width="44" height="44" opacity="0.35" />
      <ellipse cx="180" cy="135" rx="22" ry="10" opacity="0.35" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">distance fields melt like mercury</text>
    </svg>
  ) },

  { id: "splat-skull", baseVh: 570, side: "left", rotate: -6, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">gaussian splat — 3d from photons</text>
      <path d="M30 50 L210 40 L235 130 L55 145 Z" strokeDasharray="3 3" opacity="0.5" />
      <path d="M115 60 q -55 4 -55 60 q 0 24 14 36 l 8 12 l 14 -2 l 0 16 l 14 0 l 0 -16 l 14 2 l 8 -12 q 14 -12 14 -36 q 0 -56 -55 -60 z" />
      <ellipse cx="100" cy="108" rx="9" ry="11" /><ellipse cx="138" cy="106" rx="9" ry="11" />
      <path d="M120 118 l -3 18 l 6 0 z" />
      {[
        [88,84,8,3,20], [104,72,6,2,40], [128,68,9,3,-12], [148,86,7,2,30],
        [170,110,10,3,-25], [86,138,8,2,15], [120,150,11,3,5], [156,148,8,2,-20],
        [60,100,5,2,55], [200,90,6,2,-40], [192,130,9,3,12], [70,124,6,2,-10],
      ].map(([cx, cy, rx, ry, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${r} ${cx} ${cy})`} opacity="0.55" />
      ))}
    </svg>
  ) },

  { id: "hourglass", baseVh: 620, side: "right", rotate: -4, render: () => (
    <svg width="220" height="240" viewBox="0 0 220 240" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">the polymath&rsquo;s time debt</text>
      <path d="M40 40 L180 40 L180 60 Q 180 100, 110 120 Q 40 100, 40 60 Z" />
      <path d="M70 50 L82 70" /><path d="M82 70 L94 64" />
      <path d="M120 48 L132 64 L120 70" opacity="0.7" />
      {[[50,46,3],[150,42,2],[170,48,2],[60,38,2],[100,34,2],[140,36,3],[30,52,2]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} />
      ))}
      <path d="M40 240 L180 240 L180 220 Q 180 180, 110 160 Q 40 180, 40 220 Z" />
      <circle cx="110" cy="230" r="3" /><circle cx="118" cy="232" r="2" />
      <text x="6" y="200" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">ideas: 99.9%</text>
      <text x="6" y="214" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">execution: ε</text>
    </svg>
  ) },

  { id: "watcher", baseVh: 670, side: "left", rotate: -4, render: () => (
    <svg width="240" height="230" viewBox="0 0 240 230" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">the watcher — knowledge distilled</text>
      <path d="M100 70 L140 70 L150 200 L90 200 Z" />
      <path d="M110 70 L110 200" opacity="0.5" /><path d="M130 70 L130 200" opacity="0.5" />
      <path d="M80 60 q 40 -50 80 0" /><path d="M120 60 L120 30" />
      <circle cx="120" cy="26" r="3" fill="currentColor" />
      {[[30,195,16,12,8],[60,205,14,10,-6],[180,198,16,12,-4],[205,210,14,10,10],[40,215,16,12,2],[200,220,14,10,-16]].map(([x,y,w,h,r], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`} opacity="0.6" />
      ))}
      <path d="M120 30 L70 80 M120 30 L170 80" opacity="0.45" strokeDasharray="3 3" />
    </svg>
  ) },

  { id: "blackbox", baseVh: 720, side: "right", rotate: 4, render: () => (
    <svg width="200" height="240" viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">the black box</text>
      <path d="M70 40 L130 40 L138 220 L62 220 Z" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M70 40 L130 40 L138 220 L62 220 Z" />
      <path d="M80 60 q 10 30 -4 80 q -10 50 12 70" stroke="rgba(255,255,255,0.9)" />
      <path d="M120 70 q -8 40 4 70 q 12 40 -6 65"  stroke="rgba(255,255,255,0.9)" opacity="0.8" />
      <path d="M95 100 q -6 24 6 36 q 8 12 -2 24"   stroke="rgba(255,255,255,0.6)" />
      <text x="6" y="234" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.65">interpretability ↗</text>
    </svg>
  ) },

  { id: "sisyphus", baseVh: 770, side: "left", rotate: 3, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">sisyphus — iterate the boulder</text>
      <path d="M10 180 L270 60" />
      <g transform="translate(150 130) rotate(-24)">
        <rect x="-22" y="-22" width="44" height="44" />
        <circle cx="-10" cy="-6" r="5" /><circle cx="10" cy="-6" r="5" />
        <path d="M-22 12 L22 12" /><path d="M-12 -22 L-12 -32" /><path d="M12 -22 L12 -32" />
      </g>
      <g transform="translate(110 150)">
        <circle cx="0" cy="-30" r="8" /><path d="M0 -22 L0 0" />
        <path d="M0 -10 L18 -22" /><path d="M0 -10 L-12 -2" />
        <path d="M0 0 L10 18" /><path d="M0 0 L-10 18" />
      </g>
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">each cycle = +1 upgrade</text>
    </svg>
  ) },

  { id: "osint", baseVh: 820, side: "right", rotate: -3, render: () => (
    <svg width="300" height="220" viewBox="0 0 300 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">revizor — string on a corkboard</text>
      {[[30,50,60,36],[150,40,70,30],[240,70,50,40],[60,130,70,40],[170,140,60,36],[255,150,40,32]].map(([x,y,w,h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} />
          <path d={`M${x + 5} ${y + 10} L${x + w - 10} ${y + 10}`} opacity="0.6" />
          <path d={`M${x + 5} ${y + 22} L${x + w - 18} ${y + 22}`} opacity="0.6" />
        </g>
      ))}
      <path d="M60 86  L185 70"   opacity="0.7" /><path d="M185 70 L265 90"   opacity="0.7" />
      <path d="M60 86  L95 150"   opacity="0.7" /><path d="M95 150 L200 158"  opacity="0.7" />
      <path d="M200 158 L275 166" opacity="0.7" /><path d="M185 70 L200 158" strokeDasharray="2 3" opacity="0.6" />
      <path d="M155 45 L215 65" strokeWidth="2" /><path d="M215 45 L155 65" strokeWidth="2" />
    </svg>
  ) },

  { id: "dmn", baseVh: 870, side: "left", rotate: 6, render: () => (
    <svg width="280" height="220" viewBox="0 0 280 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dmn → mycorrhizae</text>
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={`gh${i}`} d={`M20 ${50 + i * 22} L130 ${50 + i * 22}`} opacity="0.6" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={`gv${i}`} d={`M${20 + i * 22} 50 L${20 + i * 22} 160`} opacity="0.6" />
      ))}
      <path d="M150 105 q 30 -10 50 -40" /><path d="M150 105 q 20 5 40 -2" />
      <path d="M150 105 q 30 20 60 30" /><path d="M150 105 q -10 30 15 60" />
      <path d="M200 65 q 10 -8 20 -10" /><path d="M200 65 q 14 -2 22 -14" />
      <path d="M190 103 q 12 -4 24 -2" /><path d="M210 135 q 18 6 26 0" />
      <path d="M165 165 q 14 0 22 -8" /><path d="M165 165 q 18 12 24 6" />
      {[[220,55,2],[220,33,2],[245,40,2],[228,98,2],[245,135,2],[195,170,2],[212,170,2]].map(([x,y,r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
      <path d="M132 105 L148 105" /><path d="M148 105 L142 100" /><path d="M148 105 L142 110" />
      <text x="6" y="200" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">order → emergence</text>
    </svg>
  ) },

  { id: "boids", baseVh: 920, side: "right", rotate: -4, render: () => (
    <svg width="320" height="180" viewBox="0 0 320 180" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">boids — local rules, global shape</text>
      <path d="M40 100 q 60 -60 160 -50 q 70 6 100 20 l -22 14 l -8 -8 l -18 14 l -30 8 q -50 14 -110 4 q -50 -8 -72 -2 z" strokeDasharray="3 3" opacity="0.5" />
      {[[70,90,8],[90,82,-10],[110,76,5],[130,72,-8],[155,70,4],[180,68,-6],[210,72,2],[235,80,-12],[260,88,6],[280,98,-4],[88,108,12],[112,112,-6],[138,112,8],[162,110,-2],[188,108,4],[215,108,-10],[238,112,6],[155,90,3],[185,90,-7],[215,90,5],[120,98,-9],[148,98,4]].map(([cx, cy, r], i) => (
        <path key={i} d={`M${cx} ${cy - 5} L${cx + 4} ${cy + 3} L${cx - 4} ${cy + 3} Z`} transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
    </svg>
  ) },

  { id: "hill-bomb", baseVh: 970, side: "left", rotate: -3, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">hill bomb — total commitment</text>
      <path d="M10 50 L130 180" /><path d="M250 50 L130 180" />
      <path d="M30 64 L130 180" opacity="0.5" /><path d="M230 64 L130 180" opacity="0.5" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M${130 - i*4} ${180 - i*22} L${130 + i*4} ${180 - i*22}`} opacity={0.7 - i*0.1} />
      ))}
      <circle cx="130" cy="170" r="4" fill="currentColor" />
      <path d="M130 170 L130 196" strokeWidth="2" />
      <path d="M125 192 L130 196 L135 192" strokeWidth="2" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">g · sinθ — gravity does the rest</text>
    </svg>
  ) },

  { id: "void", baseVh: 1020, side: "right", rotate: -6, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">software engineer void</text>
      <circle cx="180" cy="120" r="44" fill="currentColor" stroke="none" opacity="0.92" />
      <circle cx="180" cy="120" r="56" strokeDasharray="2 4" opacity="0.6" />
      <circle cx="180" cy="120" r="70" strokeDasharray="2 6" opacity="0.4" />
      <g transform="translate(60 130) rotate(-12)">
        <rect x="0" y="0" width="50" height="32" />
        <path d="M0 32 L50 32 L60 42 L-10 42 Z" />
        <path d="M6 6 L44 6 M6 14 L44 14 M6 22 L44 22" opacity="0.6" />
      </g>
      <path d="M110 130 Q 140 120, 168 120" strokeDasharray="3 4" opacity="0.7" />
      <text x="6" y="190" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">aesthetic ≠ capability</text>
    </svg>
  ) },

  { id: "ouroboros", baseVh: 1070, side: "left", rotate: 3, render: () => (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">hyperstition — narrative engine</text>
      <circle cx="110" cy="115" r="62" />
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2
        const x1 = 110 + Math.cos(a) * 57, y1 = 115 + Math.sin(a) * 57
        const x2 = 110 + Math.cos(a) * 67, y2 = 115 + Math.sin(a) * 67
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />
      })}
      <circle cx="170" cy="100" r="4" fill="currentColor" />
      <path d="M168 116 q -12 6 -22 0" />
      <path d="M82 60 L60 32" /><path d="M60 32 l 8 -6 l 6 8" />
      <text x="44" y="22" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">writes itself</text>
    </svg>
  ) },

  { id: "wag-the-dog", baseVh: 1120, side: "right", rotate: 4, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">wag the dog — manufactured</text>
      <rect x="20" y="80" width="80" height="50" />
      <rect x="100" y="92" width="20" height="26" />
      <circle cx="110" cy="105" r="6" />
      <rect x="35" y="70" width="20" height="14" />
      <path d="M150 60 L210 60 L210 150 L150 150 Z" strokeDasharray="3 3" />
      <circle cx="180" cy="86" r="10" />
      <path d="M170 100 L190 100 L190 130 L170 130 Z" />
      <path d="M120 105 Q 140 105, 152 105" />
      <g transform="translate(240 100)">
        <circle cx="0" cy="-20" r="8" />
        <path d="M0 -12 L0 16" /><path d="M0 -4 L12 -10" /><path d="M0 -4 L-12 -10" />
        <rect x="8" y="-16" width="6" height="10" />
      </g>
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">consent → wiring → screen</text>
    </svg>
  ) },

  { id: "curta", baseVh: 1170, side: "left", rotate: -5, render: () => (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">curta — hardware as artifact</text>
      <ellipse cx="120" cy="120" rx="56" ry="14" />
      <path d="M64 120 L64 80" /><path d="M176 120 L176 80" />
      <ellipse cx="120" cy="80" rx="56" ry="14" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = -Math.PI / 2 + (i / 8) * Math.PI
        const x = 120 + Math.cos(a) * 50, y =  78 + Math.sin(a) *  6
        return <rect key={i} x={x - 6} y={y - 4} width="12" height="8" />
      })}
      <path d="M120 70 L120 40" /><circle cx="120" cy="36" r="6" />
      <path d="M50 120 L20 140"  strokeDasharray="2 3" opacity="0.6" />
      <path d="M190 120 L220 140" strokeDasharray="2 3" opacity="0.6" />
      <text x="6"   y="156" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">step drum</text>
      <text x="186" y="156" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">registers</text>
    </svg>
  ) },

  { id: "langton", baseVh: 1220, side: "right", rotate: -4, render: () => (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">langton — order from rule</text>
      {Array.from({ length: 11 }).map((_, i) => (
        <path key={`h${i}`} d={`M20 ${36 + i*16} L196 ${36 + i*16}`} opacity="0.25" />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={`v${i}`} d={`M${20 + i*16} 36 L${20 + i*16} 196`} opacity="0.25" />
      ))}
      {[[3,5],[4,5],[4,4],[4,3],[5,3],[5,4],[5,5],[5,6],[5,7],[4,7],[3,7],[3,6],[6,5],[6,4],[7,4],[7,5],[7,6],[7,7],[7,8],[6,8],[8,5],[8,6],[9,6],[9,7],[10,7]].map(([x,y], i) => (
        <rect key={i} x={20 + x*16} y={36 + y*16} width="16" height="16" fill="currentColor" opacity="0.85" />
      ))}
      <path d="M148 100 L156 100 M152 96 L152 104 M152 100 L160 92" strokeWidth="2" />
    </svg>
  ) },

  { id: "markov", baseVh: 1270, side: "left", rotate: -3, render: () => (
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
      <path d="M68 80  L120 64" /><path d="M120 64 L116 60" /><path d="M120 64 L118 70" />
      <path d="M68 100 L120 120" /><path d="M120 120 L116 116" /><path d="M120 120 L118 124" />
      <path d="M162 60  L210 84" /><path d="M210 84 L204 84" /><path d="M210 84 L208 78" />
      <path d="M162 120 L210 96" /><path d="M210 96 L204 96" /><path d="M210 96 L208 102" />
      <path d="M252 78 q 24 -10 0 -28 q -24 18 0 28" />
    </svg>
  ) },

  { id: "rams", baseVh: 1320, side: "right", rotate: 3, render: () => (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dieter rams — less, better</text>
      <rect x="30" y="50" width="200" height="100" />
      <circle cx="100" cy="100" r="36" /><circle cx="100" cy="100" r="4"  fill="currentColor" />
      <path d="M150 60 L122 90" /><circle cx="150" cy="60" r="5" />
      {Array.from({ length: 4 }).map((_, i) => <circle key={i} cx={185 + i*9} cy="120" r="2.5" />)}
      {Array.from({ length: 4 }).map((_, i) => <circle key={`b${i}`} cx={185 + i*9} cy="135" r="2.5" />)}
      <circle cx="190" cy="78" r="6" /><circle cx="210" cy="78" r="6" />
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">silence as a feature</text>
    </svg>
  ) },

  { id: "ifs", baseVh: 1370, side: "left", rotate: 4, render: () => (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">internal family — orbits of self</text>
      <path d="M110 100 L150 60 L200 90 L188 138 L142 170 L96 168 L50 142 L40 96 L70 58 Z" />
      <path d="M110 100 L150 60"  /><path d="M110 100 L200 90" />
      <path d="M110 100 L188 138" /><path d="M110 100 L142 170" />
      <path d="M110 100 L96 168"  /><path d="M110 100 L50 142" />
      <path d="M110 100 L40 96"   /><path d="M110 100 L70 58" />
      <circle cx="110" cy="100" r="6" fill="currentColor" />
      <text x="158" y="64"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">manager</text>
      <text x="204" y="92"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">exile</text>
      <text x="146" y="180" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">firefighter</text>
      <text x="20"  y="120" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">critic</text>
    </svg>
  ) },

  { id: "cymatics", baseVh: 1420, side: "right", rotate: -4, render: () => (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">cymatics — sand listening</text>
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={i} cx="110" cy="115" r={18 + i * 12} opacity={0.85 - i * 0.08} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <path key={i} d={`M${110 + Math.cos(a) * 14} ${115 + Math.sin(a) * 14} L${110 + Math.cos(a) * 86} ${115 + Math.sin(a) * 86}`} opacity="0.7" />
        )
      })}
      <text x="6" y="192" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">frequency = form</text>
    </svg>
  ) },

  { id: "penrose", baseVh: 1470, side: "left", rotate: 5, render: () => (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">penrose stair — lucid dream</text>
      <path d="M70 160 L170 160 L150 130 L60 130 Z" />
      <path d="M150 130 L150 80  L70 80   L70 160" />
      <path d="M150 80  L170 60  L170 140 L150 130" />
      <path d="M70 80   L60 60   L160 60  L170 60" />
      <path d="M60 60   L60 130" /><path d="M160 60  L150 80" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">always climbing.</text>
    </svg>
  ) },

  // === NEW — pulled from the full conceptual blueprint ============

  // Monotropism: a single intense beam cutting through static.
  { id: "monotropism", baseVh: 1520, side: "right", rotate: -4, render: () => (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">monotropism — one beam, one room</text>
      {/* static / noise field */}
      {Array.from({ length: 60 }).map((_, i) => {
        const x = 30 + (i * 13) % 220
        const y = 50 + ((i * 41) % 110)
        return <circle key={i} cx={x} cy={y} r="0.9" opacity={0.45 + ((i * 7) % 30) / 100} />
      })}
      {/* beam */}
      <path d="M30 60 L240 100" strokeWidth="2" />
      <path d="M30 80 L240 100" strokeWidth="2" opacity="0.4" />
      <path d="M30 40 L240 100" strokeWidth="2" opacity="0.4" />
      <circle cx="20" cy="60" r="6" />
      {/* lit object on the far end */}
      <rect x="230" y="92" width="18" height="18" />
      <path d="M230 92 L248 110 M248 92 L230 110" opacity="0.45" />
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">attention has only one thread.</text>
    </svg>
  ) },

  // BCI — EEG net + organic vines
  { id: "bci", baseVh: 1570, side: "left", rotate: 3, render: () => (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">bci — wires into the wetware</text>
      {/* skull profile */}
      <path d="M70 150 q -28 -60 30 -90 q 70 -36 110 14 q 28 30 -4 76 q -4 6 -16 6 l -8 22 l -10 -4 l -2 18 l -24 4 l -2 -18 l -68 0 q -10 0 -6 -28 z" />
      {/* EEG net */}
      {Array.from({ length: 5 }).map((_, r) => (
        <path key={r} d={`M${72 + r*4} ${130 - r*6} q ${70 - r*8} -${60 + r*4} ${130 - r*16} 0`} opacity={0.7 - r*0.1} />
      ))}
      {[[100,86],[140,72],[180,80],[120,100],[160,98],[200,108]].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />
      ))}
      {/* vines growing out of the wires */}
      <path d="M210 110 q 18 -8 26 -22" /><path d="M236 88 q 12 -2 14 -16" />
      <path d="M210 110 q 24 4 30 -8" /><path d="M210 110 q 18 14 26 14" />
      {[[244,68,2],[250,76,2],[240,108,2]].map(([x,y,r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      <text x="6" y="210" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">read/write, both ways.</text>
    </svg>
  ) },

  // Factory line — isometric "Unreal logistics" producing light
  { id: "factory-line", baseVh: 1620, side: "right", rotate: 4, render: () => (
    <svg width="300" height="180" viewBox="0 0 300 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">factory line — producing context</text>
      {/* belts (isometric) */}
      <path d="M20 130 L120 80 L220 130 L120 180 Z" />
      <path d="M120 80 L220 30 L290 60 L220 130" opacity="0.6" />
      {/* boxes on belt */}
      {[[60,108,16],[100,90,16],[140,108,16],[180,118,16]].map(([x,y,s], i) => (
        <rect key={i} x={x} y={y - s} width={s} height={s} />
      ))}
      {/* output: glowing star */}
      <g transform="translate(254 70)">
        <path d="M0 -12 L3 -3 L12 -2 L5 4 L7 13 L0 8 L-7 13 L-5 4 L-12 -2 L-3 -3 Z" />
      </g>
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">light, packaged.</text>
    </svg>
  ) },

  // HASEL — shape-memory alloy / tendon
  { id: "hasel", baseVh: 1670, side: "left", rotate: -3, render: () => (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">hasel — soft muscle</text>
      {/* upper arm */}
      <rect x="20" y="60" width="60" height="40" />
      {/* lower arm */}
      <rect x="180" y="50" width="60" height="40" transform="rotate(-22 210 70)" />
      {/* joint */}
      <circle cx="90" cy="80" r="8" />
      {/* tendon as braided wire */}
      <path d="M90 72 q 30 -22 90 -14" /><path d="M90 72 q 30 -16 90 -8" />
      <path d="M90 88 q 30 22 90 14" /><path d="M90 88 q 30 16 90 8" />
      {/* contraction arrows */}
      <path d="M130 110 L155 130" /><path d="M148 124 L155 130 L150 122" />
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">voltage in → motion out.</text>
    </svg>
  ) },

  // Shannon entropy — chaos through funnel
  { id: "shannon", baseVh: 1720, side: "right", rotate: 3, render: () => (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">shannon — H = −Σ p log p</text>
      {/* chaotic left */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = 18 + (i * 11) % 80
        const y = 50 + ((i * 19) % 90)
        return <path key={i} d={`M${x} ${y} l ${(i % 5) - 2} ${(i % 4) - 2}`} opacity={0.6} />
      })}
      {/* funnel */}
      <path d="M100 50 L160 90 L100 130 Z" />
      <path d="M160 90 L200 90" />
      {/* ordered right — dot/dash */}
      {[210,222,228,240,252,260,272].map((x, i) => (
        <rect key={i} x={x} y="86" width={i % 2 === 0 ? 10 : 4} height="8" fill="currentColor" />
      ))}
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">information ≠ noise.</text>
    </svg>
  ) },

  // Firehose of falsehood — Gatling megaphones
  { id: "firehose", baseVh: 1770, side: "left", rotate: -4, render: () => (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">firehose — propaganda at scale</text>
      {/* gatling barrel */}
      <circle cx="80" cy="100" r="30" />
      {[[80,80],[100,90],[100,110],[80,120],[60,110],[60,90]].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" />
      ))}
      {/* megaphones extending from barrel */}
      <path d="M110 100 L200 70 L200 130 Z" />
      <path d="M200 90 L240 78 L240 110 L200 100" />
      {/* symbols flying */}
      {["!","?","#","✕","¡"].map((c, i) => (
        <text key={i} x={245 + i*8} y={60 + (i % 3)*20} fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none" opacity={0.7}>{c}</text>
      ))}
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">volume ≠ truth.</text>
    </svg>
  ) },

  // Noether's pendulums — symmetric oscillators
  { id: "noether", baseVh: 1820, side: "right", rotate: 4, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">noether — symmetry conserves</text>
      <path d="M30 50 L230 50" />
      {[60, 110, 160, 210].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 50 L${x + (i % 2 ? -20 : 20)} 150`} />
          <circle cx={x + (i % 2 ? -20 : 20)} cy="150" r="10" fill="currentColor" />
        </g>
      ))}
      {/* energy aura */}
      <ellipse cx="130" cy="120" rx="120" ry="60" strokeDasharray="3 3" opacity="0.5" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">every law has a partner.</text>
    </svg>
  ) },

  // Cache flush — brain venting steam
  { id: "cache-flush", baseVh: 1870, side: "left", rotate: -3, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">cache flush — vent the bloat</text>
      {/* brain */}
      <path d="M60 120 q 0 -50 60 -50 q 8 -16 30 -16 q 22 0 30 16 q 60 0 60 50 q 0 30 -30 36 l -8 14 l -10 -4 l -2 18 l -30 4 l -2 -18 l -38 -4 q -30 -6 -30 -36 z" />
      <path d="M120 90 q 14 8 30 0 q 16 -8 30 0 q 14 8 0 24" opacity="0.7" />
      <path d="M100 120 q 20 6 40 0 q 20 -6 40 0" opacity="0.7" />
      {/* release valve */}
      <rect x="170" y="60" width="16" height="20" />
      <circle cx="178" cy="56" r="4" />
      {/* steam */}
      <path d="M178 50 q -10 -16 0 -28 q 10 -10 0 -22" />
      <path d="M186 52 q 14 -10 6 -28" opacity="0.7" />
      <path d="M170 54 q -16 -10 -8 -26" opacity="0.7" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">stop accumulating to start producing.</text>
    </svg>
  ) },

  // Dead Man's Switch — red button under glass
  { id: "dead-mans-switch", baseVh: 1920, side: "right", rotate: 3, render: () => (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dead man&rsquo;s switch — pure leverage</text>
      {/* base */}
      <rect x="40" y="120" width="160" height="40" />
      <path d="M40 120 L60 100 L220 100 L200 120 Z" />
      {/* glass dome */}
      <path d="M70 100 Q 120 30, 180 100" strokeDasharray="3 3" opacity="0.7" />
      {/* button */}
      <ellipse cx="120" cy="100" rx="22" ry="8" />
      <path d="M98 100 L98 90 Q 120 78, 142 90 L142 100" />
      {/* wires going to timer */}
      <path d="M200 140 L226 154" />
      <rect x="200" y="148" width="36" height="22" />
      <text x="206" y="164" fontFamily="var(--font-display)" fontSize="9" fill="currentColor" stroke="none">00:01</text>
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">consequence is the contract.</text>
    </svg>
  ) },

  // TAFS — empty late-night desk
  { id: "tafs", baseVh: 1970, side: "left", rotate: 4, render: () => (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">tafs — talk show liminality</text>
      {/* infinite grid floor */}
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M${30 + i*24} 160 L${140 - i*4} 100`} opacity={0.4 - i*0.03} />
      ))}
      <path d="M30 160 L270 160" />
      {/* desk */}
      <rect x="100" y="110" width="80" height="40" />
      <path d="M100 150 L100 168 M180 150 L180 168" />
      {/* microphone, unplugged */}
      <rect x="134" y="86" width="12" height="22" />
      <path d="M140 108 L140 130" />
      <path d="M120 144 L160 144" />
      <text x="6" y="180" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">empty seat. irony intact.</text>
    </svg>
  ) },

  // Chalkboard with frenetic formulas
  { id: "chalkboard", baseVh: 2020, side: "right", rotate: -4, render: () => (
    <svg width="300" height="200" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">attention disorder — wkuk parabola</text>
      <rect x="20" y="38" width="260" height="140" />
      {/* chalk text */}
      <text x="32" y="60" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">P(x) = ∫ a→b f(x) dx</text>
      <text x="32" y="78" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">∂²u/∂t² = c²∇²u</text>
      <text x="32" y="96" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">∀ x ∈ S, ∃ ε &gt; 0 …</text>
      <text x="32" y="114" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">a ⊗ b = b ⊗ a (?)</text>
      <text x="32" y="132" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">cia → friendzone op.</text>
      {/* parabola */}
      <path d="M170 60 Q 220 130, 270 60" strokeWidth="1.6" />
      <path d="M170 60 L168 70" /><path d="M270 60 L272 70" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">mundane prank, calculus deployed.</text>
    </svg>
  ) },

  // Plasma TV Incident
  { id: "plasma-tv", baseVh: 2070, side: "left", rotate: 3, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">plasma tv incident</text>
      {/* wall */}
      <rect x="20" y="40" width="240" height="150" />
      {/* tv way up in the corner */}
      <rect x="190" y="56" width="50" height="34" />
      <path d="M192 58 L238 88" strokeWidth="2" /><path d="M238 58 L192 88" strokeWidth="2" />
      <path d="M200 64 L230 80" /><path d="M198 72 L232 72" />
      {/* cracks */}
      <path d="M220 90 L225 110 L218 130 L226 150" opacity="0.6" />
      <text x="32" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">it&rsquo;s about the spite, not the screen.</text>
    </svg>
  ) },

  // Wes Anderson symmetric submarine
  { id: "wes-anderson", baseVh: 2120, side: "right", rotate: 4, render: () => (
    <svg width="300" height="180" viewBox="0 0 300 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">symmetrical excavation</text>
      {/* sub silhouette */}
      <path d="M30 110 L60 80 L240 80 L270 110 L240 140 L60 140 Z" />
      {/* central tower */}
      <rect x="140" y="60" width="20" height="20" />
      {/* portholes (symmetric pairs) */}
      {[80,120,160,200,220].map((x, i) => (
        <circle key={i} cx={x} cy="110" r="6" />
      ))}
      {/* axis */}
      <path d="M150 30 L150 170" strokeDasharray="2 4" opacity="0.5" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">center-framed, calmly nostalgic.</text>
    </svg>
  ) },

  // Breadboard Moebius
  { id: "breadboard-moebius", baseVh: 2170, side: "left", rotate: -4, render: () => (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">breadboard homunculus</text>
      {/* moebius loop */}
      <path d="M40 100 q 50 -50 120 0 q 50 50 80 0 q -40 -40 -80 -10 q -60 50 -120 10 z" />
      {/* drill holes pattern */}
      {Array.from({ length: 26 }).map((_, i) => {
        const t = i / 26
        const cx = 40 + Math.cos(t * Math.PI * 2) * 100 + 100
        const cy = 100 + Math.sin(t * Math.PI * 2) * 18
        return <circle key={i} cx={cx} cy={cy} r="1.4" />
      })}
      {/* jumper wires */}
      <path d="M70 92 q 40 -30 110 0" />
      <path d="M90 110 q 30 30 110 0" opacity="0.7" />
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">single-sided, twice as alive.</text>
    </svg>
  ) },

  // Mach 3 VGA rocket
  { id: "vga-rocket", baseVh: 2220, side: "right", rotate: 3, render: () => (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">mach 3 — vga structural</text>
      {/* upper stage */}
      <path d="M120 40 L100 80 L100 110 L140 110 L140 80 Z" />
      {/* avionics */}
      <rect x="100" y="110" width="40" height="20" />
      <path d="M104 116 L114 116 M118 116 L128 116 M104 122 L128 122" opacity="0.6" />
      {/* VGA connector "structural break" */}
      <rect x="92" y="132" width="56" height="14" />
      {Array.from({ length: 5 }).map((_, i) => <circle key={i} cx={102 + i*9} cy="139" r="1.2" />)}
      {/* lower stage */}
      <rect x="100" y="146" width="40" height="50" />
      {/* fins */}
      <path d="M100 196 L80 210 L100 196" />
      <path d="M140 196 L160 210 L140 196" />
      <text x="6" y="216" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">cable is the load-bearing member.</text>
    </svg>
  ) },

  // Cardboard cosmos — DIY camera + paper star
  { id: "cardboard-cosmos", baseVh: 2270, side: "left", rotate: -3, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">cardboard cosmos</text>
      {/* tripod + camera made of boxes */}
      <rect x="30" y="100" width="50" height="30" />
      <circle cx="55" cy="115" r="8" /><rect x="40" y="92" width="14" height="10" />
      <path d="M55 130 L40 170 M55 130 L70 170 M55 130 L55 170" />
      {/* paper star on diorama floor */}
      <path d="M200 80 L208 96 L226 96 L212 108 L218 126 L200 116 L182 126 L188 108 L174 96 L192 96 Z" />
      <path d="M120 170 L260 170" />
      {/* duct tape pieces */}
      <rect x="36" y="103" width="14" height="3" opacity="0.6" />
      <rect x="52" y="121" width="20" height="3" opacity="0.6" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">a real star, on cardboard.</text>
    </svg>
  ) },

  // One-minute chess
  { id: "chess-bullet", baseVh: 2320, side: "right", rotate: 4, render: () => (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">bullet chess — 00:01</text>
      {/* board with fractures */}
      {Array.from({ length: 4 }).map((_, r) => (
        Array.from({ length: 4 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={30 + c*40} y={60 + r*30}
            width="40" height="30"
            fill={((r + c) % 2 === 0 ? "currentColor" : "none")}
            opacity={(r + c) % 2 === 0 ? 0.85 : 1}
          />
        ))
      ))}
      {/* shatter cracks from centre */}
      <path d="M110 90 L40 60" /><path d="M110 90 L60 180" />
      <path d="M110 90 L180 60" /><path d="M110 90 L210 170" />
      {/* timer */}
      <rect x="160" y="30" width="50" height="20" />
      <text x="166" y="46" fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">00:01</text>
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">decision = velocity².</text>
    </svg>
  ) },

  // Gold pan — Klondike of microphones
  { id: "gold-pan", baseVh: 2370, side: "left", rotate: -4, render: () => (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">podcaster — panning the klondike</text>
      {/* prospector */}
      <g transform="translate(60 100)">
        <circle cx="0" cy="-20" r="8" />
        <path d="M-6 -28 L6 -28" />
        <path d="M0 -12 L0 12" />
        <path d="M0 -4 L20 6" />
        <path d="M0 -4 L-12 4" />
      </g>
      {/* pan */}
      <ellipse cx="120" cy="120" rx="60" ry="14" />
      <path d="M60 120 q 60 30 120 0" />
      {/* mics inside the pan */}
      <rect x="98"  y="108" width="6" height="14" />
      <rect x="116" y="106" width="6" height="16" />
      <rect x="134" y="110" width="6" height="12" />
      <rect x="150" y="108" width="6" height="14" />
      {/* river ripples */}
      <path d="M200 130 q 30 -8 60 0" opacity="0.6" />
      <path d="M200 142 q 30 -8 60 0" opacity="0.6" />
      <text x="6" y="170" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">all mic, no signal.</text>
    </svg>
  ) },

  // Tuning fork — pure wave vs distortion
  { id: "tuning-fork", baseVh: 2420, side: "right", rotate: 3, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">tuning fork — signal vs virus</text>
      <path d="M40 50 L40 100" /><path d="M60 50 L60 100" />
      <rect x="32" y="100" width="36" height="12" />
      <path d="M50 112 L50 150" />
      {/* pure wave */}
      <path d="M80 80 Q 100 60, 120 80 T 160 80 T 200 80" strokeWidth="1.6" />
      {/* virus distortion overtaking */}
      <path d="M200 80 q 10 -16 16 4 q 8 24 18 -6 q 8 -16 14 16 q 6 14 12 -14" strokeWidth="1.6" opacity="0.85" />
      <text x="6" y="190" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">listen carefully.</text>
    </svg>
  ) },

  // Hegelian gears — shared axle
  { id: "hegelian-gears", baseVh: 2470, side: "left", rotate: -3, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">dialectic — same axle</text>
      {/* two gears */}
      {[80, 200].map((cx, k) => (
        <g key={k}>
          <circle cx={cx} cy="110" r="46" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2
            const x = cx + Math.cos(a) * 46, y = 110 + Math.sin(a) * 46
            return <rect key={i} x={x - 3} y={y - 4} width="6" height="8" transform={`rotate(${(a*180)/Math.PI + 90} ${x} ${y})`} />
          })}
          <circle cx={cx} cy="110" r="6" fill="currentColor" />
        </g>
      ))}
      {/* shared axle */}
      <path d="M80 110 L200 110" />
      <text x="6" y="190" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">opposites turn the same shaft.</text>
    </svg>
  ) },

  // Gerontocracy — parasitic vine on a pillar
  { id: "gerontocracy", baseVh: 2520, side: "right", rotate: 4, render: () => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">gerontocracy — feedback loop</text>
      {/* pillar */}
      <path d="M90 40 L150 40 L160 220 L80 220 Z" />
      {/* capital */}
      <rect x="76" y="30" width="88" height="14" />
      {/* cracks */}
      <path d="M100 60 L98 200" opacity="0.5" />
      <path d="M120 50 L122 220" opacity="0.5" />
      <path d="M140 70 L138 210" opacity="0.5" />
      {/* parasitic vine wrapping up to the top */}
      <path d="M80 220 q -20 -40 0 -80 q 20 -40 0 -80 q -20 -40 0 -80 q 14 -16 30 -20" />
      <path d="M80 220 q 60 -40 30 -80" opacity="0.6" />
      <path d="M90 40 q -16 -10 -20 -22" opacity="0.6" />
      {/* leaves */}
      {[[70,170],[88,120],[68,90],[110,40]].map(([x,y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="3" />
      ))}
      <text x="6" y="234" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">roots starved, capital fed.</text>
    </svg>
  ) },

  // IKEA — toxic relationship instruction
  { id: "ikea-toxic", baseVh: 2570, side: "left", rotate: -4, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">ikea — toxic assembly</text>
      <rect x="20" y="40" width="240" height="150" />
      {/* step 1 — figure */}
      <g transform="translate(60 110)">
        <circle cx="0" cy="-20" r="8" /><path d="M0 -12 L0 16" />
        <path d="M0 -4 L12 -10" /><path d="M0 -4 L-12 -10" />
      </g>
      <text x="50" y="160" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">1.</text>
      {/* step 2 — figure holds tool */}
      <g transform="translate(130 110)">
        <circle cx="0" cy="-20" r="8" /><path d="M0 -12 L0 16" />
        <path d="M0 -4 L12 -10" /><path d="M0 -4 L-14 0" />
        <rect x="10" y="-14" width="14" height="6" />
      </g>
      <text x="120" y="160" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">2.</text>
      {/* step 3 — fractured outline */}
      <g transform="translate(210 110)">
        <circle cx="0" cy="-20" r="8" strokeDasharray="2 3" />
        <path d="M0 -12 L-2 16" strokeDasharray="2 3" />
        <path d="M0 -4 L-16 -8" strokeDasharray="2 3" />
        <path d="M0 -4 L18 -2"  strokeDasharray="2 3" />
        {/* speech bubble */}
        <path d="M16 -30 q 22 -16 32 0 q 4 14 -10 14 l -2 8 l -6 -8 q -12 -2 -14 -14 z" />
      </g>
      <text x="200" y="160" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">3.</text>
    </svg>
  ) },

  // Nuclear stoic — philosopher leaning on warhead
  { id: "nuclear-stoic", baseVh: 2620, side: "right", rotate: -3, render: () => (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">stoic — &ldquo;we&rsquo;re all going to die.&rdquo;</text>
      {/* warhead */}
      <path d="M150 180 L150 100 q 0 -40 30 -50 q 30 10 30 50 L210 180 Z" />
      <path d="M150 180 L210 180" />
      {/* fins */}
      <path d="M150 180 L130 200 L150 200 Z" />
      <path d="M210 180 L230 200 L210 200 Z" />
      {/* clock */}
      <circle cx="180" cy="60" r="8" /><path d="M180 60 L180 56" /><path d="M180 60 L184 60" />
      {/* philosopher */}
      <g transform="translate(80 130)">
        <circle cx="0" cy="-26" r="10" />
        <path d="M-8 -16 q 0 14 8 22 q 8 -8 8 -22" />
        <path d="M-12 0 L12 0" />
        <path d="M-14 0 L-20 30" /><path d="M14 0 L8 30" />
        {/* leaning arm on warhead */}
        <path d="M14 -6 L60 22" />
        {/* water bottle */}
        <rect x="-22" y="-10" width="8" height="22" />
      </g>
      <text x="6" y="208" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">amor fati. sip.</text>
    </svg>
  ) },

  // Kompromat filing cabinet
  { id: "kompromat", baseVh: 2670, side: "left", rotate: 3, render: () => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">kompromat — file forever</text>
      {/* drawers stacked, going UP into darkness */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x="60" y={40 + i*30} width="120" height="28" />
          <circle cx="120" cy={54 + i*30} r="2" fill="currentColor" />
          {/* a slightly open drawer with light */}
          {i === 2 ? (
            <>
              <rect x="60" y={42 + i*30} width="120" height="20" fill="currentColor" opacity="0.3" />
              <path d="M70 50 L170 50" strokeWidth="2" opacity="0.9" />
            </>
          ) : null}
        </g>
      ))}
      {/* fade-to-black at top */}
      <path d="M60 40 L180 40" strokeDasharray="4 3" opacity="0.5" />
      <text x="6" y="234" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">one drawer, slightly ajar.</text>
    </svg>
  ) },

  // Dead Man's Drop — USB over bubbling acid
  { id: "dead-mans-drop", baseVh: 2720, side: "right", rotate: -4, render: () => (
    <svg width="240" height="220" viewBox="0 0 240 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">data → acid</text>
      {/* heartbeat monitor ceiling */}
      <path d="M20 50 L70 50 L80 38 L90 64 L100 44 L110 50 L220 50" />
      {/* thread */}
      <path d="M120 50 L120 110" strokeDasharray="2 2" />
      {/* USB */}
      <rect x="106" y="110" width="28" height="14" />
      <rect x="118" y="124" width="4" height="6" /><rect x="122" y="124" width="4" height="6" />
      {/* vat */}
      <path d="M50 160 L190 160 L170 210 L70 210 Z" />
      <path d="M70 160 q 30 -10 60 0 q 30 10 60 0" opacity="0.7" />
      {/* bubbles */}
      <circle cx="90"  cy="190" r="3" />
      <circle cx="120" cy="200" r="4" />
      <circle cx="160" cy="186" r="2" />
      <text x="6" y="216" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">drop on signal loss.</text>
    </svg>
  ) },

  // Scam anatomy
  { id: "scam-anatomy", baseVh: 2770, side: "left", rotate: 3, render: () => (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">scam anatomy</text>
      {/* parasite body */}
      <ellipse cx="130" cy="110" rx="80" ry="40" />
      {/* organs */}
      <circle cx="100" cy="100" r="10" /><circle cx="160" cy="100" r="10" />
      <circle cx="130" cy="120" r="14" />
      {/* veins */}
      <path d="M70 110 q 40 -30 90 0" /><path d="M70 110 q 60 30 90 0" />
      {/* labels with leader lines */}
      <path d="M60 70 L100 100" /><text x="20" y="68" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">hook</text>
      <path d="M210 70 L160 100" /><text x="210" y="68" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">churn</text>
      <path d="M130 168 L130 134" /><text x="120" y="184" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none">exit</text>
    </svg>
  ) },

  // Math rock Rubik
  { id: "math-rock-rubik", baseVh: 2820, side: "right", rotate: -3, render: () => (
    <svg width="240" height="220" viewBox="0 0 240 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">math rock — locked polyrhythm</text>
      {/* isometric cube */}
      <path d="M60 60 L120 30 L180 60 L120 90 Z" />
      <path d="M60 60 L60 160 L120 190 L120 90" />
      <path d="M180 60 L180 160 L120 190" />
      {/* inner grids */}
      <path d="M80 70 L140 40" opacity="0.5" /><path d="M100 80 L160 50" opacity="0.5" />
      <path d="M60 110 L120 140" opacity="0.5" /><path d="M60 130 L120 160" opacity="0.5" />
      <path d="M180 110 L120 140" opacity="0.5" /><path d="M180 130 L120 160" opacity="0.5" />
      {/* time signatures floating around */}
      <text x="20"  y="60"  fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none">7/8</text>
      <text x="200" y="60"  fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none">11/16</text>
      <text x="20"  y="200" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none">5/4</text>
      <text x="200" y="200" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none">15/8</text>
    </svg>
  ) },

  // Strudel — Moog with code patches
  { id: "strudel-synth", baseVh: 2870, side: "left", rotate: 3, render: () => (
    <svg width="300" height="180" viewBox="0 0 300 180" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">strudel — live-coded patches</text>
      {/* moog panel */}
      <rect x="20" y="40" width="180" height="100" />
      {[40, 80, 120, 160].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="68" r="9" /><path d={`M${x} 60 L${x} 64`} />
          <rect x={x - 6} y="92" width="12" height="6" />
        </g>
      ))}
      {/* patch points */}
      {[40, 80, 120, 160].map((x, i) => (
        <circle key={`p${i}`} cx={x} cy="120" r="4" />
      ))}
      {/* code-as-cable */}
      <text x="44" y="158" fontFamily="var(--font-display)" fontSize="9" fill="currentColor" stroke="none">{`"c3 e3 g3".note()`}</text>
      <path d="M40 124 q 80 -10 160 16" />
      <path d="M120 124 q 40 -16 80 8" opacity="0.7" />
      {/* speaker */}
      <path d="M220 70 L260 50 L260 130 L220 110 Z" />
      <circle cx="240" cy="90" r="10" />
      <text x="220" y="158" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">javascript → vibration.</text>
    </svg>
  ) },

  // Institutional capture — spiderweb of red tape
  { id: "institutional-capture", baseVh: 2920, side: "right", rotate: 4, render: () => (
    <svg width="280" height="220" viewBox="0 0 280 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">institutional capture</text>
      {/* government building */}
      <path d="M70 160 L210 160 L200 80 L80 80 Z" />
      <path d="M80 80 L140 50 L200 80" />
      {/* columns */}
      {Array.from({ length: 4 }).map((_, i) => <path key={i} d={`M${100 + i*22} 80 L${100 + i*22} 160`} />)}
      <path d="M70 160 L210 160" strokeWidth="2" />
      {/* spider web of red tape */}
      <circle cx="140" cy="120" r="80" strokeDasharray="4 4" opacity="0.6" />
      <circle cx="140" cy="120" r="60" strokeDasharray="4 4" opacity="0.6" />
      <circle cx="140" cy="120" r="40" strokeDasharray="4 4" opacity="0.6" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const x = 140 + Math.cos(a) * 80
        const y = 120 + Math.sin(a) * 80
        return <path key={i} d={`M140 120 L${x} ${y}`} strokeDasharray="2 3" opacity="0.6" />
      })}
      <text x="6" y="210" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">routing #s as silk.</text>
    </svg>
  ) },

  // Immigrant dad talk show
  { id: "immigrant-dad", baseVh: 2970, side: "left", rotate: -3, render: () => (
    <svg width="300" height="200" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">generational canyon</text>
      {/* armchairs facing each other */}
      <g transform="translate(40 120)">
        <path d="M0 0 L40 0 L44 -40 L-4 -40 Z" />
        <path d="M0 0 L0 24 M40 0 L40 24" />
        <circle cx="20" cy="-56" r="10" />
      </g>
      <g transform="translate(220 120)">
        <path d="M0 0 L40 0 L44 -40 L-4 -40 Z" />
        <path d="M0 0 L0 24 M40 0 L40 24" />
        <circle cx="20" cy="-56" r="10" />
      </g>
      {/* canyon between them */}
      <path d="M110 110 L130 160 L170 160 L190 110" />
      <path d="M120 130 L180 130" opacity="0.5" />
      {/* sound waves becoming glyphs */}
      <path d="M84 70 q 20 0 30 -10" /><path d="M84 80 q 30 0 50 -20" />
      <text x="148" y="64" fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">𐎀𐎓𐎈</text>
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">same words, different ears.</text>
    </svg>
  ) },

  // Bullshit jobs — cargo cult
  { id: "bullshit-jobs", baseVh: 3020, side: "right", rotate: 4, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">bullshit jobs — cargo cult</text>
      {/* figure with VR headset and stone tool */}
      <g transform="translate(70 130)">
        <circle cx="0" cy="-30" r="10" />
        <rect x="-12" y="-32" width="24" height="6" />
        <path d="M0 -20 L0 10" />
        <path d="M0 -10 L20 -2" />
        <path d="M0 -10 L-12 -2" />
        {/* stone tool */}
        <path d="M16 -6 L36 4 L30 14 L10 6 Z" />
      </g>
      {/* server rack being bashed */}
      <rect x="160" y="80" width="80" height="110" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x="170" y={92 + i*20} width="60" height="14" />
      ))}
      <path d="M50 60 L100 110" strokeDasharray="2 3" />
      <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">primitive worship of busyness.</text>
    </svg>
  ) },

  // Anatomy pinned — psychedelic cutout
  { id: "anatomy-pinned", baseVh: 3070, side: "left", rotate: -4, render: () => (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">heaven &amp; hell — anatomy pinned</text>
      {/* graph paper */}
      <rect x="20" y="40" width="240" height="150" />
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={`h${i}`} d={`M20 ${48 + i*16} L260 ${48 + i*16}`} opacity="0.3" />
      ))}
      {Array.from({ length: 15 }).map((_, i) => (
        <path key={`v${i}`} d={`M${28 + i*16} 40 L${28 + i*16} 190`} opacity="0.3" />
      ))}
      {/* an eye */}
      <ellipse cx="80" cy="100" rx="20" ry="12" />
      <circle cx="80" cy="100" r="5" fill="currentColor" />
      <path d="M78 88 L82 76" /> {/* pin */}
      {/* a hand */}
      <g transform="translate(170 90)">
        <path d="M0 0 L30 0 L30 30 L0 30 Z" />
        <path d="M0 0 L-6 -8" /><path d="M10 0 L8 -16" />
        <path d="M20 0 L18 -14" /><path d="M30 0 L36 -8" />
        <path d="M16 -10 L16 -22" /> {/* pin */}
      </g>
      <text x="6" y="206" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">organic madness, cartesian cage.</text>
    </svg>
  ) },
]

// ---- Layout: place doodles with random jitter around their baseVh

type Placed = Doodle & { topVh: number }

function place(doodles: Doodle[]): Placed[] {
  // LCG seeded by Date.now() so the layout is deterministic for the
  // session but varies across reloads.
  let seed = Math.floor(Math.random() * 1e9)
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  return doodles.map((d) => ({
    ...d,
    // ±18vh jitter around the base, keeps consecutive doodles apart.
    topVh: d.baseVh + (rand() * 36 - 18),
  }))
}

function DoodleLayer({ items }: { items: Placed[] }) {
  return (
    <>
      {items.map((d) => (
        <div
          key={d.id}
          aria-hidden
          data-side={d.side}
          className="doodle"
          style={{
            position: "absolute",
            top: `${d.topVh}vh`,
            // Wide screens: doodle sits *outside* the centred content
            // column on its preferred side. Narrow viewports override
            // via the .doodle CSS below to put everything in the
            // right margin at a smaller scale.
            [d.side]: `calc(50% + ${CONTENT_HALF + GUTTER}px)`,
            // Rotation lives on a custom property so the media-query
            // overrides can compose it with `scale()`.
            ["--r" as string]: `${d.rotate}deg`,
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
      { top: "1900vh", side: "right" as const, offset: "4vw",  rotate: -7,  size: 13 },
      { top: "2200vh", side: "left"  as const, offset: "6vw"  , rotate: 4,   size: 14 },
      { top: "2500vh", side: "right" as const, offset: "8vw"  , rotate: -20, size: 12 },
      { top: "2800vh", side: "left"  as const, offset: "4vw"  , rotate: 14,  size: 13 },
    ],
    [],
  )

  return (
    <>
      {/* Doodle sizing + positioning. Three tiers:
          - wide desktop: outside the centred content column, +15%
          - tablet / narrow desktop: forced into the right margin
            (content is mostly left-aligned on smaller layouts), 70%
          - phone: scaled to ~55% so they read as marginalia, not
            paper-tape. Rotation is composed with scale through a
            --r custom property set inline on each doodle. */}
      <style>{`
        .doodle {
          transform: rotate(var(--r, 0deg));
          transform-origin: 50% 50%;
          will-change: transform;
        }
        @media (min-width: 1400px) {
          .doodle {
            transform: rotate(var(--r, 0deg)) scale(1.15);
          }
        }
        @media (max-width: 1399px) {
          .doodle[data-side="left"],
          .doodle[data-side="right"] {
            left: auto;
            right: 1vw;
          }
          .doodle {
            transform: rotate(var(--r, 0deg)) scale(0.7);
            transform-origin: 100% 50%;
            opacity: 0.5;
          }
        }
        @media (max-width: 640px) {
          .doodle {
            transform: rotate(var(--r, 0deg)) scale(0.55);
            opacity: 0.45;
          }
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
        {items && <DoodleLayer items={items} />}
        {stars.map((s, i) => (
          <MarginStar key={i} {...s} opacity={0.45} />
        ))}
      </div>
    </>
  )
}
