// Compares the products in Sanity against the authoritative CSV export and
// reports (or applies) the difference: anything in Sanity that the CSV does
// not list is unpublished so the storefront stops serving it.
//
// Matching is by slug first, then SKU — the CSV carries both, and a slug
// survives a SKU being corrected.
//
//   node scripts/reconcile-products.mjs <csv> --dry     # report only
//   node scripts/reconcile-products.mjs <csv> --apply   # delete the extras
//
// --apply deletes documents. Run --dry first and read the list.

import {createClient} from '@sanity/client'
import {parse} from 'csv-parse/sync'
import {readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const args = process.argv.slice(2)
const csvPath = args.find((a) => !a.startsWith('--'))
const APPLY = args.includes('--apply')

if (!csvPath) {
  console.error('Usage: node scripts/reconcile-products.mjs <path-to-csv> [--dry|--apply]')
  process.exit(1)
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) {
  console.error('[reconcile] NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN must be set in .env.local')
  process.exit(1)
}

const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

const rows = parse(readFileSync(csvPath, 'utf8'), {columns: true, skip_empty_lines: true, relax_quotes: true})
const parents = rows.filter((r) => (r['Import type'] || '').trim() === 'product')

const csvSlugs = new Set(parents.map((r) => (r['Slug'] || '').trim().toLowerCase()).filter(Boolean))
const csvSkus = new Set(parents.map((r) => (r['SKU'] || '').trim().toLowerCase()).filter(Boolean))

const sanityProducts = await client.fetch(
  `*[_type == "product" && !(_id in path("drafts.**"))]{_id, title, sku, "slug": slug.current}`
)

const keep = []
const extras = []
for (const p of sanityProducts) {
  const slug = (p.slug || '').toLowerCase()
  const sku = (p.sku || '').toLowerCase()
  if ((slug && csvSlugs.has(slug)) || (sku && csvSkus.has(sku))) keep.push(p)
  else extras.push(p)
}

console.log(
  JSON.stringify(
    {
      csvParentProducts: parents.length,
      sanityPublishedProducts: sanityProducts.length,
      matched: keep.length,
      notInCsv: extras.length,
    },
    null,
    2
  )
)

if (extras.length) {
  const out = path.join(__dirname, '..', 'products-not-in-csv.json')
  writeFileSync(out, JSON.stringify(extras, null, 2))
  console.log(`[reconcile] Wrote the ${extras.length} unmatched products to ${out}`)
  console.log(JSON.stringify(extras.slice(0, 20), null, 2))
}

if (!APPLY) {
  console.log('[reconcile] Dry run — nothing deleted. Re-run with --apply to remove the unmatched products.')
  process.exit(0)
}

// Default is to unpublish (move to a draft), which takes the product off the
// storefront — the public client can't read drafts — while leaving the
// document recoverable in Studio. --hard-delete removes it for good.
const HARD_DELETE = args.includes('--hard-delete')
let changed = 0

for (const p of extras) {
  try {
    if (HARD_DELETE) {
      await client.delete(p._id)
    } else {
      const doc = await client.getDocument(p._id)
      if (!doc) continue
      await client.createOrReplace({...doc, _id: `drafts.${p._id}`})
      await client.delete(p._id)
    }
    changed++
  } catch (err) {
    console.error(`[reconcile] Failed on ${p.title} (${p._id}): ${err.message || err}`)
  }
}

console.log(
  `[reconcile] ${HARD_DELETE ? 'Deleted' : 'Unpublished'} ${changed} of ${extras.length} unmatched products.`
)
