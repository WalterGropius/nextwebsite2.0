#!/usr/bin/env node
// Export the site's English website copy into Laifea "website" mirror notes
// (one markdown note per art series, project, and blog post). See
// docs/laifea-website-mirror.md. The notes are then pushed into the Laifea
// vault via its MCP tools; `laifea-sync.mjs` is the inverse (notes -> JSON).
//
// Usage:  node scripts/laifea-export.mjs [out-dir]   (default ./laifea-notes)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");
const SITE = "https://zenbauhaus.vercel.app";
const OUT = path.resolve(process.argv[2] || path.join(REPO, "laifea-notes"));

const load = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), "utf8"));
const art = load("public/art.json");
const projects = load("public/portfolio.json");
const blogs = load("public/blogs.json");

const VAULT = "BASE/Projects/int/website";
const DIRS = { art: VAULT + "/Art", project: VAULT + "/Projects", blog: VAULT + "/Blog" };

const full = (p) => (!p ? p : /^https?:\/\//.test(p) ? p : SITE + p);
const en = (v) => (v && typeof v === "object" ? v.en ?? "" : v ?? "");
const tagStr = (v) => { const e = en(v); return Array.isArray(e) ? e.join(", ") : e; };
const yamlStr = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SYNC = (field, text) => `<!-- sync:${field}:en -->\n${(text || "").trim()}\n<!-- /sync -->`;

// Projects that already have a KB note -> linked from the index, NOT duplicated.
const KB_SKIP = { 36: "[[Laifee]]", 34: "[[LUCID SOLUTION DESIGNERS]]" };
// Soft "related in KB" cross-links (a website note IS created too).
const RELATED_PROJECT = { 29: ["[[Meditation App - Bulk Media Upload]]"] };
const RELATED_BLOG = {
  "moving-200gb-for-free": ["[[Meditation App - Bulk Media Upload]]"],
  "neuron-as-pid-controller": ["[[Temporal Gated Network]]"],
  "double-converted-schema": ["[[Laifee]]", "[[Laifea (Exocortex)]]"],
  "measuring-gemini-cache": ["[[Laifee]]"],
  "boids-on-a-database": ["[[stdboids]]"],
  "betting-on-spacetimedb": ["[[stdboids]]"],
  "agents-that-ship": ["[[Laifee]]"],
};

fs.rmSync(OUT, { recursive: true, force: true });
Object.values(DIRS).forEach((d) => fs.mkdirSync(path.join(OUT, path.basename(d)), { recursive: true }));

const manifest = [];
const write = (bucket, title, filename, content) => {
  const rel = path.join(path.basename(DIRS[bucket]), filename);
  fs.writeFileSync(path.join(OUT, rel), content, "utf8");
  manifest.push({ bucket, title, parentDir: DIRS[bucket], file: path.join(OUT, rel) });
};
function uniqueTitle(seen, title, disambig) {
  let t = title, n = 2;
  if (seen.has(t)) t = `${title} (${disambig})`;
  while (seen.has(t)) t = `${title} (${disambig}-${n++})`;
  seen.add(t);
  return t;
}

// ---------- ART ----------
const artTitles = [];
for (const a of art) {
  const title = en(a.title);
  artTitles.push(title);
  const fm = ["---", "type: art", "source: public/art.json", `id: ${a.id}`, `slug: ${a.id}`,
    `url: ${SITE}/art/${a.id}`, `title: ${yamlStr(title)}`, `medium: ${yamlStr(en(a.medium))}`,
    `home: ${yamlStr(en(a.home))}`, `cover: ${a.cover || ""}`, `image_count: ${(a.images || []).length}`,
    "tags:", "  - website", "  - art", "---"].join("\n");
  const links = (a.links || []).map((l) => `- [${en(l.label)}](${l.href})`);
  const media = [];
  for (const e of a.embeds || []) {
    if (e.type === "youtube") media.push(`- YouTube: [${e.id}](https://youtu.be/${e.id})\n\n![](https://www.youtube.com/watch?v=${e.id})`);
    else if (e.type === "video") media.push(`![](${full(e.src)})`);
    else if (e.type === "sketchfab") media.push(`- Sketchfab collection: [${e.id}](https://sketchfab.com/playlists/embed?collection=${e.id})`);
  }
  const gallery = (a.images || []).map((src) => `![](${full(src)})`);
  const body = [fm, "", `> Art series · **${en(a.medium)}** · lives as *${en(a.home)}*`,
    `> Live page: ${SITE}/art/${a.id} · Backlink: [[Website — Master Index]]`, "",
    "## Statement", SYNC("statement", en(a.statement)), "",
    ...(links.length ? ["## Links", ...links, ""] : []),
    ...(media.length ? ["## Media", ...media, ""] : []),
    "## Gallery — cover", `![](${full(a.cover)})`, "",
    ...(gallery.length ? [`## Gallery — all (${gallery.length})`, ...gallery, ""] : [])].join("\n");
  write("art", title, `${a.id}.md`, body);
}

// ---------- PROJECTS ----------
const seenProj = new Set();
const projectIndex = [];
for (const p of projects) {
  const title = en(p.title), id = p.id;
  if (KB_SKIP[id]) { projectIndex.push({ title, id, skipped: true, kb: KB_SKIP[id] }); continue; }
  const uTitle = uniqueTitle(seenProj, title, p.date || String(id));
  const fm = ["---", "type: project", "source: public/portfolio.json", `id: ${id}`,
    `slug: ${slugify(title)}`, `url: ${SITE}/work/${id}`, `title: ${yamlStr(title)}`,
    `date: ${yamlStr(p.date || "")}`, `image: ${p.image || ""}`, `link: ${p.link || ""}`,
    `site_tags: ${yamlStr(tagStr(p.tags))}`, "tags:", "  - website", "  - project", "---"].join("\n");
  const linkLines = [];
  if (p.link) linkLines.push(`- [main link](${p.link})`);
  for (const l of p.links || []) linkLines.push(`- [${en(l.label)}](${l.href})`);
  const media = [];
  for (const m of p.media || []) {
    const cap = en(m.caption);
    if (m.type === "image") media.push(`![${en(m.alt) || ""}](${full(m.src)})` + (cap ? `\n*${cap}*` : ""));
    else if (m.type === "video") media.push(`![](${full(m.src)})` + (cap ? `\n*${cap}*` : ""));
    else if (m.type === "embed") {
      const src = (m.html.match(/src="([^"]+)"/) || [])[1];
      const yt = src && src.match(/embed\/([A-Za-z0-9_-]+)/);
      if (yt) media.push(`- video: [watch](https://youtu.be/${yt[1]})` + (cap ? ` — *${cap}*` : "") + `\n\n![](https://www.youtube.com/watch?v=${yt[1]})`);
      else if (src) media.push(`- embed: [open](${src})` + (cap ? ` — *${cap}*` : ""));
    }
  }
  const related = RELATED_PROJECT[id] || [];
  const cover = p.image ? `![](${full(p.image)})\n\n` : "";
  const bodyEn = en(p.body);
  const body = [fm, "", `> Project · ${p.date || ""}${tagStr(p.tags) ? " · **" + tagStr(p.tags) + "**" : ""}`,
    `> Live page: ${SITE}/work/${id} · Backlink: [[Website — Master Index]]`, "",
    cover + "## Summary", SYNC("description", en(p.description)), "",
    ...(bodyEn ? ["## Details", SYNC("body", bodyEn), ""] : []),
    ...(linkLines.length ? ["## Links", ...linkLines, ""] : []),
    ...(media.length ? ["## Media", ...media, ""] : []),
    ...(related.length ? ["## Related in KB", ...related.map((r) => `- ${r}`), ""] : [])].join("\n");
  write("project", uTitle, `${String(id).padStart(2, "0")}-${slugify(title)}.md`, body);
  projectIndex.push({ title: uTitle, id, skipped: false });
}

// ---------- BLOGS ----------
const blogIndex = [];
for (const b of blogs) {
  const title = en(b.title);
  blogIndex.push({ title, id: b.id });
  const fm = ["---", "type: blog", "source: public/blogs.json", `id: ${b.id}`, `slug: ${b.id}`,
    `url: ${SITE}/blog/${b.id}`, `title: ${yamlStr(title)}`, `date: ${yamlStr(b.date || "")}`,
    `image: ${b.image || ""}`, `site_tags: ${yamlStr(tagStr(b.tags))}`, "tags:", "  - website", "  - blog", "---"].join("\n");
  const related = RELATED_BLOG[b.id] || [];
  const cover = b.image ? `![](${full(b.image)})\n\n` : "";
  const body = [fm, "", `> Blog · ${b.date || ""}${tagStr(b.tags) ? " · " + tagStr(b.tags) : ""}`,
    `> Live page: ${SITE}/blog/${b.id} · Backlink: [[Website — Master Index]]`, "",
    cover + "## Excerpt", SYNC("excerpt", en(b.excerpt)), "",
    "## Body", SYNC("body", en(b.body)), "",
    ...(related.length ? ["## Related in KB", ...related.map((r) => `- ${r}`), ""] : [])].join("\n");
  write("blog", title, `${b.id}.md`, body);
}

// ---------- MASTER INDEX ----------
const wl = (t) => `[[${t}]]`;
const idx = ["---", "type: index", "title: Website — Master Index", "tags:", "  - website", "  - moc", "---", "",
  "# Website — Master Index", "",
  `Mirror of **${SITE}** for editing in Laifea. Change the English copy here, then a future "sync website from Laifea" pass writes it back into the site's JSON. Czech/French copy stays in the JSON and is untouched.`, "",
  "## How sync works", "",
  "Each note carries YAML frontmatter identifying its `source` JSON file and `id`. Editable English copy lives between markers so a sync pass can find it exactly:", "",
  "```", "<!-- sync:statement:en -->  ...edit this text...  <!-- /sync -->", "```", "",
  "**Field → JSON mapping**", "",
  "| note | frontmatter/marker | JSON path |", "|------|--------------------|-----------|",
  "| art | `medium`,`home` (fm) · `sync:statement` | `art.json[id].{medium,home,statement}.en` |",
  "| project | `title`,`site_tags` (fm) · `date`,`link` (fm, plain) · `sync:description`,`sync:body` | `portfolio.json[id].{title,tags,description,body}.en`, `{date,link}` |",
  "| blog | `title`,`site_tags` (fm) · `date` (fm, plain) · `sync:excerpt`,`sync:body` | `blogs.json[id].{title,tags,excerpt,body}.en`, `date` |", "",
  "The vault's own `tags:` list (`website`/`art`/`project`/`blog`) is organizational and **not** synced. Images/media are shown as live URL embeds from the site and are **not** edited here (manage those in the repo).", "",
  `## Art (${artTitles.length})`, "", ...artTitles.map((t) => `- ${wl(t)}`), "",
  `## Projects (${projectIndex.filter((p) => !p.skipped).length} here · ${projectIndex.filter((p) => p.skipped).length} linked from KB)`, "",
  ...projectIndex.map((p) => (p.skipped ? `- ${p.kb} — *lives in your KB, linked not duplicated*` : `- ${wl(p.title)}`)), "",
  `## Blog (${blogIndex.length})`, "", ...blogIndex.map((b) => `- ${wl(b.title)}`), ""];
fs.writeFileSync(path.join(OUT, "Website — Master Index.md"), idx.join("\n"), "utf8");
manifest.unshift({ bucket: "index", title: "Website — Master Index", parentDir: VAULT, file: path.join(OUT, "Website — Master Index.md") });

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`exported ${manifest.length} notes to ${OUT}`);
console.log(`  art: ${art.length} · projects: ${projectIndex.filter((p) => !p.skipped).length} (+${projectIndex.filter((p) => p.skipped).length} KB-linked) · blogs: ${blogs.length}`);
