import type { Metadata, Viewport } from 'next'
import { Layout } from '@/components/dom/Layout'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/lib/i18n/provider'
import { PaperBackdrop } from '@/components/paper-backdrop'
import '@/global.css'

export const metadata: Metadata = {
  title: 'zenbauhaus | Art & Tech Polymath',
  description: 'CTO & Creative Technologist bridging creative vision and technical execution. Specializing in VR/AR, AI systems, and cutting-edge web development.',
  keywords: [
    'creative technology',
    'VR development',
    'AR development',
    'AI solutions',
    'full-stack developer',
    'CTO',
    'Three.js',
    'React Three Fiber',
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
    description: 'CTO & Creative Technologist bridging creative vision and technical execution',
    type: 'website',
    locale: 'en_US',
    siteName: 'zenbauhaus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zenbauhaus | Art & Tech Polymath',
    description: 'CTO & Creative Technologist bridging creative vision and technical execution',
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
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="fetch" href="/flowers_white.sog" crossOrigin="anonymous" />
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
            <Layout>{children}</Layout>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
