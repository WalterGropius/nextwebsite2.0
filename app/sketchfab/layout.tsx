import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '3D Models',
  description: 'Interactive 3D models and Gaussian splats — sculpture, scans, and real-time experiments on Sketchfab.',
  alternates: { canonical: '/sketchfab' },
  openGraph: {
    title: '3D Models | zenbauhaus',
    description: 'Interactive 3D models and Gaussian splats on Sketchfab.',
    url: 'https://zenbauhaus.vercel.app/sketchfab',
  },
}

export default function SketchfabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
