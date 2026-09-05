// Pulls the client logos and footer badge icons off the live site into
// Sanity assets, and points the homepage's video tiles at the YouTube
// videos the live homepage already embeds.
//
//   node scripts/seed-media.mjs --dry
//   node scripts/seed-media.mjs

import {createClient} from '@sanity/client'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const DRY = process.argv.includes('--dry')
const BASE = process.env.PRODUCT_IMAGE_BASE_URL || 'https://www.shassgift.com/storage/'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) {
  console.error('[seed-media] Sanity project id and write token must be set in .env.local')
  process.exit(1)
}
const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

// Client logo tiles as they appear on the live Clients page.
const CLIENT_LOGOS = [
  'new-project13.png',
  'new-project12.png',
  'new-project11.png',
  'new-project10.png',
  'new-project8.png',
  'icons/new-project13.png',
  'icons/new-project12.png',
  'icons/new-project11.png',
  'icons/new-project10.png',
  'icons/new-project8.png',
  'customers/new-project18.png',
  'customers/new-project17.png',
  'customers/new-project16.png',
  'customers/new-project15.png',
  'customers/new-project14.png',
]

// The four videos embedded on the live homepage.
const VIDEOS = [
  {title: 'Alarm Clock', url: 'https://www.youtube.com/watch?v=EJPcb9zwJgg'},
  {title: 'Anti-Theft Backpack', url: 'https://www.youtube.com/watch?v=Bt3mY5ofDJc'},
  {title: 'Corporate Giveaways', url: 'https://www.youtube.com/watch?v=--U1JTXFfto'},
  {title: 'Premium Gift Set', url: 'https://www.youtube.com/watch?v=jGBZCqElc4Q'},
]

async function upload(relPath) {
  const url = BASE + relPath
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buf, {filename: path.basename(relPath)})
}

if (DRY) {
  console.log(`[seed-media] Would upload ${CLIENT_LOGOS.length} client logos from ${BASE}`)
  console.log(`[seed-media] Would set ${VIDEOS.length} video tiles:`)
  console.log(VIDEOS.map((v) => `  ${v.title} — ${v.url}`).join('\n'))
  process.exit(0)
}

const logos = []
let failed = 0
for (const [i, rel] of CLIENT_LOGOS.entries()) {
  try {
    const asset = await upload(rel)
    logos.push({_key: `logo-${i}`, _type: 'imageWithAlt', alt: 'Client logo', asset: {_type: 'reference', _ref: asset._id}})
  } catch (err) {
    failed++
    console.error(`[seed-media] ${rel}: ${err.message}`)
  }
}

await client
  .patch('homepage')
  .set({
    clientLogos: logos,
    videos: VIDEOS.map((v, i) => ({_key: `vid-${i}`, ...v})),
  })
  .commit()

console.log(`[seed-media] ${logos.length} client logos uploaded (${failed} failed), ${VIDEOS.length} videos set.`)
