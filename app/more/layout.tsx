import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'More',
  description: 'The human behind the work — stuff I love: aesthetics, music, film, code, and what I am into now.',
  alternates: { canonical: '/more' },
  openGraph: {
    title: 'More | zenbauhaus',
    description: 'Stuff I love: aesthetics, music, film, code, and what I am into now.',
    url: 'https://zenbauhaus.vercel.app/more',
  },
}

export default function MoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
