"use client"

// PaperDecorations — tasteful clutter scattered down the page so it
// reads like a working notebook: coffee-stain pngs at low opacity
// plus a sprawl of hand-sketched math / physics / cs / weird-ideas
// doodles. The doodles double as a hieroglyphic for what Eliáš
// actually thinks about — DMN, splatting, OSINT, time debt, etc.
//
// Everything is pointer-events:none and absolutely positioned, so
// the marks never interfere with the layout — they just live in the
// margins of whatever's underneath. Items are placed at predetermined
// vh offsets so they spread across the entire scrollable surface.

const COFFEE_STAINS: Array<{
  src: string
  top: string
  side: "left" | "right"
  offset: string
  size: number
  rotate: number
  opacity: number
}> = [
  { src: "/coffee2.png", top: "82vh",  side: "right", offset: "-3vw",  size: 320, rotate: -14, opacity: 0.22 },
  { src: "/coffee1.png", top: "180vh", side: "left",  offset: "-4vw",  size: 380, rotate: 22,  opacity: 0.18 },
  { src: "/coffee4.png", top: "295vh", side: "right", offset: "2vw",   size: 280, rotate: -38, opacity: 0.2  },
  { src: "/coffee3.png", top: "420vh", side: "left",  offset: "8vw",   size: 240, rotate: 9,   opacity: 0.16 },
  { src: "/coffee1.png", top: "560vh", side: "right", offset: "-2vw",  size: 340, rotate: 47,  opacity: 0.19 },
  { src: "/coffee2.png", top: "680vh", side: "left",  offset: "-3vw",  size: 280, rotate: 18,  opacity: 0.17 },
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

// Each doodle is its own SVG — handwritten math / physics / cs /
// "what the author is into" sketches. currentColor + ink-wobble so
// they pick up the page's theme and read as hand-laid.

type DoodleProps = {
  top: string
  side: "left" | "right"
  offset: string
  rotate: number
  opacity?: number
  children: React.ReactNode
}

function Doodle({ top, side, offset, rotate, opacity = 0.55, children }: DoodleProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top,
        [side]: offset,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "50% 50%",
        opacity,
        pointerEvents: "none",
        zIndex: 26,
        color: "var(--ink)",
        fontFamily: "var(--font-display)",
        filter: "url(#ink-wobble)",
      }}
    >
      {children}
    </div>
  )
}

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

function Doodles() {
  return (
    <>
      {/* === MATH / PHYSICS / CS — the "in the margin of my textbook" tier */}

      {/* Euler's identity */}
      <Doodle top="55vh" side="left" offset="3vw" rotate={-5}>
        <svg width="260" height="120" viewBox="0 0 260 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="48" fontFamily="var(--font-display)" fontSize="32" fill="currentColor" stroke="none">
            e<tspan baselineShift="super" fontSize="20">iπ</tspan> + 1 = 0
          </text>
          <text x="6" y="80" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none" opacity="0.65">
            * the most beautiful equation.
          </text>
          <text x="6" y="98" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.55">
            five constants. one breath.
          </text>
          <path d="M5 110 Q 130 118, 255 110" strokeWidth="1.1" opacity="0.7" />
        </svg>
      </Doodle>

      {/* Wave function with damping envelope */}
      <Doodle top="135vh" side="right" offset="2vw" rotate={6}>
        <svg width="280" height="160" viewBox="0 0 280 160" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="28" fontFamily="var(--font-display)" fontSize="18" fill="currentColor" stroke="none">
            ψ(x, t) — schrödinger
          </text>
          <path d="M14 90 L268 90" />
          <path d="M30 28 L30 142" />
          <path d="M30 90 Q 55 18, 80 90 T 130 90 T 180 90 T 230 90 T 268 90" strokeWidth="1.5" />
          <path d="M30 42 Q 140 70, 268 86" strokeDasharray="3 3" opacity="0.6" />
          <text x="220" y="130" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">x →</text>
          <text x="6"   y="46" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.55">|ψ|² → prob.</text>
        </svg>
      </Doodle>

      {/* Big O graph */}
      <Doodle top="240vh" side="left" offset="2vw" rotate={-4}>
        <svg width="260" height="180" viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="20" fontFamily="var(--font-display)" fontSize="16" fill="currentColor" stroke="none">
            big o — knowing the cost
          </text>
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
      </Doodle>

      {/* Maxwell — Faraday */}
      <Doodle top="340vh" side="right" offset="4vw" rotate={-7}>
        <svg width="300" height="120" viewBox="0 0 300 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="48" fontFamily="var(--font-display)" fontSize="30" fill="currentColor" stroke="none">
            ∇ × E = − ∂B/∂t
          </text>
          <text x="6" y="80" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none" opacity="0.7">
            faraday — fields like to whirl.
          </text>
          <path d="M0 100 Q150 108, 300 96" strokeWidth="0.9" opacity="0.7" />
        </svg>
      </Doodle>

      {/* φ + spiral */}
      <Doodle top="450vh" side="left" offset="4vw" rotate={5}>
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="26" fontFamily="var(--font-display)" fontSize="18" fill="currentColor" stroke="none">
            φ ≈ 1.61803398…
          </text>
          <text x="6" y="46" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">
            a / b = (a + b) / a
          </text>
          <path d="M180 160 Q 180 90, 110 90 Q 60 90, 60 140 Q 60 170, 100 170 Q 124 170, 124 156" />
          <rect x="60"  y="90"  width="120" height="80" />
          <rect x="60"  y="90"  width="50"  height="80" />
          <rect x="110" y="120" width="40"  height="50" />
          <rect x="150" y="142" width="20"  height="28" />
        </svg>
      </Doodle>

      {/* DFS graph */}
      <Doodle top="540vh" side="right" offset="3vw" rotate={-3}>
        <svg width="250" height="170" viewBox="0 0 250 170" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            dfs(g, v) — depth before breadth
          </text>
          <path d="M40 90 L100 50" />
          <path d="M40 90 L100 130" />
          <path d="M100 50 L180 80" />
          <path d="M100 130 L180 140" />
          <path d="M180 80 L180 140" />
          <path d="M180 80 L230 50" />
          <circle cx="40"  cy="90"  r="11" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="100" cy="50"  r="11" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="100" cy="130" r="11" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="180" cy="80"  r="11" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="180" cy="140" r="11" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="230" cy="50"  r="11" fill="var(--surface-dark, #f6f6f4)" />
          {["a","b","c","d","e","f"].map((c, i) => (
            <text key={c} x={[40,100,100,180,180,230][i] - 4} y={[90,50,130,80,140,50][i] + 4} fontFamily="var(--font-display)" fontSize="12" fill="currentColor" stroke="none">{c}</text>
          ))}
        </svg>
      </Doodle>

      {/* === MORE PERSONAL — substrate, splats, time debt, OSINT, etc. */}

      {/* Gaussian splatting skull (abstract scatter inside bounding box) */}
      <Doodle top="640vh" side="left" offset="3vw" rotate={-6}>
        <svg width="260" height="200" viewBox="0 0 260 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            gaussian splat — 3d from photons
          </text>
          {/* bounding box */}
          <path d="M30 50 L210 40 L235 130 L55 145 Z" strokeDasharray="3 3" opacity="0.5" />
          {/* skull silhouette traced loosely */}
          <path d="M115 60 q -55 4 -55 60 q 0 24 14 36 l 8 12 l 14 -2 l 0 16 l 14 0 l 0 -16 l 14 2 l 8 -12 q 14 -12 14 -36 q 0 -56 -55 -60 z" />
          {/* eye sockets */}
          <ellipse cx="100" cy="108" rx="9" ry="11" />
          <ellipse cx="138" cy="106" rx="9" ry="11" />
          {/* nose */}
          <path d="M120 118 l -3 18 l 6 0 z" />
          {/* splat ellipses scattered */}
          {[
            [88,84,8,3,20], [104,72,6,2,40], [128,68,9,3,-12], [148,86,7,2,30],
            [170,110,10,3,-25], [86,138,8,2,15], [120,150,11,3,5], [156,148,8,2,-20],
            [60,100,5,2,55], [200,90,6,2,-40], [192,130,9,3,12], [70,124,6,2,-10],
          ].map(([cx, cy, rx, ry, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${r} ${cx} ${cy})`} opacity="0.55" />
          ))}
        </svg>
      </Doodle>

      {/* Raymarching SDF — three primitives blending */}
      <Doodle top="750vh" side="right" offset="3vw" rotate={5}>
        <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            sdf — smooth min(a, b)
          </text>
          {/* volumetric grid */}
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={`h${i}`} d={`M30 ${50 + i * 22} L210 ${50 + i * 22}`} opacity="0.18" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`v${i}`} d={`M${30 + i * 25} 50 L${30 + i * 25} 182`} opacity="0.18" />
          ))}
          {/* sphere + cube + torus blob outline */}
          <path d="M60 130 q -10 -40 30 -40 q 25 -30 60 -10 q 35 -10 40 30 q 10 30 -30 40 q -50 18 -75 0 q -35 0 -25 -20 z" strokeWidth="1.6" />
          <circle cx="78"  cy="118" r="20" opacity="0.35" />
          <rect   x="118"  y="92" width="44" height="44" opacity="0.35" />
          <ellipse cx="180" cy="135" rx="22" ry="10" opacity="0.35" />
          <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">distance fields melt like mercury</text>
        </svg>
      </Doodle>

      {/* Time debt hourglass (sombra os) */}
      <Doodle top="870vh" side="left" offset="3vw" rotate={-4}>
        <svg width="220" height="240" viewBox="0 0 220 240" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            the polymath&rsquo;s time debt
          </text>
          {/* hourglass outline — top bulb cracking */}
          <path d="M40 40 L180 40 L180 60 Q 180 100, 110 120 Q 40 100, 40 60 Z" />
          {/* cracks in top bulb */}
          <path d="M70 50 L82 70" />
          <path d="M82 70 L94 64" />
          <path d="M120 48 L132 64 L120 70" opacity="0.7" />
          {/* particles bursting from top */}
          {[[50,46,3],[150,42,2],[170,48,2],[60,38,2],[100,34,2],[140,36,3],[30,52,2]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
          {/* bottom bulb (mostly empty) */}
          <path d="M40 240 L180 240 L180 220 Q 180 180, 110 160 Q 40 180, 40 220 Z" />
          <circle cx="110" cy="230" r="3" />
          <circle cx="118" cy="232" r="2" />
          <text x="6" y="200" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">ideas: 99.9%</text>
          <text x="6" y="214" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">execution: ε</text>
        </svg>
      </Doodle>

      {/* Black box monolith (mech. interpretability) */}
      <Doodle top="980vh" side="right" offset="4vw" rotate={4}>
        <svg width="200" height="240" viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            the black box
          </text>
          {/* obelisk */}
          <path d="M70 40 L130 40 L138 220 L62 220 Z" fill="currentColor" stroke="none" opacity="0.85" />
          <path d="M70 40 L130 40 L138 220 L62 220 Z" />
          {/* glowing hairline cracks revealing wiring */}
          <path d="M80 60 q 10 30 -4 80 q -10 50 12 70" stroke="rgba(255,255,255,0.9)" />
          <path d="M120 70 q -8 40 4 70 q 12 40 -6 65"  stroke="rgba(255,255,255,0.9)" opacity="0.8" />
          <path d="M95 100 q -6 24 6 36 q 8 12 -2 24"   stroke="rgba(255,255,255,0.6)" />
          <text x="6" y="234" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.65">interpretability ↗</text>
        </svg>
      </Doodle>

      {/* OSINT network — strings on the corkboard */}
      <Doodle top="1090vh" side="left" offset="3vw" rotate={-3}>
        <svg width="300" height="220" viewBox="0 0 300 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            revizor — string on a corkboard
          </text>
          {/* "redacted cards" */}
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
          {/* strings linking them */}
          <path d="M60 86  L185 70"   opacity="0.7" />
          <path d="M185 70 L265 90"   opacity="0.7" />
          <path d="M60 86  L95 150"   opacity="0.7" />
          <path d="M95 150 L200 158"  opacity="0.7" />
          <path d="M200 158 L275 166" opacity="0.7" />
          <path d="M185 70 L200 158"  strokeDasharray="2 3" opacity="0.6" />
          {/* "X" mark on one card */}
          <path d="M155 45 L215 65" strokeWidth="2" />
          <path d="M215 45 L155 65" strokeWidth="2" />
        </svg>
      </Doodle>

      {/* DMN dissolving into mycorrhizal network */}
      <Doodle top="1200vh" side="right" offset="3vw" rotate={6}>
        <svg width="280" height="220" viewBox="0 0 280 220" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            dmn → mycorrhizae
          </text>
          {/* left: bureaucratic grid */}
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={`gh${i}`} d={`M20 ${50 + i * 22} L130 ${50 + i * 22}`} opacity="0.6" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={`gv${i}`} d={`M${20 + i * 22} 50 L${20 + i * 22} 160`} opacity="0.6" />
          ))}
          {/* right: branching roots */}
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
          {/* tiny mycelium ends */}
          {[[220,55,2],[220,33,2],[245,40,2],[228,98,2],[245,135,2],[195,170,2],[212,170,2]].map(([x,y,r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
          {/* arrow */}
          <path d="M132 105 L148 105" />
          <path d="M148 105 L142 100" />
          <path d="M148 105 L142 110" />
          <text x="6" y="200" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">order → emergence</text>
        </svg>
      </Doodle>

      {/* Boids / emergence — many triangles flocking into a whale shape */}
      <Doodle top="1320vh" side="left" offset="3vw" rotate={-4}>
        <svg width="320" height="180" viewBox="0 0 320 180" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            boids — local rules, global shape
          </text>
          {/* outline of a whale */}
          <path d="M40 100 q 60 -60 160 -50 q 70 6 100 20 l -22 14 l -8 -8 l -18 14 l -30 8 q -50 14 -110 4 q -50 -8 -72 -2 z" strokeDasharray="3 3" opacity="0.5" />
          {/* triangles filling the silhouette */}
          {[
            [70,90,8],[90,82,-10],[110,76,5],[130,72,-8],[155,70,4],[180,68,-6],
            [210,72,2],[235,80,-12],[260,88,6],[280,98,-4],[88,108,12],[112,112,-6],
            [138,112,8],[162,110,-2],[188,108,4],[215,108,-10],[238,112,6],[155,90,3],
            [185,90,-7],[215,90,5],[120,98,-9],[148,98,4],
          ].map(([cx, cy, r], i) => (
            <path key={i} d={`M${cx} ${cy - 5} L${cx + 4} ${cy + 3} L${cx - 4} ${cy + 3} Z`} transform={`rotate(${r} ${cx} ${cy})`} />
          ))}
        </svg>
      </Doodle>

      {/* Ouroboros / hyperstition */}
      <Doodle top="1430vh" side="right" offset="3vw" rotate={3}>
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            hyperstition — narrative as engine
          </text>
          {/* serpent loop */}
          <circle cx="110" cy="115" r="62" />
          {/* belly stripes */}
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i / 20) * Math.PI * 2
            const x1 = 110 + Math.cos(a) * 57
            const y1 = 115 + Math.sin(a) * 57
            const x2 = 110 + Math.cos(a) * 67
            const y2 = 115 + Math.sin(a) * 67
            return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />
          })}
          {/* eye */}
          <circle cx="170" cy="100" r="4" fill="currentColor" />
          {/* "biting" jaw */}
          <path d="M168 116 q -12 6 -22 0" />
          {/* writing pen leaving the loop */}
          <path d="M82 60 L60 32" />
          <path d="M60 32 l 8 -6 l 6 8" />
          <text x="44" y="22" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">writes itself</text>
        </svg>
      </Doodle>

      {/* Curta calculator — exploded mechanical */}
      <Doodle top="1540vh" side="left" offset="3vw" rotate={-5}>
        <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            curta — hardware as occult artifact
          </text>
          {/* drum */}
          <ellipse cx="120" cy="120" rx="56" ry="14" />
          <path d="M64 120 L64 80" />
          <path d="M176 120 L176 80" />
          <ellipse cx="120" cy="80" rx="56" ry="14" />
          {/* register windows */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = -Math.PI / 2 + (i / 8) * Math.PI
            const x = 120 + Math.cos(a) * 50
            const y =  78 + Math.sin(a) *  6
            return <rect key={i} x={x - 6} y={y - 4} width="12" height="8" />
          })}
          {/* crank */}
          <path d="M120 70 L120 40" />
          <circle cx="120" cy="36" r="6" />
          {/* exploded view lines */}
          <path d="M50 120 L20 140"  strokeDasharray="2 3" opacity="0.6" />
          <path d="M190 120 L220 140" strokeDasharray="2 3" opacity="0.6" />
          <text x="6"   y="156" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">step drum</text>
          <text x="186" y="156" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">registers</text>
        </svg>
      </Doodle>

      {/* Markov chain */}
      <Doodle top="1650vh" side="right" offset="3vw" rotate={-3}>
        <svg width="280" height="160" viewBox="0 0 280 160" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            markov chain — memoryless leap
          </text>
          <circle cx="50"  cy="90" r="22" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="140" cy="60" r="22" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="140" cy="120" r="22" fill="var(--surface-dark, #f6f6f4)" />
          <circle cx="230" cy="90" r="22" fill="var(--surface-dark, #f6f6f4)" />
          <text x="45"  y="94"  fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₀</text>
          <text x="135" y="64"  fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₁</text>
          <text x="134" y="124" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₂</text>
          <text x="225" y="94"  fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">s₃</text>
          {/* edges */}
          <path d="M68 80  L120 64" />  <path d="M120 64 L116 60" /> <path d="M120 64 L118 70" />
          <path d="M68 100 L120 120" /> <path d="M120 120 L116 116" /> <path d="M120 120 L118 124" />
          <path d="M162 60  L210 84" /> <path d="M210 84 L204 84" /> <path d="M210 84 L208 78" />
          <path d="M162 120 L210 96" /> <path d="M210 96 L204 96" /> <path d="M210 96 L208 102" />
          {/* self-loop on s3 */}
          <path d="M252 78 q 24 -10 0 -28 q -24 18 0 28" />
        </svg>
      </Doodle>

      {/* IFS — fractured mirror */}
      <Doodle top="1760vh" side="left" offset="3vw" rotate={4}>
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            internal family — orbits of self
          </text>
          {/* shattered mirror */}
          <path d="M110 100 L150 60 L200 90 L188 138 L142 170 L96 168 L50 142 L40 96 L70 58 Z" />
          <path d="M110 100 L150 60"  /> <path d="M110 100 L200 90" />
          <path d="M110 100 L188 138" /> <path d="M110 100 L142 170" />
          <path d="M110 100 L96 168"  /> <path d="M110 100 L50 142" />
          <path d="M110 100 L40 96"   /> <path d="M110 100 L70 58" />
          <circle cx="110" cy="100" r="6" fill="currentColor" />
          {/* labels around */}
          <text x="158" y="64"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">manager</text>
          <text x="204" y="92"  fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">exile</text>
          <text x="146" y="180" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">firefighter</text>
          <text x="20"  y="120" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.7">critic</text>
        </svg>
      </Doodle>

      {/* Cymatics — standing wave */}
      <Doodle top="1870vh" side="right" offset="3vw" rotate={-4}>
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            cymatics — sand listening
          </text>
          {/* chladni-style symmetric pattern */}
          {Array.from({ length: 6 }).map((_, i) => {
            const r = 18 + i * 12
            return <circle key={i} cx="110" cy="115" r={r} opacity={0.85 - i * 0.08} />
          })}
          {/* 6-fold spokes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <path key={i} d={`M${110 + Math.cos(a) * 14} ${115 + Math.sin(a) * 14} L${110 + Math.cos(a) * 86} ${115 + Math.sin(a) * 86}`} opacity="0.7" />
            )
          })}
          <text x="6" y="192" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">frequency = form</text>
        </svg>
      </Doodle>

      {/* Penrose stairs — lucid dreaming */}
      <Doodle top="1980vh" side="left" offset="3vw" rotate={5}>
        <svg width="240" height="200" viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="20" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            penrose stair — lucid dream
          </text>
          {/* impossible triangle */}
          <path d="M70 160 L170 160 L150 130 L60 130 Z" />
          <path d="M150 130 L150 80  L70 80   L70 160" />
          <path d="M150 80  L170 60  L170 140 L150 130" />
          <path d="M70 80   L60 60   L160 60  L170 60" />
          <path d="M60 60   L60 130" />
          <path d="M160 60  L150 80" />
          <text x="6" y="194" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">always climbing.</text>
        </svg>
      </Doodle>
    </>
  )
}

export function PaperDecorations() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        // Below the millimeter grid (z-30) so stains sit on the
        // paper, not over the lines. Above content backgrounds
        // (z-20) so they read as part of the page.
        zIndex: 25,
        overflow: "hidden",
      }}
    >
      <CoffeeStains />
      <Doodles />
      <MarginStar top="20vh"    side="right" offset="6vw"  rotate={12}  size={16} opacity={0.45} />
      <MarginStar top="105vh"   side="left"  offset="6vw"  rotate={-22} size={13} opacity={0.5} />
      <MarginStar top="210vh"   side="right" offset="10vw" rotate={6}   size={15} opacity={0.45} />
      <MarginStar top="380vh"   side="left"  offset="10vw" rotate={32}  size={12} opacity={0.5} />
      <MarginStar top="490vh"   side="right" offset="6vw"  rotate={-9}  size={14} opacity={0.45} />
      <MarginStar top="720vh"   side="left"  offset="4vw"  rotate={18}  size={14} opacity={0.45} />
      <MarginStar top="930vh"   side="right" offset="4vw"  rotate={-14} size={13} opacity={0.45} />
      <MarginStar top="1140vh"  side="left"  offset="2vw"  rotate={26}  size={15} opacity={0.45} />
      <MarginStar top="1370vh"  side="right" offset="6vw"  rotate={-2}  size={12} opacity={0.45} />
      <MarginStar top="1620vh"  side="left"  offset="2vw"  rotate={11}  size={14} opacity={0.45} />
    </div>
  )
}
