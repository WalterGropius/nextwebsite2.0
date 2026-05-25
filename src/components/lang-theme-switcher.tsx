"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Globe, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useI18n } from "@/lib/i18n/provider"

export function LangThemeSwitcher({
  compact = false,
}: {
  compact?: boolean
}) {
  const { lang, setLang, t, supported } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const next = isDark ? "light" : "dark"
  const themeLabel = t(isDark ? "nav.toggleTheme.light" : "nav.toggleTheme.dark")

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center gap-2"
      style={{ color: "var(--ink)" }}
    >
      {/* Theme toggle */}
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={themeLabel}
        title={themeLabel}
        className="flex h-9 w-9 items-center justify-center transition-transform hover:-translate-y-0.5"
        style={{ color: "var(--ink)" }}
      >
        {mounted && isDark ? (
          <Sun size={compact ? 18 : 20} strokeWidth={2.2} style={{ filter: "url(#ink-wobble)" }} />
        ) : (
          <Moon size={compact ? 18 : 20} strokeWidth={2.2} style={{ filter: "url(#ink-wobble)" }} />
        )}
      </button>

      {/* Language menu trigger — globe icon alone, no code label */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("nav.language")} (${lang.toUpperCase()})`}
        title={t("nav.language")}
        className="flex h-9 w-9 items-center justify-center transition-transform hover:-translate-y-0.5"
        style={{ color: "var(--ink)" }}
      >
        <Globe
          size={compact ? 18 : 20}
          strokeWidth={2.2}
          style={{ filter: "url(#ink-wobble)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(8px)" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-[80] mt-3 min-w-[15rem] max-h-[70vh] overflow-auto"
            style={{
              background: "var(--surface-elevated)",
              border: "1.5px solid var(--ink)",
              borderRadius: "0.75rem",
              filter: "url(#ink-wobble)",
              padding: "0.5rem",
            }}
            role="listbox"
            aria-label={t("nav.language")}
          >
            {supported.map((opt) => {
              const active = opt.code === lang
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(opt.code)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-black/5"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink)",
                    background: active ? "rgba(15, 17, 23, 0.08)" : "transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {active && (
                      <Check
                        size={13}
                        strokeWidth={2.6}
                        style={{ filter: "url(#ink-wobble)" }}
                      />
                    )}
                    <span style={{ fontWeight: active ? 700 : 500 }}>
                      {opt.label}
                    </span>
                  </span>
                  <span
                    className="text-[0.6rem] uppercase tracking-[0.3em]"
                    style={{
                      color: opt.native ? "var(--ink)" : "var(--text-muted)",
                      opacity: opt.native ? 0.7 : 0.5,
                    }}
                  >
                    {opt.code}
                    {!opt.native ? " * auto" : ""}
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
