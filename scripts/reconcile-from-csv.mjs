// Brings every product in line with the shassgiftmain.csv export, which is
// the same data the live site runs on.
//
// The important fix is category assignment. The importer set most products'
// primary category to whichever name it saw first — a root like "Technology"
// for 1,250 of them — but the live site treats the LAST name in the CSV's
// Categories column as the product's own category and the rest as extras.
// That is what drives the breadcrumb, so today most product pages stop at
// "Home / Products / Technology" instead of walking down to the leaf.
//
// Also backfills featured images and galleries for products whose media
// never came across, using the CSV's Images column against /storage/.
//
//   node scripts/reconcile-from-csv.mjs <csv> --dry
//   node scripts/reconcile-from-csv.mjs <csv> --apply [--only=categories|images]

import {parse} from 'csv-parse/sync'
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
import {config} from 'dotenv'

config({path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), quiet: true})

const csvPath = process.argv[2]
if (!csvPath || csvPath.startsWith('--')) {
  console.error('Usage: node scripts/reconcile-from-csv.mjs <csv> [--apply] [--only=categories|images]')
  process.exit(1)
}
const APPLY = process.argv.includes('--apply')
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || 'all'
const doCats = only === 'all' || only === 'categories'
const doImgs = only === 'all' || only === 'images'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const STORAGE = 'https://www.shassgift.com/storage/'
const norm = (s) => (s || '').toLowerCase().replace(/[\s\-–—]+/g, ' ').replace(/[^a-z0-9& ]/g, '').trim()

const rows = parse(readFileSync(csvPath, 'utf8'), {columns: true, skip_empty_lines: true, relax_quotes: true})
const parents = rows.filter((r) => (r['Import type'] || '').trim() === 'product')

const cats = await client.fetch(`*[_type=="category" && !(_id in path("drafts.**"))]{_id, name}`)
const catByName = new Map(cats.map((c) => [norm(c.name), c._id]))
// The CSV still names the singular categories that have since been folded
// into their plural ("Pouch" -> "Pouches"), so match on a singular stem too.
const stem = (s) => {
  s = norm(s)
  if (/(ches|shes|sses|xes)$/.test(s)) return s.replace(/es$/, '')
  if (/ies$/.test(s)) return s.replace(/ies$/, 'y')
  if (/s$/.test(s) && !/ss$/.test(s)) return s.replace(/s$/, '')
  return s
}
const catByStem = new Map()
for (const c of cats) if (!catByStem.has(stem(c.name))) catByStem.set(stem(c.name), c._id)
const lookupCat = (n) => catByName.get(norm(n)) || catByStem.get(stem(n))

const products = await client.fetch(
  `*[_type=="product" && !(_id in path("drafts.**"))]{_id, "slug":slug.current, sku, "cat":category._ref, "add":additionalCategories[]._ref, "hasImg":defined(featuredImage), "gal":count(gallery)}`,
)
const bySlug = new Map(products.map((p) => [p.slug, p]))

// ---------- categories ----------
const catFixes = []
const unknownNames = new Set()
if (doCats) {
  for (const row of parents) {
    const slug = (row['Slug'] || '').trim()
    const prod = bySlug.get(slug)
    if (!prod) continue
    const names = (row['Categories'] || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (!names.length) continue

    const ids = []
    for (const n of names) {
      const id = lookupCat(n)
      if (id) ids.push(id)
      else unknownNames.add(n)
    }
    if (!ids.length) continue

    // Live treats the last-listed category as the product's own.
    const primary = ids[ids.length - 1]
    const extras = ids.slice(0, -1)
    const sameExtras =
      (prod.add || []).length === extras.length && (prod.add || []).every((r, i) => r === extras[i])
    if (prod.cat === primary && sameExtras) continue
    catFixes.push({id: prod._id, slug, sku: prod.sku, primary, extras})
  }
}

// ---------- images ----------
const imgFixes = []
if (doImgs) {
  for (const row of parents) {
    const slug = (row['Slug'] || '').trim()
    const prod = bySlug.get(slug)
    if (!prod) continue
    const paths = (row['Images'] || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (!paths.length) continue
    // Only touch products that are actually short of media.
    if (prod.hasImg && prod.gal >= paths.length - 1) continue
    imgFixes.push({id: prod._id, slug, sku: prod.sku, hasImg: prod.hasImg, have: prod.gal, urls: paths.map((p) => STORAGE + p)})
  }
}

console.log(`[csv] ${parents.length} CSV products, ${products.length} in Sanity`)
if (doCats) {
  console.log(`[csv] category assignments to correct: ${catFixes.length}`)
  catFixes.slice(0, 8).forEach((f) => console.log(`    ${(f.sku || '').padEnd(11)} /${f.slug}`))
  if (unknownNames.size) console.log(`[csv] category names in the CSV with no document: ${[...unknownNames].join(', ')}`)
}
if (doImgs) console.log(`[csv] products needing media: ${imgFixes.length}`)

if (!APPLY) {
  console.log('\n[csv] Dry run — nothing written.')
  process.exit(0)
}

// ---------- write categories ----------
let n = 0
for (const f of catFixes) {
  await client
    .patch(f.id)
    .set({
      category: {_type: 'reference', _ref: f.primary},
      additionalCategories: f.extras.map((r) => ({_type: 'reference', _ref: r, _key: r})),
    })
    .commit()
  if (++n % 100 === 0) console.log(`  categories ${n}/${catFixes.length}`)
}
if (doCats) console.log(`[csv] corrected ${n} category assignments`)

// ---------- write images ----------
let ok = 0
let fail = 0
for (const f of imgFixes) {
  const assets = []
  for (const url of f.urls.slice(0, 8)) {
    try {
      const res = await fetch(url)
      if (!res.ok) { fail++; continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 512) { fail++; continue }
      const asset = await client.assets.upload('image', buf, {filename: url.split('/').pop()})
      assets.push(asset._id)
    } catch {
      fail++
    }
  }
  if (!assets.length) continue
  const ref = (id, key) => ({_type: 'imageWithAlt', _key: key, asset: {_type: 'reference', _ref: id}})
  const patch = {}
  if (!f.hasImg) patch.featuredImage = {_type: 'imageWithAlt', asset: {_type: 'reference', _ref: assets[0]}}
  const rest = f.hasImg ? assets : assets.slice(1)
  if (rest.length) patch.gallery = rest.map((id, i) => ref(id, `csv-${i}-${id.slice(-6)}`))
  if (Object.keys(patch).length) {
    await client.patch(f.id).set(patch).commit()
    ok++
    if (ok % 25 === 0) console.log(`  media ${ok}/${imgFixes.length}`)
  }
}
if (doImgs) console.log(`[csv] media updated on ${ok} products (${fail} image fetches failed)`)
