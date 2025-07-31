"use client"

import Link from "next/link"

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-[#272f3c] p-1 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold text-white">
          <Link href="/">zenbauhaus</Link>
        </div>
        <div className="space-x-4">
          <Link href="#manifesto" className="transition duration-300 text-white hover:font-bold">
            Manifesto
          </Link>
          <Link href="#creations" className="transition duration-300 text-white hover:font-bold">
            Creations
          </Link>
          <Link href="#contact" className="transition duration-300 text-white hover:font-bold">
            Collaborate
          </Link>
        </div>
      </div>
    </nav>
  )
}
