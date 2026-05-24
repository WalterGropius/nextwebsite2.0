"use client"

interface InkLineProps {
  orientation?: "horizontal" | "vertical"
  className?: string
  color?: string
  thickness?: number
  fade?: boolean
  filter?: "soft" | "strong"
}

// Renders a wobbled rule. Uses a thin background div instead of an SVG
// stroke — sub-pixel SVG strokes plus a displacement-map filter render
// inconsistently across browsers, but a solid div with filter:url() is
// rock-solid and the displacement gives it the same hand-drawn quality.
export function InkLine({
  orientation = "horizontal",
  className = "",
  color = "currentColor",
  thickness = 1.6,
  fade = true,
  filter = "soft",
}: InkLineProps) {
  const filterId = filter === "strong" ? "ink-wobble-strong" : "ink-wobble"

  if (orientation === "vertical") {
    const fadeMask =
      "linear-gradient(180deg, transparent 0%, #000 20%, #000 80%, transparent 100%)"
    return (
      <div
        aria-hidden
        className={className}
        style={{
          width: thickness,
          height: "100%",
          background: color,
          filter: `url(#${filterId})`,
          WebkitMaskImage: fade ? fadeMask : undefined,
          maskImage: fade ? fadeMask : undefined,
          borderRadius: 9999,
        }}
      />
    )
  }

  const fadeMask =
    "linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)"
  return (
    <div
      aria-hidden
      className={className}
      style={{
        width: "100%",
        height: thickness,
        background: color,
        filter: `url(#${filterId})`,
        WebkitMaskImage: fade ? fadeMask : undefined,
        maskImage: fade ? fadeMask : undefined,
        borderRadius: 9999,
      }}
    />
  )
}
