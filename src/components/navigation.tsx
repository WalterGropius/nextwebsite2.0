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
  { href: "/cv", label: "cv" },
  { href: "/contact", label: "contact" },
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

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative text-base transition-transform hover:-translate-y-0.5"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                  fontWeight: 600,
                }}
              >
                <span className="ink-underline">{l.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-[60] flex h-10 w-10 items-center justify-center md:hidden"
            style={{ color: "var(--ink)" }}
            aria-label="toggle menu"
          >
            {isOpen ? (
              <X
                size={30}
                strokeWidth={2.6}
                style={{ filter: "url(#ink-wobble-strong)" }}
              />
            ) : (
              <Menu
                size={30}
                strokeWidth={2.6}
                style={{ filter: "url(#ink-wobble-strong)" }}
              />
            )}
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
            {/* Tiny aside — only the curious notice it */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="og-note mt-12"
            >
              skate. rap. ship.
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
