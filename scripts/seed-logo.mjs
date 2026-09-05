// Replaces the site logo with the wordmark the live header uses (348x160,
// which includes the tagline lockup) so the header renders at the same
// proportions.
import {createClient} from '@sanity/client'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const url = (process.env.PRODUCT_IMAGE_BASE_URL || 'https://www.shassgift.com/storage/') + 'new-project.png'
const res = await fetch(url)
if (!res.ok) {
  console.error(`[logo] HTTP ${res.status} for ${url}`)
  process.exit(1)
}
const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {filename: 'shass-logo.png'})
const id = await client.fetch(`*[_type == "siteSettings"][0]._id`)
await client.patch(id).set({logo: {_type: 'imageWithAlt', alt: 'Shass Gift', asset: {_type: 'reference', _ref: asset._id}}}).commit()
console.log(`[logo] ${asset._id} set on ${id}`)
