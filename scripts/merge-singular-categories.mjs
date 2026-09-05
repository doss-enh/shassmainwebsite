// Collapses the redundant "Cooler Bags > Cooler Bag" pattern: wherever a
// category's only distinction from its parent is singular-vs-plural, the
// child is merged into the parent. Products (and any other referencing
// document) are repointed at the parent, then the child is deleted.
//
//   node scripts/merge-singular-categories.mjs --dry
//   node scripts/merge-singular-categories.mjs --apply

import {createClient} from '@sanity/client'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

config({path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), quiet: true})
const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const norm = (s) => s.toLowerCase().replace(/[\s\-–—]+/g, ' ').replace(/[^a-z0-9& ]/g, '').trim()
const sing = (s) => {
  s = norm(s)
  if (/(ches|shes|sses|xes)$/.test(s)) return s.replace(/es$/, '')
  if (/ies$/.test(s)) return s.replace(/ies$/, 'y')
  if (/s$/.test(s) && !/ss$/.test(s)) return s.replace(/s$/, '')
  return s
}

const cats = await client.fetch(`*[_type=="category"]{_id, name, "pid": parent._ref}`)
const byId = new Map(cats.map((c) => [c._id, c]))

const merges = []
for (const c of cats) {
  const p = c.pid && byId.get(c.pid)
  if (p && sing(c.name) === sing(p.name)) merges.push({child: c, parent: p})
}

console.log(`[merge] ${merges.length} singular categories to fold into their plural parent`)
for (const m of merges) console.log(`  ${m.child.name}  ->  ${m.parent.name}`)
if (!APPLY) {
  console.log('\n[merge] Dry run — nothing written.')
  process.exit(0)
}

let moved = 0
for (const {child, parent} of merges) {
  // Anything at all that points at the child, not just products.
  const refs = await client.fetch(
    `*[references($id)]{_id, _type, "cat": category._ref, "add": additionalCategories[]._ref, "par": parent._ref}`,
    {id: child._id},
  )
  for (const doc of refs) {
    const patch = client.patch(doc._id)
    if (doc.cat === child._id) patch.set({category: {_type: 'reference', _ref: parent._id}})
    if (doc.par === child._id) patch.set({parent: {_type: 'reference', _ref: parent._id}})
    if (doc.add?.includes(child._id)) {
      // Repoint, then drop the duplicate the repoint may have just created.
      const primary = doc.cat === child._id ? parent._id : doc.cat
      const next = [...new Set(doc.add.map((r) => (r === child._id ? parent._id : r)))].filter((r) => r !== primary)
      patch.set({additionalCategories: next.map((r) => ({_type: 'reference', _ref: r, _key: r}))})
    }
    await patch.commit()
    moved++
  }
  await client.delete(child._id)
  console.log(`  merged ${child.name} -> ${parent.name} (${refs.length} documents repointed)`)
}
console.log(`\n[merge] Done. ${merges.length} categories removed, ${moved} documents repointed.`)
