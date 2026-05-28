import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Art',
  description:
    'Soubor fotek na cloudu — a Czech art book in fourteen series: surfaces, landscape, the weird, reflections, decay, light objects, skate requiems and more.',
  alternates: { canonical: '/art' },
  openGraph: {
    title: 'Art | zenbauhaus',
    description: 'A photographic art book in fourteen series — surfaces, landscape, the weird, decay, and more.',
    url: 'https://zenbauhaus.vercel.app/art',
  },
}

export default function ArtLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
