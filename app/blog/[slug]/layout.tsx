import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import { pick, type Localized } from '@/lib/i18n/localize'

type Post = {
  id: string
  title?: Localized
  excerpt?: Localized
}

function getPost(slug: string): Post | null {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'blogs.json'), 'utf8')
    const data = JSON.parse(raw) as Post[]
    return data.find((p) => p.id === slug) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) {
    return { title: 'Writing' }
  }
  const title = pick(post.title, 'en') || 'Writing'
  const description = pick(post.excerpt, 'en')
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${title} | zenbauhaus`,
      description,
      url: `https://zenbauhaus.vercel.app/blog/${slug}`,
      type: 'article',
    },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
