import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import { pick, type Localized } from '@/lib/i18n/localize'

type Project = {
  id: number | string
  title?: Localized
  description?: Localized
  image?: string
}

function getProject(id: string): Project | null {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'portfolio.json'), 'utf8')
    const data = JSON.parse(raw) as Project[]
    return data.find((p) => String(p.id) === id) ?? null
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
  const project = getProject(id)
  if (!project) {
    return { title: 'Work' }
  }
  const title = pick(project.title, 'en') || 'Work'
  const description = pick(project.description, 'en').slice(0, 200)
  const image = project.image ?? '/icons/share.png'
  return {
    title,
    description,
    alternates: { canonical: `/work/${id}` },
    openGraph: {
      title: `${title} | zenbauhaus`,
      description,
      url: `https://zenbauhaus.vercel.app/work/${id}`,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | zenbauhaus`,
      description,
      images: [image],
    },
  }
}

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
