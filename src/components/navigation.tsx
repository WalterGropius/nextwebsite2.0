"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Download, Mail, Briefcase, Film, Box, Palette, User, ExternalLink } from "lucide-react"

const navLinks = [
  { href: "/landing", label: "About", icon: User },
  { href: "/portfolio-s", label: "Portfolio", icon: Briefcase },
  { href: "/reel", label: "Reel", icon: Film },
  { href: "/sketchfab", label: "3D", icon: Box },
  { href: "/contact", label: "Contact", icon: Mail },
]

const downloadLinks = [
  { href: "/cvBauer.html", label: "CV", icon: Download },
  { href: "/artBauer.pdf", label: "Art PDF", icon: Palette },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-3"
            : "py-5"
        }`}
        style={{
          background: isScrolled
            ? "rgba(247, 245, 240, 0.85)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled ? "1px solid var(--border-subtle)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white transition-all duration-300 group-hover:shadow-lg"
              style={{ 
                background: "var(--gradient-primary)",
                boxShadow: "0 0 20px -5px var(--accent-glow)"
              }}
            >
              EB
            </div>
            <span className="hidden font-semibold text-white sm:block" style={{ fontFamily: "var(--font-display)" }}>
              Eliáš Bauer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                <span className="relative z-10">{link.label}</span>
                <span 
                  className="absolute inset-0 scale-90 rounded-lg opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                  style={{ background: "var(--surface-glass)" }}
                />
              </Link>
            ))}
            
            {/* Divider */}
            <div className="mx-2 h-5 w-px" style={{ background: "var(--border-subtle)" }} />
            
            {/* Download links */}
            {downloadLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                download
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                <Download size={14} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors md:hidden"
            style={{ background: "var(--surface-glass)" }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{ background: "rgba(247, 245, 240, 0.98)" }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-2 p-8">
          {navLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 rounded-xl px-8 py-4 text-2xl font-semibold text-white transition-all hover:scale-105 ${
                isMobileMenuOpen ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ 
                animationDelay: `${idx * 0.1}s`,
                fontFamily: "var(--font-display)"
              }}
            >
              <link.icon size={24} style={{ color: "var(--vista-blue)" }} />
              {link.label}
            </Link>
          ))}
          
          <div 
            className="my-4 h-px w-32"
            style={{ background: "var(--border-subtle)" }}
          />
          
          {downloadLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              download
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-lg text-gray-400 transition-all hover:text-white ${
                isMobileMenuOpen ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(navLinks.length + idx) * 0.1}s` }}
            >
              <Download size={18} />
              Download {link.label}
            </Link>
          ))}

          {/* Social links in mobile menu */}
          <div 
            className={`mt-8 flex gap-4 ${isMobileMenuOpen ? "animate-fade-in animation-delay-700" : "opacity-0"}`}
          >
            <a 
              href="https://github.com/WalterGropius"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-white"
              style={{ background: "var(--surface-glass)" }}
            >
              <ExternalLink size={20} />
            </a>
            <a 
              href="https://linkedin.com/in/zenbauhaus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-white"
              style={{ background: "var(--surface-glass)" }}
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
