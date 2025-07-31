import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"

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
    <>
      <div
        data-landing="true"
        className="antialiased min-h-screen font-sans"
        style={{ color: 'var(--thistle)' }}
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
      </div>
    </>
  )
}
