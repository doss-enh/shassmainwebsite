// Removes the parallel category taxonomy left behind by an earlier import
// (Home & Kitchen, Electronics, Fashion, Beauty & Care …). None of it holds
// products, none of it appears on shassgift.com, and its roots were leaking
// into the footer and product filters. Leaves are removed before their
// parents so no reference is left dangling; anything that still holds a
// product or is referenced elsewhere is skipped rather than forced.
//
//   node scripts/remove-unused-taxonomy.mjs --dry
//   node scripts/remove-unused-taxonomy.mjs --apply

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

// Deepest first, so a parent is only reached once its children are gone.
const SLUGS = [
  'meditation', 'lunch-bags', 'duffle-bag', 'gadgets', 'accessories', 'scented-candles', 'small-appliances',
  'school-supplies', 'baby-care', 'customized-gifts',
  'home-kitchen', 'electronics', 'leisure-travel', 'beauty-care', 'office-stationery', 'sports-fitness', 'fashion',
]

// The "Header category bar" menu (location "mega") lists only this legacy
// taxonomy, and nothing queries that location — the flyout reads
// siteSettings.headerCategories and the nav reads location "main". It has to
// go first or its references keep the categories alive.
const deadMenu = await client.fetch(
  `*[_type=="navigationMenu" && location=="mega"][0]{_id, title, "items": count(items)}`,
)
if (deadMenu) {
  if (APPLY) {
    await client.delete(deadMenu._id)
    console.log(`  removed navigationMenu "${deadMenu.title}" (${deadMenu.items} legacy items, unused location)`)
  } else {
    console.log(`  would remove navigationMenu "${deadMenu.title}" (${deadMenu.items} legacy items, unused location)`)
  }
}

for (const slug of SLUGS) {
  const doc = await client.fetch(
    `*[_type=="category" && slug.current==$slug][0]{_id, name, "products": count(*[_type=="product" && references(^._id)])}`,
    {slug},
  )
  if (!doc) {
    console.log(`  (already absent) ${slug}`)
    continue
  }
  if (doc.products > 0) {
    console.log(`  SKIP ${doc.name} — holds ${doc.products} products`)
    continue
  }
  const refs = await client.fetch(`count(*[references($id)])`, {id: doc._id})
  if (refs > 0) {
    console.log(`  SKIP ${doc.name} — ${refs} documents still reference it`)
    continue
  }
  if (APPLY) {
    await client.delete(doc._id)
    console.log(`  removed ${doc.name} (/${slug})`)
  } else {
    console.log(`  would remove ${doc.name} (/${slug})`)
  }
}

console.log(`\n[taxonomy] categories remaining: ${await client.fetch(`count(*[_type=="category"])`)}`)
if (!APPLY) console.log('[taxonomy] Dry run — nothing written.')
