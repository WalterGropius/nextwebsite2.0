"use client"

// PaperDecorations — tasteful clutter scattered down the page so it
// reads like a working notebook: a few coffee-stain pngs at low
// opacity and a handful of hand-sketched math/physics/cs doodles.
// Everything is pointer-events:none and absolutely positioned, so
// the marks never interfere with the layout — they just live in the
// margins of whatever's underneath.
//
// Items are placed at predetermined vh offsets so they spread across
// the entire scrollable surface rather than crowding the hero. Each
// is also randomly rotated for a "tossed onto the desk" feel.

const COFFEE_STAINS: Array<{
  src: string
  top: string
  side: "left" | "right"
  offset: string
  size: number
  rotate: number
  opacity: number
}> = [
  { src: "/coffee2.png", top: "82vh",  side: "right", offset: "-3vw",  size: 280, rotate: -14, opacity: 0.22 },
  { src: "/coffee1.png", top: "180vh", side: "left",  offset: "-4vw",  size: 340, rotate: 22,  opacity: 0.18 },
  { src: "/coffee4.png", top: "295vh", side: "right", offset: "2vw",   size: 240, rotate: -38, opacity: 0.2  },
  { src: "/coffee3.png", top: "420vh", side: "left",  offset: "8vw",   size: 200, rotate: 9,   opacity: 0.16 },
  { src: "/coffee1.png", top: "560vh", side: "right", offset: "-2vw",  size: 300, rotate: 47,  opacity: 0.19 },
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
            // Slight saturation drop so the stain reads as old coffee
            // rather than bright modern paint.
            filter: "saturate(0.75) contrast(1.05)",
            userSelect: "none",
          }}
        />
      ))}
    </>
  )
}

// Each doodle is its own SVG — handwritten math/physics/cs sketches.
// Drawn with currentColor and the ink-wobble filter so they pick up
// the page's ink theme and look hand-laid.

type DoodleProps = {
  top: string
  side: "left" | "right"
  offset: string
  rotate: number
  scale?: number
  opacity?: number
  children: React.ReactNode
}

function Doodle({ top, side, offset, rotate, scale = 1, opacity = 0.55, children }: DoodleProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top,
        [side]: offset,
        transform: `rotate(${rotate}deg) scale(${scale})`,
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

// Tiny "* sketched in the margin" star, useful for sprinkling
// elegance between the heavier doodles.
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
      {/* Euler's identity — handwritten near the top */}
      <Doodle top="55vh" side="left" offset="3vw" rotate={-5} scale={1.05}>
        <svg width="180" height="80" viewBox="0 0 180 80" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="36" fontFamily="var(--font-display)" fontSize="22" fill="currentColor" stroke="none">
            e<tspan baselineShift="super" fontSize="14">iπ</tspan> + 1 = 0
          </text>
          <text x="6" y="62" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none" opacity="0.6">
            * the most beautiful eq.
          </text>
          <path d="M5 70 Q 90 76, 175 70" strokeWidth="1.1" opacity="0.7" />
        </svg>
      </Doodle>

      {/* Wave function sketch */}
      <Doodle top="135vh" side="right" offset="2vw" rotate={6}>
        <svg width="190" height="100" viewBox="0 0 190 100" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            ψ(x, t)
          </text>
          {/* axis */}
          <path d="M10 60 L180 60" />
          <path d="M22 22 L22 92" />
          {/* sine */}
          <path d="M22 60 Q 40 18, 60 60 T 100 60 T 140 60 T 178 60" strokeWidth="1.5" />
          {/* damp envelope */}
          <path d="M22 30 Q 100 50, 178 58" strokeDasharray="3 3" opacity="0.6" />
          <text x="148" y="84" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">x →</text>
        </svg>
      </Doodle>

      {/* Big O graph */}
      <Doodle top="240vh" side="left" offset="2vw" rotate={-4}>
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="18" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            big O
          </text>
          {/* axis */}
          <path d="M22 100 L170 100" />
          <path d="M22 18 L22 100" />
          {/* O(n) */}
          <path d="M22 100 L165 25" />
          <text x="150" y="20" fontFamily="var(--font-display)" fontSize="9" fill="currentColor" stroke="none">n</text>
          {/* O(log n) */}
          <path d="M22 100 Q 60 70, 165 60" />
          <text x="148" y="55" fontFamily="var(--font-display)" fontSize="9" fill="currentColor" stroke="none">log n</text>
          {/* O(n²) */}
          <path d="M22 100 Q 80 100, 120 20" />
          <text x="125" y="20" fontFamily="var(--font-display)" fontSize="9" fill="currentColor" stroke="none">n²</text>
        </svg>
      </Doodle>

      {/* Maxwell - one of */}
      <Doodle top="340vh" side="right" offset="4vw" rotate={-7}>
        <svg width="200" height="80" viewBox="0 0 200 80" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="32" fontFamily="var(--font-display)" fontSize="20" fill="currentColor" stroke="none">
            ∇ × E = − ∂B/∂t
          </text>
          <text x="6" y="56" fontFamily="var(--font-display)" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">
            faraday — fields like to whirl
          </text>
          <path d="M0 70 Q100 76, 200 68" strokeWidth="0.9" opacity="0.7" />
        </svg>
      </Doodle>

      {/* φ — golden ratio with spiral */}
      <Doodle top="450vh" side="left" offset="4vw" rotate={5}>
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="22" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            φ ≈ 1.6180339…
          </text>
          {/* fibonacci-style spiral */}
          <path d="M120 100 Q 120 60, 80 60 Q 50 60, 50 90 Q 50 110, 70 110 Q 82 110, 82 100" />
          <rect x="50"  y="60"  width="70" height="50" />
          <rect x="50"  y="60"  width="32" height="50" />
          <rect x="82"  y="78"  width="20" height="32" />
          <rect x="102" y="86"  width="14" height="20" />
        </svg>
      </Doodle>

      {/* Graph / nodes — CS doodle */}
      <Doodle top="540vh" side="right" offset="3vw" rotate={-3}>
        <svg width="170" height="110" viewBox="0 0 170 110" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <text x="6" y="18" fontFamily="var(--font-display)" fontSize="13" fill="currentColor" stroke="none">
            dfs(g, v)
          </text>
          {/* edges */}
          <path d="M30 55 L80 30" />
          <path d="M30 55 L80 80" />
          <path d="M80 30 L140 50" />
          <path d="M80 80 L140 90" />
          <path d="M140 50 L140 90" />
          {/* nodes */}
          <circle cx="30"  cy="55" r="9" fill="var(--paper, #f6f6f4)" />
          <circle cx="80"  cy="30" r="9" fill="var(--paper, #f6f6f4)" />
          <circle cx="80"  cy="80" r="9" fill="var(--paper, #f6f6f4)" />
          <circle cx="140" cy="50" r="9" fill="var(--paper, #f6f6f4)" />
          <circle cx="140" cy="90" r="9" fill="var(--paper, #f6f6f4)" />
          <text x="27"  y="59" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">a</text>
          <text x="77"  y="34" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">b</text>
          <text x="77"  y="84" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">c</text>
          <text x="137" y="54" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">d</text>
          <text x="137" y="94" fontFamily="var(--font-display)" fontSize="11" fill="currentColor" stroke="none">e</text>
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
        // Below the millimeter grid (z-30) so stains sit on the paper,
        // not over the lines. Above content backgrounds (z-20) so they
        // read as part of the page.
        zIndex: 25,
        overflow: "hidden",
      }}
    >
      <CoffeeStains />
      <Doodles />
      {/* a few elegant little stars sprinkled in the margins */}
      <MarginStar top="20vh"  side="right" offset="6vw"  rotate={12}  size={14} opacity={0.4} />
      <MarginStar top="105vh" side="left"  offset="6vw"  rotate={-22} size={11} opacity={0.45} />
      <MarginStar top="210vh" side="right" offset="10vw" rotate={6}   size={13} opacity={0.4} />
      <MarginStar top="380vh" side="left"  offset="10vw" rotate={32}  size={10} opacity={0.45} />
      <MarginStar top="490vh" side="right" offset="6vw"  rotate={-9}  size={12} opacity={0.4} />
    </div>
  )
}
