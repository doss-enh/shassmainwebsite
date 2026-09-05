// Creates the third-level categories the live menu shows but this dataset
// never had. They're mostly the singular leaf under a plural column —
// "Cooler Bags > Cooler Bag" — and without them those columns render as a
// bare heading with nothing beneath it.
//
//   node scripts/create-missing-categories.mjs --dry
//   node scripts/create-missing-categories.mjs --apply

import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const tree = JSON.parse(readFileSync(path.join(__dirname, 'data', 'category-tree.json'), 'utf8'))
const norm = (s) => s.toLowerCase().replace(/[\s\-–—]+/g, ' ').replace(/[^a-z0-9& ]/g, '').trim()
const slugify = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const cats = await client.fetch(`*[_type == "category"]{_id, name, "slug": slug.current}`)
const idByName = new Map(cats.map((c) => [norm(c.name), c._id]))
const slugs = new Set(cats.map((c) => c.slug).filter(Boolean))

const missing = []
for (const [, seconds] of Object.entries(tree)) {
  for (const [second, leaves] of Object.entries(seconds)) {
    for (const leaf of leaves) {
      if (idByName.has(norm(leaf))) continue
      const parentId = idByName.get(norm(second))
      if (!parentId) {
        console.warn(`[cats] skipping "${leaf}" — parent "${second}" not in Sanity`)
        continue
      }
      // The plural column and its singular leaf collide on slug ("balloons"
      // vs "balloon" are fine, but "Highlighters"/"Highlighter" are not), so
      // suffix any slug already taken.
      let slug = slugify(leaf)
      if (slugs.has(slug)) slug = `${slug}-${slugify(second)}`
      slugs.add(slug)
      missing.push({name: leaf, slug, parentId, parentName: second})
    }
  }
}

console.log(`[cats] ${missing.length} categories to create:`)
for (const m of missing) console.log(`  ${m.parentName} > ${m.name}  (/${m.slug})`)

if (!APPLY) {
  console.log('\n[cats] Dry run — nothing written. Re-run with --apply.')
  process.exit(0)
}

for (const m of missing) {
  await client.create({
    _type: 'category',
    name: m.name,
    slug: {_type: 'slug', current: m.slug},
    parent: {_type: 'reference', _ref: m.parentId},
    sortOrder: 100,
  })
}
console.log(`\n[cats] Created ${missing.length} categories.`)
