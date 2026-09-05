// The CSV export is the product catalogue of record. Anything in Sanity that
// is not in it never came from the live site — a leftover test document and a
// handful of items dropped from the range — so this removes them so the two
// stay in step.
//
//   node scripts/remove-products-not-in-csv.mjs <csv> --dry
//   node scripts/remove-products-not-in-csv.mjs <csv> --apply

import {parse} from 'csv-parse/sync'
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
import {config} from 'dotenv'

config({path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), quiet: true})

const csvPath = process.argv[2]
if (!csvPath || csvPath.startsWith('--')) {
  console.error('Usage: node scripts/remove-products-not-in-csv.mjs <csv> [--apply]')
  process.exit(1)
}
const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const rows = parse(readFileSync(csvPath, 'utf8'), {columns: true, skip_empty_lines: true, relax_quotes: true})
const csvSlugs = new Set(
  rows.filter((r) => (r['Import type'] || '').trim() === 'product').map((r) => (r['Slug'] || '').trim()).filter(Boolean),
)

const products = await client.fetch(`*[_type=="product"]{_id, title, sku, "slug": slug.current}`)
const extra = products.filter((p) => !csvSlugs.has(p.slug))

console.log(`[products] ${products.length} in Sanity, ${csvSlugs.size} in the CSV, ${extra.length} not in the CSV:`)
for (const p of extra) console.log(`  ${(p.sku || '').padEnd(12)} ${(p.title || '').slice(0, 42).padEnd(44)} /${p.slug}`)

if (!APPLY) {
  console.log('\n[products] Dry run — nothing written.')
  process.exit(0)
}

for (const p of extra) {
  // Clear inbound references first so the delete cannot be refused.
  const refs = await client.fetch(`*[references($id)]._id`, {id: p._id})
  for (const id of refs) {
    await client.patch(id).unset([`relatedProducts[_ref=="${p._id}"]`, `crossSellProducts[_ref=="${p._id}"]`]).commit()
  }
  await client.delete(p._id)
  console.log(`  removed ${p.sku || p.slug}`)
}
console.log(`\n[products] Removed ${extra.length}. Remaining: ${await client.fetch(`count(*[_type=="product"])`)}`)
