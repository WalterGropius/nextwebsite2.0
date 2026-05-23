"use client"

interface InkLineProps {
  orientation?: "horizontal" | "vertical"
  className?: string
  color?: string
  thickness?: number
  fade?: boolean
  filter?: "soft" | "strong"
}

export function InkLine({
  orientation = "horizontal",
  className = "",
  color = "var(--ink)",
  thickness = 1.4,
  fade = true,
  filter = "soft",
}: InkLineProps) {
  const filterId = filter === "strong" ? "ink-wobble-strong" : "ink-wobble"

  if (orientation === "vertical") {
    return (
      <svg
        aria-hidden
        className={className}
        preserveAspectRatio="none"
        viewBox="0 0 4 100"
        style={{ display: "block", width: thickness * 2, height: "100%" }}
      >
        <defs>
          {fade && (
            <linearGradient id={`vfade-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="20%" stopColor={color} stopOpacity="1" />
              <stop offset="80%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          )}
        </defs>
        <line
          x1="2"
          y1="0"
          x2="2"
          y2="100"
          stroke={fade ? `url(#vfade-${filterId})` : color}
          strokeWidth={thickness}
          strokeLinecap="round"
          filter={`url(#${filterId})`}
        />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden
      className={className}
      preserveAspectRatio="none"
      viewBox="0 0 1000 6"
      style={{ display: "block", width: "100%", height: thickness * 3 }}
    >
      <defs>
        {fade && (
          <linearGradient id={`hfade-${filterId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="15%" stopColor={color} stopOpacity="1" />
            <stop offset="85%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        )}
      </defs>
      <line
        x1="0"
        y1="3"
        x2="1000"
        y2="3"
        stroke={fade ? `url(#hfade-${filterId})` : color}
        strokeWidth={thickness}
        strokeLinecap="round"
        filter={`url(#${filterId})`}
      />
    </svg>
  )
}
