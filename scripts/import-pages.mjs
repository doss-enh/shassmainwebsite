// Pulls the static pages (About Us, Clients, Contact) from shassgift.com
// into Sanity — body copy as Portable Text plus any images the page carries.
//
// The Clients page is the reason this exists: live renders fifteen customer
// logos there and this dataset had the page as three near-empty blocks. Its
// logos go into the page's `gallery` field rather than inline in the prose,
// so the template can lay them out as a grid.
//
//   node scripts/import-pages.mjs --dry
//   node scripts/import-pages.mjs --apply

import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
import {parse as parseHtml} from 'node-html-parser'
import {config} from 'dotenv'
import {createConverter} from './lib/html-to-portable-text.mjs'

config({path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), quiet: true})
const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const SITE = 'https://www.shassgift.com'
const PAGES = [
  {slug: 'about-us', title: 'About Us'},
  {slug: 'clients', title: 'Clients'},
  {slug: 'contact', title: 'Contact'},
]

// Site furniture that appears on every page — never page content.
const CHROME =
  /new-project\.png|logo\.png|facebook|instagram|you-tube|tik-tok|ximage|phone-call|ww\.png|icons\/(rocket-main|pdf|secure|dedicated|catalogue)\./

// Only About Us, Clients and Contact exist as live pages, and for two of
// them this dataset's copy is already a superset of live's — the About Us
// body carries every word live has plus a couple of paragraphs more. Import
// would be a downgrade there, so a page is only rewritten when live actually
// says something we are missing.
const words = (s) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 4))
const blockText = (blocks) =>
  (blocks || [])
    .filter((b) => b._type === 'block')
    .map((b) => (b.children || []).map((c) => c.text).join(''))
    .join(' ')

function liveAddsCopy(ourBody, liveBlocks) {
  const ours = words(blockText(ourBody))
  const live = words(blockText(liveBlocks))
  if (!live.size) return false
  const missing = [...live].filter((w) => !ours.has(w)).length
  return missing / live.size > 0.2
}

const assetCache = new Map()
async function uploadImage(src) {
  if (!src) return null
  const url = src.startsWith('http') ? src : `${SITE}${src.startsWith('/') ? '' : '/'}${src}`
  if (CHROME.test(url)) return null
  if (assetCache.has(url)) return assetCache.get(url)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 512) throw new Error('too small')
    const asset = await client.assets.upload('image', buf, {filename: url.split('/').pop()})
    assetCache.set(url, asset._id)
    return asset._id
  } catch (err) {
    console.warn(`    image failed ${url.split('/').pop()}: ${err.message}`)
    assetCache.set(url, null)
    return null
  }
}

for (const {slug, title} of PAGES) {
  const res = await fetch(`${SITE}/${slug}`)
  const root = parseHtml(await res.text())
  const ck = root.querySelector('.ck-content')
  if (!ck) {
    console.log(`  SKIP /${slug} — no .ck-content`)
    continue
  }

  // Collect the page's own images first so the converter can reference them
  // by asset id while walking the tree.
  const srcs = [...new Set(
    ck.querySelectorAll('img').map((i) => i.getAttribute('src') || i.getAttribute('data-src')).filter(Boolean),
  )].filter((s) => !CHROME.test(s))

  console.log(`\n/${slug} — ${ck.innerHTML.trim().length} chars of markup, ${srcs.length} images`)

  if (!APPLY) {
    const {convert} = createConverter({siteUrl: SITE, onImage: () => null})
    console.log(`  -> ${convert(ck).length} blocks, ${srcs.length} gallery images`)
    srcs.slice(0, 6).forEach((s) => console.log(`     ${s.split('/').pop()}`))
    continue
  }

  const ids = []
  for (const s of srcs) {
    const id = await uploadImage(s)
    if (id) ids.push(id)
  }

  // Images on these pages are a logo wall, not illustrations inside the
  // prose, so they are kept out of the body and put in `gallery`.
  const {convert} = createConverter({siteUrl: SITE, onImage: () => null})
  const body = convert(ck)
  if (!body.length && !ids.length) {
    console.log(`  SKIP /${slug} — nothing extracted`)
    continue
  }

  const current = await client.fetch(`*[_type=="page" && slug.current==$slug][0]{_id, body}`, {slug})
  const existing = current?._id
  const bodyIsBetter = !current?.body?.length || liveAddsCopy(current.body, body)
  if (existing && !bodyIsBetter && !ids.length) {
    console.log('  SKIP — our copy already covers what live says, and there are no images to add')
    continue
  }

  const doc = {
    _type: 'page',
    title,
    slug: {_type: 'slug', current: slug},
    layout: 'richText',
    // Keep the richer body when ours already says everything live does.
    ...(bodyIsBetter ? {body} : {}),
    gallery: ids.map((id, i) => ({
      _type: 'imageWithAlt',
      _key: `g${i}`,
      alt: `${title} — client logo ${i + 1}`,
      asset: {_type: 'reference', _ref: id},
    })),
    externalId: `live:${slug}`,
  }

  if (existing) {
    await client.patch(existing).set(doc).commit()
    console.log(`  updated (${body.length} blocks, ${ids.length} images)`)
  } else {
    await client.create(doc)
    console.log(`  created (${body.length} blocks, ${ids.length} images)`)
  }
}

if (!APPLY) console.log('\n[pages] Dry run — nothing written.')
