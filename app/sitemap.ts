import type { MetadataRoute } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'

const BASE = 'https://zenbauhaus.vercel.app'

// Read a JSON file out of /public at build time. Returns [] if the file
// is missing or malformed so the sitemap never breaks the build.
function readPublicJson<T>(file: string): T[] {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', file), 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = [
    '/landing',
    '/portfolio',
    '/portfolio-s',
    '/reel',
    '/sketchfab',
    '/art',
    '/cv',
    '/blog',
    '/more',
    '/contact',
    '/experiments/flow',
    '/boids',
    '/games/angles',
    '/games/proportion',
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/landing' ? 1 : 0.7,
  }))

  const work = readPublicJson<{ id: number | string }>('portfolio.json').map((p) => ({
    url: `${BASE}/work/${p.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  const posts = readPublicJson<{ id?: string }>('blogs.json')
    .filter((p) => p.id)
    .map((p) => ({
      url: `${BASE}/blog/${p.id}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }))

  const art = readPublicJson<{ id?: string }>('art.json')
    .filter((s) => s.id)
    .map((s) => ({
      url: `${BASE}/art/${s.id}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }))

  return [...staticRoutes, ...work, ...posts, ...art]
}
