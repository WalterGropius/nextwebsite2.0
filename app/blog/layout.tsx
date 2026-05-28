import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on building Sombra OS, creative technology, methodology, and the polymath problem.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Writing | zenbauhaus',
    description: 'Notes on creative technology, methodology, and the polymath problem.',
    url: 'https://zenbauhaus.vercel.app/blog',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
