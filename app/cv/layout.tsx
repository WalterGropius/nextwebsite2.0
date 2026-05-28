import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CV',
  description: 'Curriculum vitae — experience, capabilities, education, and speaking of a CTO & creative technologist.',
  alternates: { canonical: '/cv' },
  openGraph: {
    title: 'CV | zenbauhaus',
    description: 'Experience, capabilities, education, and speaking.',
    url: 'https://zenbauhaus.vercel.app/cv',
  },
}

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
