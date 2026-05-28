import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Selected work across VR/AR, 3D, creative technology, graphic design, and web.',
  alternates: { canonical: '/portfolio' },
  openGraph: {
    title: 'Portfolio | zenbauhaus',
    description: 'Selected work across VR/AR, 3D, creative technology, and design.',
    url: 'https://zenbauhaus.vercel.app/portfolio',
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
