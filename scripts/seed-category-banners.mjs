// Pulls each top-level category's listing banner from the live site. Live
// serves one banner per root (shass-gifts-banner-08-05 through -08-13, in
// root order) and every sub-category inherits its root's, which is why only
// the nine roots carry the field.
//
//   node scripts/seed-category-banners.mjs --apply

import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
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

const BANNERS = {
  Technology: 'shass-gifts-banner-08-05.jpg',
  Stationery: 'shass-gifts-banner-08-06.jpg',
  Premiums: 'shass-gifts-banner-08-07.jpg',
  Leisure: 'shass-gifts-banner-08-08.jpg',
  Kids: 'shass-gifts-banner-08-09.jpg',
  Drinkware: 'shass-gifts-banner-08-10.jpg',
  Care: 'shass-gifts-banner-08-11.jpg',
  Bags: 'shass-gifts-banner-08-12.jpg',
  Apparels: 'shass-gifts-banner-08-13.jpg',
}

for (const [name, file] of Object.entries(BANNERS)) {
  const doc = await client.fetch(`*[_type=="category" && name==$name && !defined(parent)][0]{_id, "has": defined(banner)}`, {name})
  if (!doc) {
    console.log(`  SKIP ${name} — no root category document`)
    continue
  }
  const url = `https://www.shassgift.com/storage/${file}`
  if (!APPLY) {
    console.log(`  would set ${name} -> ${file}${doc.has ? ' (replacing)' : ''}`)
    continue
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.log(`  FAIL ${name} — ${res.status} on ${file}`)
    continue
  }
  const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {filename: file})
  await client
    .patch(doc._id)
    .set({banner: {_type: 'imageWithAlt', alt: `${name} corporate gifts`, asset: {_type: 'reference', _ref: asset._id}}})
    .commit()
  console.log(`  ${name} -> ${file}`)
}

if (!APPLY) console.log('\n[banners] Dry run — nothing written.')
