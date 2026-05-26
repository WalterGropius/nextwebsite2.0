"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { useT } from "@/lib/i18n/provider"
import { LangThemeSwitcher } from "./lang-theme-switcher"

// "o mně" lives at /landing, which is already the brand-mark
// destination — keeping it as a separate link is redundant.
const navLinks = [
  { href: "/portfolio-s", key: "nav.work" },
  { href: "/reel", key: "nav.reel" },
  { href: "/sketchfab", key: "nav.3d" },
  { href: "/cv", key: "nav.cv" },
  { href: "/contact", key: "nav.contact" },
]


export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const t = useT()
  const pathname = usePathname()
  // The hero on /landing has three CTAs. We hide the desktop nav
  // links until those CTAs scroll out of view so the hero reads
  // as the single decision surface. Other pages always show links.
  const isLanding = pathname === "/landing" || pathname === "/"

  const roles = [
    t("hero.role.0"),
    t("hero.role.1"),
    t("hero.role.2"),
    t("hero.role.3"),
    t("hero.role.4"),
  ]
  const [roleIdx, setRoleIdx] = useState(0)
  useEffect(() => {
    const i = setInterval(
      () => setRoleIdx((n) => (n + 1) % roles.length),
      2400,
    )
    return () => clearInterval(i)
  }, [roles.length])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 40)
      // ~70% of the viewport — enough that hero CTAs are off-screen
      setPastHero(y > window.innerHeight * 0.7)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const showLinks = !isLanding || pastHero

  return (
    <>
      <nav
        // z-[60] so the bar (and its close X) always sits above the
        // mobile menu overlay (z-[55]) and the landing hero (z-40).
        className="fixed inset-x-0 top-0 z-[60] transition-all duration-500"
        style={{
          padding: isScrolled ? "0.75rem 0" : "1.25rem 0",
          background: isScrolled
            ? "color-mix(in srgb, var(--surface-dark) 78%, transparent)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(20px) saturate(110%)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(110%)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 flex-1 items-baseline gap-3">
            <Link
              href="/"
              className="shrink-0 text-base transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                fontWeight: 600,
              }}
            >
              zenbauhaus
            </Link>
            {/* Cycling role — hand-written aside next to the wordmark.
                Shrinks into the available space between the logo and
                the nav links, with a soft fade-out mask on the trailing
                edge so a long role just clips gracefully. */}
            <div
              className="relative hidden h-[1.2em] min-w-0 flex-1 items-center overflow-hidden text-xs sm:flex sm:text-sm"
              aria-live="polite"
              style={{
                WebkitMaskImage:
                  "linear-gradient(90deg, #000 0, #000 calc(100% - 28px), transparent 100%)",
                maskImage:
                  "linear-gradient(90deg, #000 0, #000 calc(100% - 28px), transparent 100%)",
              }}
            >
              <span
                aria-hidden
                className="mr-2 select-none"
                style={{ color: "var(--ink)", opacity: 0.35 }}
              >
                *
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={roleIdx}
                  initial={{ y: "110%", opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-110%", opacity: 0, filter: "blur(6px)" }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  className="inline-block whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink)",
                    letterSpacing: "0.12em",
                    opacity: 0.7,
                  }}
                >
                  {roles[roleIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* gap-4 is shared with the icon switcher inside
              LangThemeSwitcher so the rhythm between every right-side
              element is the same. On /landing the links are hidden
              until the user scrolls past the hero CTAs — they fade
              in to the left of the always-visible switcher. */}
          <div className="hidden items-center gap-4 md:flex">
            <AnimatePresence initial={false}>
              {showLinks && (
                <motion.div
                  key="nav-links"
                  initial={{ opacity: 0, x: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 12, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4"
                >
                  {navLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="relative text-base transition-transform hover:-translate-y-0.5"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                        fontWeight: 600,
                      }}
                    >
                      {t(l.key)}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <LangThemeSwitcher />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <LangThemeSwitcher compact />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-[60] flex h-10 w-10 items-center justify-center"
              style={{ color: "var(--ink)" }}
              aria-label={t("nav.toggleMenu")}
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
            // z-[55] — above the landing-page hero (z-40), but below
            // the fixed <nav> bar itself (z-50) so the close (X)
            // button on top stays clickable.
            className="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-1 px-8 md:hidden"
            style={{
              background:
                "color-mix(in srgb, var(--surface-dark) 97%, transparent)",
            }}
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
                  {t(l.key)}
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
              {t("nav.mobile.easter")}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
