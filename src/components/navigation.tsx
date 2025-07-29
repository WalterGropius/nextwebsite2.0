"use client"

import Link from "next/link"

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white p-1 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold text-black">
          <Link href="/">zenbauhaus</Link>
        </div>
        <div className="space-x-4">
          <Link href="#manifesto" className="transition duration-300 text-black hover:font-bold">
            Philosophy
          </Link>
          <Link href="#creations" className="transition duration-300 text-black hover:font-bold">
            Creations
          </Link>
          <Link href="#arsenal" className="transition duration-300 text-black hover:font-bold">
            Arsenal
          </Link>
          <Link href="#contact" className="transition duration-300 text-black hover:font-bold">
            Collaborate
          </Link>
        </div>
      </div>
    </nav>
  )
}
