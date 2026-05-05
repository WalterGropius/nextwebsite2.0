import type { Metadata, Viewport } from 'next'
import { Layout } from '@/components/dom/Layout'
import '@/global.css'

export const metadata: Metadata = {
  title: 'Eliáš Bauer | Art & Tech Polymath',
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
  authors: [{ name: 'Eliáš Bauer', url: 'https://zenbauhaus.vercel.app' }],
  creator: 'Eliáš Bauer',
  robots: 'index, follow',
  openGraph: {
    title: 'Eliáš Bauer | Art & Tech Polymath',
    description: 'CTO & Creative Technologist bridging creative vision and technical execution',
    type: 'website',
    locale: 'en_US',
    siteName: 'zenbauhaus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eliáš Bauer | Art & Tech Polymath',
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
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="fetch" href="/flowers_white.sog" crossOrigin="anonymous" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
