"use client"

import { LucideIcon } from "lucide-react"

interface SectionHeaderProps {
  icon: LucideIcon
  title: React.ReactNode
  kicker: string
  color: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeader({
  icon: Icon,
  title,
  kicker,
  color,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const justify = align === "center" ? "justify-center" : "justify-start"
  const textAlign = align === "center" ? "text-center" : "text-left"

  return (
    <div className={`flex items-start gap-4 ${justify} ${className}`}>
      <div
        className="icon-chip h-12 w-12 shrink-0 p-0"
        style={{ color }}
      >
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <div className={`flex flex-col gap-1 ${textAlign}`}>
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl leading-[0.95]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.28em]"
          style={{ color }}
        >
          {kicker}
        </span>
      </div>
    </div>
  )
}
