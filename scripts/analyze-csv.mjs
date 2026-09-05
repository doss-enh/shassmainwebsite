// Reads the WooCommerce-style export and reports what's actually in it:
// parent products vs variation rows, unique SKUs, and image path coverage.
import {parse} from 'csv-parse/sync'
import {readFileSync} from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/analyze-csv.mjs <path-to-csv>')
  process.exit(1)
}

const rows = parse(readFileSync(file, 'utf8'), {columns: true, skip_empty_lines: true, relax_quotes: true})

const parents = rows.filter((r) => (r['Import type'] || '').trim() === 'product')
const variations = rows.filter((r) => (r['Import type'] || '').trim() === 'variation')

const parentSkus = new Set(parents.map((r) => (r['SKU'] || '').trim()).filter(Boolean))
const parentSlugs = new Set(parents.map((r) => (r['Slug'] || '').trim()).filter(Boolean))
const withImages = parents.filter((r) => (r['Images'] || '').trim()).length
const statuses = new Set(parents.map((r) => (r['Status'] || '').trim()))

// Every distinct image path referenced anywhere in the file.
const imagePaths = new Set()
for (const r of rows) {
  for (const p of (r['Images'] || '').split(',')) {
    const t = p.trim()
    if (t) imagePaths.add(t)
  }
}

console.log(
  JSON.stringify(
    {
      totalRows: rows.length,
      parentProducts: parents.length,
      variationRows: variations.length,
      uniqueParentSkus: parentSkus.size,
      uniqueParentSlugs: parentSlugs.size,
      parentsWithImages: withImages,
      parentStatuses: [...statuses],
      distinctImagePaths: imagePaths.size,
    },
    null,
    2
  )
)
