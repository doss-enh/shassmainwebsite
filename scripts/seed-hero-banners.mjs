// Creates the homepage hero slides from the four banner images the live
// slider rotates through. The artwork carries its own headline and product
// collage, so the slide is the image — there's no text overlay to compose.
//
//   node scripts/seed-hero-banners.mjs

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
  console.error('[hero] Sanity project id and write token must be set in .env.local')
  process.exit(1)
}
const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

const BASE = process.env.PRODUCT_IMAGE_BASE_URL || 'https://www.shassgift.com/storage/'

const SLIDES = [
  {id: 'hero-1', file: 'shass-gifts-banner-23.jpg', title: 'Back to School', href: '/products'},
  {id: 'hero-2', file: 'shass-gifts-banner-11-2.jpg', title: 'Promotional Gifts', href: '/products'},
  {id: 'hero-3', file: 'shass-gifts-banner-15-2.jpg', title: 'Corporate Gifting', href: '/products'},
  {id: 'hero-4', file: 'shass-gifts-banner-16-16.jpg', title: 'Limited Offer', href: '/products'},
]

// Retire the placeholder banner so the slider shows only real artwork.
const existing = await client.fetch(
  `*[_type == "banner" && placement == "homepage-hero" && !(_id in path("drafts.**"))]{_id, title}`
)

let order = 0
for (const slide of SLIDES) {
  const url = BASE + slide.file
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`[hero] ${slide.file}: HTTP ${res.status} — skipping`)
    continue
  }
  const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {filename: slide.file})

  await client.createOrReplace({
    _id: slide.id,
    _type: 'banner',
    title: slide.title,
    placement: 'homepage-hero',
    active: true,
    sortOrder: ++order,
    cta: {label: 'Shop Now', href: slide.href},
    image: {
      _type: 'responsiveImage',
      desktop: {_type: 'imageWithAlt', alt: slide.title, asset: {_type: 'reference', _ref: asset._id}},
    },
  })
  console.log(`[hero] ${slide.title} → ${asset._id}`)
}

for (const old of existing) {
  if (SLIDES.some((s) => s.id === old._id)) continue
  await client.patch(old._id).set({active: false}).commit()
  console.log(`[hero] deactivated old banner: ${old.title}`)
}

console.log(`[hero] ${order} hero slides ready.`)
