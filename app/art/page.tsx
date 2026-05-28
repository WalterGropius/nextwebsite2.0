import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { InkLine } from '@/components/ink-line'

export const metadata: Metadata = {
  title: 'Art',
  description:
    'A portfolio of paintings, prints and physical work — collected as a single book. Plus interactive 3D, motion, and the full project archive.',
  alternates: { canonical: '/art' },
  openGraph: {
    title: 'Art | zenbauhaus',
    description: 'Paintings, prints and physical work, collected as a book.',
    url: 'https://zenbauhaus.vercel.app/art',
  },
}

const ELSEWHERE = [
  {
    href: '/sketchfab',
    label: '3d models',
    blurb: 'sculpture scans, gaussian splats and real-time experiments you can spin.',
  },
  {
    href: '/reel',
    label: 'showreel',
    blurb: 'vfx, 3d and creative-technology motion work, cut to music.',
  },
  {
    href: '/portfolio',
    label: 'portfolio',
    blurb: 'the full archive — design, code, installations and the rest.',
  },
]

export default function Art() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-dark)' }}>
      <Navigation />

      <section className="section-container pb-12 pt-28 sm:pt-32">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1
            className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.9]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            <span className="ink-underline">art</span>
          </h1>
          <p
            className="max-w-md text-base"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
          >
            paintings, prints and physical work — collected as one book. flip through
            it below, or grab the pdf.
          </p>
        </header>

        <div className="mb-6" style={{ color: 'var(--ink)', opacity: 0.6 }}>
          <InkLine fade={false} thickness={1.2} />
        </div>

        {/* The book itself — an inked frame around the embedded PDF. */}
        <div
          className="relative mx-auto w-full overflow-hidden"
          style={{ border: '1.5px solid var(--ink)', filter: 'url(#ink-wobble)', zIndex: 35 }}
        >
          <iframe
            src="/artBauer.pdf"
            title="Art book — paintings, prints and physical work"
            loading="lazy"
            className="block w-full"
            style={{ height: '78vh', background: 'var(--surface-dark)' }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <a href="/artBauer.pdf" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <span>open the pdf</span>
            <span aria-hidden>↗</span>
          </a>
          <a href="/artBauer.pdf" download className="btn-secondary">
            <span>download</span>
            <span aria-hidden>↓</span>
          </a>
        </div>
      </section>

      {/* Cross-links so the page is a hub, not a dead end. */}
      <section className="section-container pb-24">
        <h2
          className="mb-6 text-2xl sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
        >
          elsewhere
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {ELSEWHERE.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group block p-5 transition-colors"
              style={{ border: '1.5px solid var(--ink)', filter: 'url(#ink-wobble)' }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3
                  className="text-xl sm:text-2xl"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', lineHeight: 1 }}
                >
                  {item.label}
                </h3>
                <span aria-hidden style={{ color: 'var(--ink)' }}>
                  →
                </span>
              </div>
              <p
                className="mt-3 text-sm"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
              >
                {item.blurb}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
