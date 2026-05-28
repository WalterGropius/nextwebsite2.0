import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'

type Post = {
  id: string
  title?: string
  excerpt?: string
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
  return {
    title: post.title ?? 'Writing',
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title ?? 'Writing'} | zenbauhaus`,
      description: post.excerpt,
      url: `https://zenbauhaus.vercel.app/blog/${slug}`,
      type: 'article',
    },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
