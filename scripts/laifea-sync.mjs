#!/usr/bin/env node
// Sync English website copy from the Laifea "website" mirror back into the
// site's JSON content files. See docs/laifea-website-mirror.md for the model.
//
// Usage:
//   node scripts/laifea-sync.mjs <notes-dir> [--dry] [--check]
//
//   <notes-dir>  A folder containing the exported Laifea notes as .md files
//                (the notes under BASE/Projects/int/website — Art/, Projects/,
//                Blog/). Searched recursively.
//   --dry        Print what would change; do not write the JSON files.
//   --check      Exit non-zero if anything would change (round-trip guard).
//
// Only the fields the mirror owns are touched (English copy + a few plain
// scalars). Czech/French copy, images, media, and links in the JSON are left
// exactly as they are.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const CHECK = args.includes("--check");
const notesDir = args.find((a) => !a.startsWith("--"));
if (!notesDir) {
  console.error("usage: node scripts/laifea-sync.mjs <notes-dir> [--dry] [--check]");
  process.exit(2);
}

// ---- markdown parsing -------------------------------------------------------
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const FM_KEYS = new Set(["type", "source", "id", "title", "medium", "home", "date", "link", "site_tags"]);

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z_]+):\s?(.*)$/);
    if (!mm || !FM_KEYS.has(mm[1])) continue;
    let v = mm[2];
    if (v.startsWith('"')) {
      try { v = JSON.parse(v); } catch { v = v.replace(/^"|"$/g, ""); }
    } else {
      v = v.trim();
    }
    fm[mm[1]] = v;
  }
  return fm;
}

function marker(text, field) {
  const re = new RegExp(`<!-- sync:${field}:en -->\\n([\\s\\S]*?)\\n<!-- /sync -->`);
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

// ---- load JSON preserving formatting ---------------------------------------
function loadJson(rel) {
  const abs = path.join(REPO, rel);
  const raw = fs.readFileSync(abs, "utf8");
  const indentMatch = raw.match(/^\[\r?\n( +)/);
  const indent = indentMatch ? indentMatch[1].length : 2;
  return { abs, rel, data: JSON.parse(raw), indent, trailingNL: raw.endsWith("\n"), raw };
}

const files = {
  "public/art.json": loadJson("public/art.json"),
  "public/portfolio.json": loadJson("public/portfolio.json"),
  "public/blogs.json": loadJson("public/blogs.json"),
};

const byId = {
  "public/art.json": new Map(files["public/art.json"].data.map((x) => [String(x.id), x])),
  "public/portfolio.json": new Map(files["public/portfolio.json"].data.map((x) => [String(x.id), x])),
  "public/blogs.json": new Map(files["public/blogs.json"].data.map((x) => [String(x.id), x])),
};

// ---- apply one note ---------------------------------------------------------
const changes = [];
// Localized copy: compare trimmed so accidental edge whitespace never counts
// as an edit, but a genuine copy change writes the (trimmed) new value.
function setEn(obj, key, val, note, label) {
  if (val == null) return;
  if (!obj[key] || typeof obj[key] !== "object") obj[key] = { en: "", cs: "", fr: "" };
  if (String(obj[key].en ?? "").trim() === String(val).trim()) return;
  changes.push(`${note}: ${label}`); obj[key].en = val;
}
function setPlain(obj, key, val, note, label) {
  if (val == null || val === "") return;
  if (obj[key] !== val) { changes.push(`${note}: ${label}`); obj[key] = val; }
}
// Website tags are localized and come in two shapes: a comma string
// ("ai, craft") or an array (["ai","craft"]). The note stores a readable
// comma string; restore whichever shape the JSON originally used.
function setTags(obj, editedStr, note) {
  if (editedStr == null) return;
  if (!obj.tags || typeof obj.tags !== "object") obj.tags = { en: "", cs: "", fr: "" };
  const cur = obj.tags.en;
  if (Array.isArray(cur)) {
    const arr = editedStr.split(",").map((s) => s.trim()).filter(Boolean);
    if (JSON.stringify(arr) === JSON.stringify(cur)) return;
    changes.push(`${note}: tags`); obj.tags.en = arr;
  } else {
    if (String(cur ?? "").trim() === editedStr.trim()) return;
    changes.push(`${note}: tags`); obj.tags.en = editedStr.trim();
  }
}

let applied = 0, skipped = 0;
for (const file of walk(notesDir)) {
  const text = fs.readFileSync(file, "utf8");
  const fm = parseFrontmatter(text);
  if (!fm.source || fm.id == null) { skipped++; continue; }
  const rec = byId[fm.source]?.get(String(fm.id));
  if (!rec) { skipped++; continue; }
  const note = path.basename(file);

  if (fm.source === "public/art.json") {
    setEn(rec, "medium", fm.medium, note, "medium");
    setEn(rec, "home", fm.home, note, "home");
    setEn(rec, "statement", marker(text, "statement"), note, "statement");
  } else if (fm.source === "public/portfolio.json") {
    setEn(rec, "title", fm.title, note, "title");
    setTags(rec, fm.site_tags, note);
    setPlain(rec, "date", fm.date, note, "date");
    setPlain(rec, "link", fm.link, note, "link");
    setEn(rec, "description", marker(text, "description"), note, "description");
    if (marker(text, "body") != null) setEn(rec, "body", marker(text, "body"), note, "body");
  } else if (fm.source === "public/blogs.json") {
    setEn(rec, "title", fm.title, note, "title");
    setTags(rec, fm.site_tags, note);
    setPlain(rec, "date", fm.date, note, "date");
    setEn(rec, "excerpt", marker(text, "excerpt"), note, "excerpt");
    setEn(rec, "body", marker(text, "body"), note, "body");
  }
  applied++;
}

// ---- write ------------------------------------------------------------------
let wrote = 0;
for (const f of Object.values(files)) {
  const next = JSON.stringify(f.data, null, f.indent) + (f.trailingNL ? "\n" : "");
  if (next === f.raw) continue;
  if (!DRY && !CHECK) { fs.writeFileSync(f.abs, next); wrote++; }
}

console.log(`notes parsed: ${applied}  skipped: ${skipped}  field-changes: ${changes.length}`);
if (changes.length) console.log(changes.map((c) => "  · " + c).join("\n"));
if (CHECK && changes.length) { console.error("check failed: notes differ from JSON"); process.exit(1); }
if (!DRY && !CHECK) console.log(`json files written: ${wrote}`);
if (DRY) console.log("(dry run — no files written)");
