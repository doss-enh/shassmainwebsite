// Backfills product images into Sanity by pulling the files the dataset
// already points at: every product carries `sourceImages` (and each variant
// its own), which are paths under the live site's /storage/ directory.
//
// Re-runnable and keyed on the Sanity document id: a product that already
// has a featuredImage is skipped, so an interrupted run resumes cleanly.
// Every network call is retried; failures are counted and the run aborts
// loudly past a threshold rather than finishing with a hole in the data.
//
//   node scripts/backfill-images.mjs --dry            # report only
//   node scripts/backfill-images.mjs --limit 25       # do 25 products
//   node scripts/backfill-images.mjs                  # do all of them

import {createClient} from '@sanity/client'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const limitArg = args.indexOf('--limit')
const LIMIT = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity
const IMAGE_BASE = process.env.PRODUCT_IMAGE_BASE_URL || 'https://www.shassgift.com/storage/'
const FAILURE_THRESHOLD = 25
const MAX_GALLERY = 6

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('[backfill] NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN must be set in .env.local')
  process.exit(1)
}

const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

async function retry(label, fn, attempts = 3) {
  let lastErr
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts) await new Promise((r) => setTimeout(r, 500 * i))
    }
  }
  throw new Error(`${label}: ${lastErr?.message || lastErr}`)
}

// Cache uploaded assets by source path so shared images upload once.
const assetCache = new Map()

async function uploadImage(sourcePath) {
  if (assetCache.has(sourcePath)) return assetCache.get(sourcePath)

  const url = IMAGE_BASE + sourcePath.replace(/^\/+/, '')
  const asset = await retry(`fetch ${sourcePath}`, async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0) throw new Error('empty body')
    return client.assets.upload('image', buf, {filename: path.basename(sourcePath)})
  })

  assetCache.set(sourcePath, asset._id)
  return asset._id
}

function imageField(assetId, alt) {
  return {_type: 'imageWithAlt', alt, asset: {_type: 'reference', _ref: assetId}}
}

const products = await client.fetch(
  `*[_type == "product" && !defined(featuredImage) && defined(sourceImages) && count(sourceImages) > 0]{
     _id, title, sourceImages
   }`
)

console.log(`[backfill] ${products.length} products have source paths but no featuredImage.`)
if (DRY) {
  const sample = products.slice(0, 5).map((p) => ({title: p.title, first: p.sourceImages[0]}))
  console.log(`[backfill] Image base: ${IMAGE_BASE}`)
  console.log('[backfill] Sample:', JSON.stringify(sample, null, 2))
  console.log('[backfill] Dry run — nothing written.')
  process.exit(0)
}

let done = 0
let failures = 0
const failed = []

for (const product of products.slice(0, LIMIT)) {
  try {
    const paths = product.sourceImages.slice(0, MAX_GALLERY)
    const assetIds = []
    for (const p of paths) {
      try {
        assetIds.push(await uploadImage(p))
      } catch (err) {
        failed.push({product: product.title, path: p, error: String(err.message || err)})
        failures++
      }
    }

    if (assetIds.length === 0) {
      console.warn(`[backfill] ${product.title}: no images could be fetched, skipping`)
      continue
    }

    await retry(`patch ${product._id}`, () =>
      client
        .patch(product._id)
        .set({
          featuredImage: imageField(assetIds[0], product.title),
          gallery: assetIds.slice(1).map((id) => imageField(id, product.title)),
          needsImage: false,
        })
        .commit()
    )

    done++
    if (done % 10 === 0) console.log(`[backfill] ${done} products updated (${failures} image failures so far)`)

    if (failures > FAILURE_THRESHOLD) {
      console.error(`[backfill] ABORTING: ${failures} image failures exceeds threshold of ${FAILURE_THRESHOLD}.`)
      console.error(JSON.stringify(failed.slice(0, 10), null, 2))
      process.exit(1)
    }
  } catch (err) {
    failures++
    failed.push({product: product.title, error: String(err.message || err)})
    console.error(`[backfill] ${product.title} failed: ${err.message || err}`)
  }
}

console.log(`[backfill] Done. ${done} products updated, ${assetCache.size} assets uploaded, ${failures} failures.`)
if (failed.length) console.log('[backfill] Failures:', JSON.stringify(failed.slice(0, 20), null, 2))
