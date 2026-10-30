import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'More',
  description: 'Off the record: what I love, fight, fail at and keep — music, film, code, art, and what I am on right now.',
  alternates: { canonical: '/more' },
  openGraph: {
    title: 'More | zenbauhaus',
    description: 'Off the record: what I love, fight, fail at and keep.',
    url: 'https://zenbauhaus.vercel.app/more',
  },
}

export default function MoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
