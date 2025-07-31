import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: "zenbauhaus - Digital Garden",
  description: "Art & Tech Polymath. Lifelong learner driven by boundless curiosity. Building emergent worlds through creative technology.",
  keywords: ["AI", "VR", "Creative Technology", "Digital Art", "Innovation", "Web Development", "3D Graphics", "Interactive Design"],
  authors: [{ name: "zenbauhaus", url: "https://zenbauhaus.com" }],
  creator: "zenbauhaus",
  robots: "index, follow",
  openGraph: {
    title: "zenbauhaus - Digital Garden",
    description: "Art & Tech Polymath. Building Emergent Worlds.",
    type: "website",
    locale: "en_US",
    siteName: "zenbauhaus",
  },
  twitter: {
    card: "summary_large_image",
    title: "zenbauhaus - Digital Garden",
    description: "Art & Tech Polymath. Building Emergent Worlds.",
  },
  generator: 'Next.js',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fbbf24',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        data-landing="true"
        className={`${inter.variable} ${cormorant.variable} antialiased min-h-screen text-gray-100 font-sans`}
      >
        {children}

        {/* Performance monitoring script */}
        <Script id="performance-observer" strategy="afterInteractive">
          {`
            if ('PerformanceObserver' in window) {
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                  }
                }
              });
              observer.observe({entryTypes: ['largest-contentful-paint']});
            }
          `}
        </Script>
      </body>
    </html>
  )
}
