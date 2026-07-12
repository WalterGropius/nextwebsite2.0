# Laifea website mirror

The site's English copy is mirrored as notes in the **Laifea** vault so it can
be edited there and synced back into the repo. One note per **art series**,
**project** (work), and **blog** post, plus a master index.

- **Vault location:** `BASE/Projects/int/website` → `Art/`, `Projects/`, `Blog/`
- **Index note:** `Website — Master Index` (overview + the field→JSON map, links every note)
- **Source of truth for the site stays the JSON** in `public/` — Laifea is the
  editing surface; a sync run writes edits back.

## What's mirrored

| bucket | count | source file | vault folder |
|--------|-------|-------------|--------------|
| art | 15 | `public/art.json` | `website/Art` |
| project | 43 | `public/portfolio.json` | `website/Projects` |
| blog | 20 | `public/blogs.json` | `website/Blog` |

Two projects already have their own KB notes, so they are **linked, not
duplicated** (only referenced from the index): **Laifea** → `[[Laifee]]` /
`[[Laifea (Exocortex)]]`, **Lucid Solution Designers** →
`[[LUCID SOLUTION DESIGNERS]]`.

## What each note contains

- **YAML frontmatter** — identity + syncable scalars (`source`, `id`, `url`,
  `title`, and per-type fields). The `tags:` list (`website`/`art`/…) is the
  vault's own organization and is **not** synced.
- **English copy** between HTML markers so a sync pass finds it exactly:

  ```
  <!-- sync:statement:en -->
  ...the editable text...
  <!-- /sync -->
  ```

- **Media** — cover, gallery images, videos, YouTube/Sketchfab — as live URL
  embeds pointing at `https://zenbauhaus.vercel.app/...`. Media is displayed for
  context but **not** edited here; manage assets in the repo.
- **Links** — external links (Instagram, live sites, …) and `[[wikilinks]]` to
  related KB notes.

## Field → JSON mapping (what sync writes)

| note | frontmatter / marker | JSON path |
|------|----------------------|-----------|
| art | `medium`, `home` · `sync:statement` | `art.json[id].{medium,home,statement}.en` |
| project | `title`, `site_tags` · `date`, `link` (plain) · `sync:description`, `sync:body` | `portfolio.json[id].{title,tags,description,body}.en`, `{date,link}` |
| blog | `title`, `site_tags` · `date` (plain) · `sync:excerpt`, `sync:body` | `blogs.json[id].{title,tags,excerpt,body}.en`, `date` |

Only `.en` fields (and a few plain scalars) are touched. **Czech/French copy,
images, media, and structured links in the JSON are left exactly as-is.** Tags
that are arrays in the JSON stay arrays; comma-string tags stay strings.

## Scripts

### Export (JSON → notes)

```bash
node scripts/laifea-export.mjs [out-dir]   # default ./laifea-notes (gitignored)
```

Writes one `.md` per item plus `manifest.json` (`{bucket,title,parentDir,file}`
per note). The notes are pushed into Laifea via its MCP `notes.create` tool,
using each entry's `title` + `parentDir`. This is how the vault was first
populated; re-run it to regenerate the note bodies from the current JSON.

### Sync (notes → JSON)

```bash
node scripts/laifea-sync.mjs <notes-dir> [--dry] [--check]
```

Reads the exported/edited notes and writes changed English copy back into
`public/*.json`, preserving each file's exact indentation and trailing newline.

- `--dry` — print the field changes, write nothing.
- `--check` — exit non-zero if anything differs (round-trip guard for CI).

`<notes-dir>` is a folder of the notes as `.md` files — either a fresh export,
or the `website/` notes pulled out of Laifea via its MCP `notes.read` tools.

## Round-trip guarantee

Exporting the current JSON and syncing it straight back produces **zero
changes** — the mapping is lossless for the fields it owns:

```bash
node scripts/laifea-export.mjs /tmp/notes && node scripts/laifea-sync.mjs /tmp/notes --check
# notes parsed: 78  skipped: 1  field-changes: 0
```

## Typical loop

1. Edit copy in Laifea (statements, descriptions, blog bodies, titles, tags).
2. Pull the `website/` notes into a folder (or ask Claude to, via the Laifea MCP).
3. `node scripts/laifea-sync.mjs <folder> --dry` to preview.
4. Drop `--dry` to apply, then commit the `public/*.json` changes.
