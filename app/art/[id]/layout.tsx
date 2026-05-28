import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import { pick, type Localized } from '@/lib/i18n/localize'

type Series = { id: string; title?: Localized; statement?: Localized; cover?: string }

function getSeries(id: string): Series | null {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'art.json'), 'utf8')
    const data = JSON.parse(raw) as Series[]
    return data.find((s) => s.id === id) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const s = getSeries(id)
  if (!s) return { title: 'Art' }
  const title = pick(s.title, 'en')
  const description = pick(s.statement, 'en').slice(0, 200)
  const image = s.cover ?? '/icons/share.png'
  return {
    title: `${title} · Art`,
    description,
    alternates: { canonical: `/art/${id}` },
    openGraph: {
      title: `${title} · Art | zenbauhaus`,
      description,
      url: `https://zenbauhaus.vercel.app/art/${id}`,
      images: [{ url: image }],
    },
  }
}

export default function ArtSeriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
