import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Layout } from '@/components/dom/Layout'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/lib/i18n/provider'
import { PaperBackdrop } from '@/components/paper-backdrop'
import { PaperDecorations } from '@/components/paper-decorations'
import '@/global.css'

// Fallback fonts for glyphs Zenhand doesn't carry (diacritics, non-latin).
// Served through next/font so they're self-hosted, subset, and never
// render-blocking — this replaced a synchronous Google Fonts @import in
// global.css that stalled first paint on slow connections.
// preload: false — these two only ever paint glyphs Zenhand is missing
// (some diacritics, non-latin scripts), so for most visitors they are
// never used at all. Preloading them pushed ten woff2 fetches ahead of
// the hero splat; lazy per-face loading costs nothing on the common path.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
})
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://zenbauhaus.vercel.app'),
  title: {
    default: 'zenbauhaus | Art & Tech Polymath',
    template: '%s | zenbauhaus',
  },
  description:
    'Eliáš Bauer — autodidact creative technologist in Prague. I build systems, untangle messy problems, and write code: VR/AR, real-time 3D, AI, and the occasional impossible thing.',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/icons/favicon.ico',
  },
  keywords: [
    'creative technology',
    'VR development',
    'AR development',
    'AI solutions',
    'full-stack developer',
    'CTO',
    'Three.js',
    'React Three Fiber',
    'WebGPU',
    'Unreal Engine',
    'digital art',
    'web development',
    '3D graphics',
    'innovation',
    'Prague',
  ],
  authors: [{ name: 'zenbauhaus', url: 'https://zenbauhaus.vercel.app' }],
  creator: 'zenbauhaus',
  robots: 'index, follow',
  openGraph: {
    title: 'zenbauhaus | Art & Tech Polymath',
    description:
      'Eliáš Bauer — autodidact creative technologist in Prague. Systems, messy problems, code.',
    type: 'website',
    locale: 'en_US',
    siteName: 'zenbauhaus',
    url: 'https://zenbauhaus.vercel.app',
    images: [{ url: '/icons/share.png', width: 800, height: 800, alt: 'zenbauhaus' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zenbauhaus | Art & Tech Polymath',
    description:
      'Eliáš Bauer — autodidact creative technologist in Prague. Systems, messy problems, code.',
    images: ['/icons/share.png'],
  },
  generator: 'Next.js',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f1117',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`antialiased ${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* The 4MB splat preload lives in app/landing/layout.tsx — it's
            only needed there; preloading it from the root layout made
            every route pay for it. */}
        <link rel="preload" as="font" type="font/woff2" href="/zenhand4.woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {/* SVG filter sprite — referenced via filter: url(#ink-wobble) on
            elements that want a hand-drawn edge */}
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <defs>
            <filter id="ink-wobble" x="-4%" y="-50%" width="108%" height="200%">
              <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="ink-wobble-strong" x="-6%" y="-50%" width="112%" height="200%">
              <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* Heavier wobble for photos — larger displacement at a
                lower base frequency so the edges read as torn/inked
                paper rather than vector-clean rectangles. */}
            <filter id="ink-wobble-photo" x="-8%" y="-8%" width="116%" height="116%">
              <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="11" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <PaperBackdrop />
            <PaperDecorations />
            <Layout>{children}</Layout>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
