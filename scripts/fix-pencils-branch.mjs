// The live menu carries two separate Pencils sub-trees — one under
// Stationery (/pencils) and one under Kids (/pen-and-pencils) — with
// different slugs and different products. This dataset only ever had one,
// so this restores the existing branch to Stationery (it holds the
// products and already uses the Stationery slugs) and creates the Kids
// branch alongside it.
//
//   node scripts/fix-pencils-branch.mjs --apply

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

const byName = async (name, parent) =>
  client.fetch(`*[_type=="category" && name==$name${parent ? ' && parent->name==$parent' : ''}][0]._id`, {name, parent})

const stationery = await byName('Stationery')
const kids = await byName('Kids')
const pencils = await client.fetch(`*[_type=="category" && slug.current=="pencils"][0]._id`)

if (!stationery || !kids || !pencils) throw new Error('missing Stationery / Kids / Pencils')

console.log('  Pencils (/pencils) -> Stationery')
console.log('  create Pencils (/pen-and-pencils) -> Kids')
console.log('    create Pencil (/pencil-1)')
console.log('    create Plantable Pencil (/platable-pencil)')

if (!APPLY) {
  console.log('\n[pencils] Dry run — nothing written. Re-run with --apply.')
  process.exit(0)
}

await client.patch(pencils).set({parent: {_type: 'reference', _ref: stationery}}).commit()

const kidsPencils = await client.create({
  _type: 'category',
  name: 'Pencils',
  slug: {_type: 'slug', current: 'pen-and-pencils'},
  parent: {_type: 'reference', _ref: kids},
  sortOrder: 30,
})

for (const [name, slug] of [
  ['Pencil', 'pencil-1'],
  ['Plantable Pencil', 'platable-pencil'],
]) {
  await client.create({
    _type: 'category',
    name,
    slug: {_type: 'slug', current: slug},
    parent: {_type: 'reference', _ref: kidsPencils._id},
    sortOrder: 100,
  })
}

console.log('\n[pencils] Done.')
