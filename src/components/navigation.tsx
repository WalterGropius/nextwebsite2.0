"use client"

import Link from "next/link"
import { Eye, Download, Mail, Image, Film, BookOpen, User } from "lucide-react"

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-[#272f3c] p-1 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold text-white">
          <Link href="/"><img src="/logo.png" alt="logo" width={64} height={64} className="rounded-full" /></Link>
        </div>
        <div className="flex items-center space-x-2 md:space-x-8">
          <Link
            href="/landing"
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><User size={18} /></span> About
          </Link>
          <Link
            href="/cvBauer.html"
            download
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><Download size={18} /></span> CV
          </Link>
          <Link
            href="/portfolio-s"
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><BookOpen size={18} /></span> Portfolio
          </Link>
          <Link
            href="/reel"
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><Film size={18} /></span> Reel
          </Link>
          <Link
            href="/sketchfab"
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><Image size={18} /></span> 3D
          </Link>
          <Link
            href="/artBauer.pdf"
            download
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><Download size={18} /></span> Art
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-1 md:ml-4 transition duration-300 text-white hover:font-bold"
          >
            <span className="hidden md:inline"><Mail size={18} /></span> Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
