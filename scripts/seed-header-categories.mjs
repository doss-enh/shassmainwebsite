// Curates the Product Categories flyout to the nine top-level categories the
// live header shows, in that order. The dataset has more top-level
// categories than the menu is meant to list.
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

const ORDER = ['Technology', 'Stationery', 'Premiums', 'Leisure', 'Kids', 'Drinkware', 'Care', 'Bags', 'Apparels']
const cats = await client.fetch(`*[_type == "category" && !defined(parent) && name in $names]{_id, name}`, {names: ORDER})
const byName = new Map(cats.map((c) => [c.name, c._id]))

const refs = ORDER.filter((n) => byName.has(n)).map((n, i) => ({
  _key: `hcat-${i}`,
  _type: 'reference',
  _ref: byName.get(n),
}))

const id = await client.fetch(`*[_type == "siteSettings"][0]._id`)
await client.patch(id).set({headerCategories: refs}).commit()
console.log(`[header-cats] ${refs.length}/${ORDER.length} set: ${ORDER.filter((n) => byName.has(n)).join(', ')}`)
