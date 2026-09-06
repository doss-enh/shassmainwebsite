// Pulls every blog post from shassgift.com into Sanity. The live index runs
// to three pages and 37 posts; this dataset only ever had three of them.
//
// Post bodies come out of CKEditor (.ck-content) as plain HTML, so they are
// converted to Portable Text here — paragraphs, headings, lists and inline
// links/emphasis, which is everything the posts actually use.
//
//   node scripts/import-blog-posts.mjs --dry
//   node scripts/import-blog-posts.mjs --apply

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
// Blog "categories" share the /blog/ prefix with real posts; skip them.
const CATEGORY_SLUGS = new Set(['technology', 'premiums', 'stationery', 'drinkware', 'bags', 'apparels', 'kids', 'care', 'leisure'])

const get = async (url) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {headers: {'user-agent': 'shassgift-import'}})
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (attempt >= 4) throw err
      await new Promise((r) => setTimeout(r, attempt * 1500))
    }
  }
}

// ---------- discover ----------
const slugs = new Set()
for (let page = 1; page <= 12; page++) {
  const html = await get(page === 1 ? `${SITE}/blogs` : `${SITE}/blogs?page=${page}`)
  const found = [...html.matchAll(/\/blog\/([a-z0-9-]+)(?="|')/g)].map((m) => m[1]).filter((s) => !CATEGORY_SLUGS.has(s))
  const before = slugs.size
  found.forEach((s) => slugs.add(s))
  if (slugs.size === before) break
}
console.log(`[blog] ${slugs.size} posts found on the live index`)

// ---------- convert ----------
// Shared with the page importer — both read the same CKEditor markup.
const {convert: toPortableText} = createConverter({siteUrl: SITE, onImage: () => null})

const MONTHS = {Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11}
function parseDate(text) {
  const m = /([A-Z][a-z]{2})\s+(\d{1,2}),\s*(\d{4})/.exec(text || '')
  if (!m) return null
  return new Date(Date.UTC(Number(m[3]), MONTHS[m[1]] ?? 0, Number(m[2]), 9)).toISOString()
}

// ---------- scrape ----------
const posts = []
for (const slug of slugs) {
  try {
    const root = parseHtml(await get(`${SITE}/blog/${slug}`))
    const title = root.querySelector('h1')?.text.trim()
    const content = root.querySelector('.ck-content')
    if (!title || !content) {
      console.warn(`  SKIP /blog/${slug} — no title or body`)
      continue
    }
    const body = toPortableText(content)
    if (!body.length) {
      console.warn(`  SKIP /blog/${slug} — empty body`)
      continue
    }
    const ogImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const metaDesc = root.querySelector('meta[name="description"]')?.getAttribute('content')
    const tagsText = root.querySelector('.entry-meta-tags')?.text.replace(/^\s*Tags:\s*/i, '') || ''
    posts.push({
      slug,
      title,
      body,
      excerpt: (metaDesc || '').trim().slice(0, 300) || undefined,
      author: (root.querySelector('.entry-meta-author')?.text || '').replace(/^\s*By\s*/i, '').trim() || 'Shass Gift',
      category: (root.querySelector('.entry-meta-categories, .entry-meta-category')?.text || '').replace(/^\s*in\s*/i, '').trim() || undefined,
      publishedAt: parseDate(root.querySelector('.entry-meta-date')?.text),
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
      image: ogImage && !/logo\.png$/i.test(ogImage) ? ogImage : null,
    })
  } catch (err) {
    console.warn(`  FAILED /blog/${slug}: ${err.message}`)
  }
}

console.log(`[blog] scraped ${posts.length} posts`)
const existing = await client.fetch(`*[_type=="post"]{_id, "slug": slug.current}`)
const idBySlug = new Map(existing.map((p) => [p.slug, p._id]))
console.log(`[blog] ${existing.length} already in Sanity; ${posts.filter((p) => !idBySlug.has(p.slug)).length} new`)

if (!APPLY) {
  posts.slice(0, 8).forEach((p) => console.log(`  ${p.publishedAt?.slice(0, 10) || '????-??-??'}  ${p.title.slice(0, 60)}  (${p.body.length} blocks, img=${p.image ? 'y' : 'n'})`))
  console.log('\n[blog] Dry run — nothing written.')
  process.exit(0)
}

let created = 0
let updated = 0
for (const p of posts) {
  let imageRef = null
  if (p.image) {
    try {
      const res = await fetch(p.image)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > 512) {
          const asset = await client.assets.upload('image', buf, {filename: p.image.split('/').pop()})
          imageRef = asset._id
        }
      }
    } catch {
      /* a missing hero should not stop the post from importing */
    }
  }

  const doc = {
    _type: 'post',
    title: p.title,
    slug: {_type: 'slug', current: p.slug},
    excerpt: p.excerpt,
    author: p.author,
    category: p.category,
    tags: p.tags,
    body: p.body,
    publishedAt: p.publishedAt || new Date().toISOString(),
    externalId: `live:${p.slug}`,
    ...(imageRef ? {mainImage: {_type: 'imageWithAlt', alt: p.title, asset: {_type: 'reference', _ref: imageRef}}} : {}),
  }

  const id = idBySlug.get(p.slug)
  if (id) {
    await client.patch(id).set(doc).commit()
    updated++
  } else {
    await client.create(doc)
    created++
  }
  console.log(`  ${id ? 'updated' : 'created'} ${p.slug}`)
}
console.log(`\n[blog] ${created} created, ${updated} updated.`)
