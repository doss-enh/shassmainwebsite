// Gives every product a minimum order quantity of 100.
//
// Only 20 of 1,677 carried one, so the product page's MOQ line was almost
// never shown. 100 is the house default; anything set deliberately in Studio
// or the console stays put unless --overwrite is passed.
//
//   node scripts/set-default-moq.mjs --dry
//   node scripts/set-default-moq.mjs --apply [--overwrite]

import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
import {config} from 'dotenv'

config({path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), quiet: true})

const APPLY = process.argv.includes('--apply')
const OVERWRITE = process.argv.includes('--overwrite')
const DEFAULT_MOQ = 100

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const filter = OVERWRITE
  ? `*[_type=="product" && !(_id in path("drafts.**")) && minimumOrderQuantity != ${DEFAULT_MOQ}]`
  : `*[_type=="product" && !(_id in path("drafts.**")) && !defined(minimumOrderQuantity)]`

const targets = await client.fetch(`${filter}{_id, title, minimumOrderQuantity}`)

console.log(`[moq] ${targets.length} products to set to ${DEFAULT_MOQ}${OVERWRITE ? ' (overwriting existing values)' : ' (leaving existing values alone)'}`)
if (!OVERWRITE) {
  const kept = await client.fetch(`count(*[_type=="product" && defined(minimumOrderQuantity)])`)
  console.log(`[moq] ${kept} already carry a value and are untouched`)
}

if (!APPLY) {
  targets.slice(0, 5).forEach((p) => console.log(`   ${p.title} (was ${p.minimumOrderQuantity ?? 'unset'})`))
  console.log('\n[moq] Dry run — nothing written.')
  process.exit(0)
}

// Batched: 1,600-odd individual patches is a long round trip each.
let done = 0
const BATCH = 50
for (let i = 0; i < targets.length; i += BATCH) {
  const slice = targets.slice(i, i + BATCH)
  const tx = slice.reduce(
    (acc, p) => acc.patch(p._id, (patch) => patch.set({minimumOrderQuantity: DEFAULT_MOQ})),
    client.transaction(),
  )
  await tx.commit()
  done += slice.length
  if (done % 250 === 0 || done === targets.length) console.log(`  ${done}/${targets.length}`)
}
console.log(`\n[moq] Set ${done} products to ${DEFAULT_MOQ}.`)
