// Compares each category's `parent` in Sanity against the live site's menu
// hierarchy (scripts/data/category-tree.json) and re-parents the ones that
// disagree. Several categories sit one level too high in the dataset —
// MagSafe Charger hangs off Technology, for instance, when the live menu
// files it under Wireless Chargers — which is why the flyout showed far
// more columns than it should.
//
//   node scripts/reconcile-category-tree.mjs --dry
//   node scripts/reconcile-category-tree.mjs --apply

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

// name -> expected parent name (null for roots). Names are matched loosely,
// since the dataset spells a few of them with different spacing/hyphens.
const norm = (s) => s.toLowerCase().replace(/[\s\-–—]+/g, ' ').replace(/[^a-z0-9& ]/g, '').trim()
const expected = new Map()
// A handful of names occur twice in the live menu (Pencils/Pencil/Plantable
// Pencil hang off both Stationery and Kids). Those are genuinely two
// categories with two slugs, so a name alone can't say where one belongs —
// record them as ambiguous and leave their parent as-is.
const AMBIGUOUS = Symbol('ambiguous')
const put = (name, parent) => {
  const k = norm(name)
  if (expected.has(k) && expected.get(k) !== parent) expected.set(k, AMBIGUOUS)
  else expected.set(k, parent)
}
for (const [root, seconds] of Object.entries(tree)) {
  put(root, null)
  for (const [second, leaves] of Object.entries(seconds)) {
    put(second, root)
    for (const leaf of leaves) put(leaf, second)
  }
}

const cats = await client.fetch(`*[_type == "category" && !(_id in path("drafts.**"))]{_id, name, "parent": parent->name}`)
const idByName = new Map(cats.map((c) => [norm(c.name), c._id]))

const fixes = []
const unknown = []

for (const cat of cats) {
  const key = norm(cat.name)
  if (!expected.has(key)) {
    unknown.push(cat.name)
    continue
  }
  const wantParent = expected.get(key)
  if (wantParent === AMBIGUOUS) continue
  const haveParent = cat.parent || null
  if (norm(wantParent || '') === norm(haveParent || '')) continue

  const wantId = wantParent ? idByName.get(norm(wantParent)) : null
  if (wantParent && !wantId) {
    console.warn(`[tree] no category document for expected parent "${wantParent}" (of "${cat.name}")`)
    continue
  }
  fixes.push({id: cat._id, name: cat.name, from: haveParent, to: wantParent, toId: wantId})
}

console.log(`[tree] ${cats.length} categories in Sanity, ${expected.size} in the live menu`)
console.log(`[tree] ${fixes.length} mis-parented, ${unknown.length} not present in the live menu`)
console.log('\nRe-parenting:')
for (const f of fixes) console.log(`  ${f.name}:  ${f.from || '(root)'}  ->  ${f.to || '(root)'}`)
if (unknown.length) console.log(`\nNot in live menu (left alone): ${unknown.slice(0, 25).join(', ')}${unknown.length > 25 ? ` … +${unknown.length - 25}` : ''}`)

if (!APPLY) {
  console.log('\n[tree] Dry run — nothing written. Re-run with --apply.')
  process.exit(0)
}

let done = 0
for (const f of fixes) {
  const patch = client.patch(f.id)
  await (f.toId ? patch.set({parent: {_type: 'reference', _ref: f.toId}}) : patch.unset(['parent'])).commit()
  done++
}
console.log(`\n[tree] Re-parented ${done} categories.`)
