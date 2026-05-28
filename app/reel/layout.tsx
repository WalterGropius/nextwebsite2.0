import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Showreel',
  description: 'VFX, 3D and creative-technology motion work — a selected reel of moving image.',
  alternates: { canonical: '/reel' },
  openGraph: {
    title: 'Showreel | zenbauhaus',
    description: 'VFX, 3D and creative-technology motion work.',
    url: 'https://zenbauhaus.vercel.app/reel',
  },
}

export default function ReelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
