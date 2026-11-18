// Finds a freely licensed photo on Wikimedia Commons for a search query,
// preferring public domain / CC0. Runs in the browser (CORS via origin=*),
// cached in localStorage so each term is looked up once.

export type Pic = { url: string; page: string; license: string; author: string }
const KEY = "kviz-img-v1"
let cache: Record<string, Pic | null> = {}
try { cache = JSON.parse(localStorage.getItem(KEY) || "{}") } catch {}

const strip = (s = "") => s.replace(/<[^>]+>/g, "").trim()

async function api(host: string, params: Record<string, string>) {
  const u = new URL(`https://${host}/w/api.php`)
  Object.entries({ format: "json", origin: "*", ...params }).forEach(([k, v]) => u.searchParams.set(k, v))
  return (await fetch(u)).json()
}

const toPic = (p: any): Pic | null => {
  const ii = p?.imageinfo?.[0]; const m = ii?.extmetadata ?? {}
  return ii ? {
    url: ii.thumburl || ii.url, page: ii.descriptionurl,
    license: strip(m.LicenseShortName?.value) || "free license", author: strip(m.Artist?.value).slice(0, 80),
  } : null
}
const INFO = { prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "640" }

// 1) the lead photo of the Wikipedia article — editors pick it to identify the subject
async function fromWikipedia(query: string): Promise<Pic | null> {
  for (const lang of ["en", "cs"]) {
    const d = await api(`${lang}.wikipedia.org`, { action: "query", generator: "search", gsrsearch: query, gsrlimit: "1", prop: "pageimages", piprop: "name" })
    const name = Object.values<any>(d?.query?.pages ?? {})[0]?.pageimage
    if (!name || /\.svg$/i.test(name)) continue
    const c = await api("commons.wikimedia.org", { action: "query", titles: `File:${name}`, ...INFO })
    const pic = toPic(Object.values<any>(c?.query?.pages ?? {})[0])
    if (pic) return pic // non-Commons (fair-use) files have no imageinfo here and are skipped
  }
  return null
}

// 2) Commons search, preferring public domain / CC0
async function fromCommons(query: string): Promise<Pic | null> {
  const d = await api("commons.wikimedia.org", {
    action: "query", generator: "search", gsrnamespace: "6", gsrlimit: "12",
    gsrsearch: `${query} filetype:bitmap -map -drawing -skull -skeleton`, ...INFO,
  })
  const c = Object.values<any>(d?.query?.pages ?? {}).sort((a, b) => a.index - b.index).map(toPic).filter(Boolean) as Pic[]
  return c.find((x) => /public domain|cc0|^pd/i.test(x.license)) ?? c[0] ?? null
}

export async function findPic(query: string): Promise<Pic | null> {
  if (query in cache) return cache[query]
  let pic: Pic | null = null
  try { pic = (await fromWikipedia(query)) ?? (await fromCommons(query)) } catch { return null } // network/rate limit: don't cache
  cache[query] = pic
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch {}
  return pic
}
