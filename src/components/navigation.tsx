"use client"

import Link from "next/link"

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-[#272f3c] p-1 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold text-white">
          <Link href="/"><img src="/logo.png" alt="logo" width={64} height={64} className="rounded-full" /></Link>
        </div>
        <div className="space-x-4">
          <Link href="/landing" className="transition duration-300 text-white hover:font-bold">
            About
          </Link>
          <Link href="/cvBauer.html" download className="transition duration-300 text-white hover:font-bold">
            CV
          </Link>
          <Link href="/portfolio-s" className="transition duration-300 text-white hover:font-bold">
            Portfolio
          </Link>
          <Link href="/reel" className="transition duration-300 text-white hover:font-bold">
            Reel
          </Link>
          <Link href="/sketchfab" className="transition duration-300 text-white hover:font-bold">
            3D
          </Link>
          <Link href="/contact" className="transition duration-300 text-white hover:font-bold">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
