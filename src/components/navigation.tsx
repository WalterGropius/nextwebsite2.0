"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "/landing", label: "about" },
  { href: "/portfolio-s", label: "work" },
  { href: "/reel", label: "reel" },
  { href: "/sketchfab", label: "3d" },
  { href: "mailto:zenbauhaus@gmail.com", label: "contact" },
]

const downloadLinks = [
  { href: "/cvBauer.html", label: "cv" },
  { href: "/artBauer.pdf", label: "art pdf" },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
        style={{
          padding: isScrolled ? "0.75rem 0" : "1.25rem 0",
          background: isScrolled ? "rgba(246, 246, 244, 0.78)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px) saturate(110%)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(110%)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-base transition-transform hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
            zenbauhaus
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                <span className="ink-underline-hover">{l.label}</span>
              </Link>
            ))}
            <span
              className="h-4 w-px"
              style={{ background: "var(--ink)", opacity: 0.3 }}
            />
            {downloadLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                download
                className="text-sm transition-opacity"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-muted)",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ink-icons flex h-10 w-10 items-center justify-center md:hidden"
            style={{ color: "var(--ink)" }}
            aria-label="toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Inked rule under nav once scrolled */}
        {isScrolled && (
          <div
            className="pointer-events-none absolute inset-x-6 bottom-0 opacity-30"
            style={{ color: "var(--ink)" }}
          >
            <div
              style={{
                height: 1.2,
                background: "currentColor",
                filter: "url(#ink-wobble)",
              }}
            />
          </div>
        )}
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-1 px-8 md:hidden"
            style={{ background: "rgba(246, 246, 244, 0.97)" }}
          >
            {navLinks.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 16 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                  delay: 0.05 + i * 0.06,
                }}
              >
                <Link
                  href={l.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-5xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink)",
                  }}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <div
              className="my-6 h-px w-32"
              style={{ background: "var(--ink)", opacity: 0.3 }}
            />
            {downloadLinks.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.05 + (navLinks.length + i) * 0.06,
                }}
              >
                <Link
                  href={l.href}
                  download
                  onClick={() => setIsOpen(false)}
                  className="block py-1 text-lg"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-muted)",
                  }}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
