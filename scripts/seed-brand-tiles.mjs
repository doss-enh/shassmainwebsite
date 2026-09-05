// Uploads the four Featured Brands banner images the live homepage uses and
// points the homepage's brand tiles at them, instead of standing in with a
// product photo.
//
//   node scripts/seed-brand-tiles.mjs

import {createClient} from '@sanity/client'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) {
  console.error('[brand-tiles] Sanity project id and write token must be set in .env.local')
  process.exit(1)
}
const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

const TILES = [
  {label: 'Gift Sets', file: 'shass-gifts-banner-18-18.jpg', category: 'Gift Sets'},
  {label: 'Wireless Chargers', file: 'shass-gifts-banner-17-1.jpg', category: 'Wireless Chargers'},
  {label: 'Bottle', file: 'shass-gifts-banner-19.jpg', category: 'Bottle'},
  {label: 'Backpacks', file: 'shass-gifts-banner-20-1.jpg', category: 'Backpacks'},
]

const BASE = process.env.PRODUCT_IMAGE_BASE_URL || 'https://www.shassgift.com/storage/'

const cats = await client.fetch(`*[_type == "category" && name in $names]{name, "slug": slug.current}`, {
  names: TILES.map((t) => t.category),
})
const slugByName = new Map(cats.map((c) => [c.name.toLowerCase(), c.slug]))

const featuredBrands = []
for (const [i, tile] of TILES.entries()) {
  const url = BASE + tile.file
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`[brand-tiles] ${tile.file}: HTTP ${res.status} — skipping`)
    continue
  }
  const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {filename: tile.file})
  const slug = slugByName.get(tile.category.toLowerCase())
  featuredBrands.push({
    _key: `brand-${i}`,
    label: tile.label,
    link: slug ? `/products?category=${slug}` : '/products',
    image: {_type: 'imageWithAlt', alt: tile.label, asset: {_type: 'reference', _ref: asset._id}},
  })
  console.log(`[brand-tiles] ${tile.label} → ${asset._id}`)
}

await client.patch('homepage').set({featuredBrands}).commit()
console.log(`[brand-tiles] ${featuredBrands.length} brand tiles set.`)
