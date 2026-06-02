#!/usr/bin/env node
/*
 * One-off generator for portfolio placeholder cards.
 *
 * The remote build environment can't reach the live deployments to grab
 * real screenshots, so these stand-ins keep the cards from looking broken
 * until the real shots / footage are dropped in. Ink-on-paper to match the
 * rest of the site (--surface-dark #f6f6f4, --ink #1a1d28, --vermilion #ee4a44).
 *
 * Run: node scripts/gen-placeholders.js
 * Output: public/work/<slug>.webp  (1280x1600, the 4:5 card ratio)
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const W = 1280
const H = 1600
const PAPER = '#f6f6f4'
const INK = '#1a1d28'
const VERMILION = '#ee4a44'
const MUTED = 'rgba(15,17,23,0.55)'

const OUT = path.join(__dirname, '..', 'public', 'work')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// naive word-wrap by character budget per line
function wrap(text, max) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur.trim())
      cur = w
    } else {
      cur = (cur + ' ' + w).trim()
    }
  }
  if (cur) lines.push(cur.trim())
  return lines
}

const projects = [
  { slug: 'hopisik', name: 'hopísík', kind: 'game · with my daughter' },
  { slug: 'be-mindful', name: 'be mindful', kind: 'mindfulness app + landing' },
  { slug: 'chatspc', name: 'chat spc', kind: 'súkl spc rag for doctors' },
  { slug: 'amlproof', name: 'amlproof', kind: 'aml compliance automation' },
  { slug: 'homeproof', name: 'homeproof', kind: 'real-estate condition' },
  { slug: 'shiftrs', name: 'shiftrs', kind: 'creative agency · cto' },
  { slug: 'lucid', name: 'lucid solution designers', kind: 'startup incubator · au-au' },
  { slug: 'pilsner-urquell', name: 'pilsner urquell', kind: 'live event projections' },
]

function svgFor(p) {
  const nameLines = wrap(p.name, 13)
  const fs0 = nameLines.length > 2 ? 150 : 190
  const lh = fs0 * 1.02
  const blockH = nameLines.length * lh
  const startY = H * 0.52 - blockH / 2 + fs0 * 0.8
  const nameTspans = nameLines
    .map((ln, i) => `<text x="110" y="${startY + i * lh}" font-family="Georgia, 'Times New Roman', serif" font-size="${fs0}" fill="${INK}">${esc(ln)}</text>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="none" stroke="${INK}" stroke-width="6"/>
  <rect x="110" y="150" width="92" height="92" fill="${VERMILION}"/>
  <text x="110" y="${150 + 200}" font-family="Helvetica, Arial, sans-serif" font-size="40" letter-spacing="10" fill="${VERMILION}">${esc(p.kind.toUpperCase())}</text>
  ${nameTspans}
  <text x="110" y="${H - 170}" font-family="Helvetica, Arial, sans-serif" font-size="34" letter-spacing="6" fill="${MUTED}">PLACEHOLDER</text>
  <text x="110" y="${H - 120}" font-family="Helvetica, Arial, sans-serif" font-size="34" letter-spacing="2" fill="${MUTED}">screenshot coming soon</text>
</svg>`
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  for (const p of projects) {
    const svg = svgFor(p)
    const file = path.join(OUT, `${p.slug}.webp`)
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(file)
    console.log('wrote', path.relative(path.join(__dirname, '..'), file))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
