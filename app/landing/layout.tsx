import type React from "react"
import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  title: "Eliáš Bauer - Digital Garden",
  description: "Art & Tech Polymath. Building Emergent Worlds.",
  keywords: ["AI", "VR", "Creative Technology", "Digital Art", "Innovation"],
  authors: [{ name: "Eliáš Bauer" }],
  openGraph: {
    title: "Eliáš Bauer - Digital Garden",
    description: "Art & Tech Polymath. Building Emergent Worlds.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
