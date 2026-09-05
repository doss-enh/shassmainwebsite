// Aligns the header's secondary nav with the live site: adds the missing
// Clients entry and repoints hrefs at this app's routes (the values carried
// over from WordPress — /blogs/ etc. — don't resolve here).
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

const ITEMS = [
  {label: 'About us', href: '/about-us'},
  {label: 'Blogs', href: '/blog'},
  {label: 'Clients', href: '/clients'},
  {label: 'FAQs', href: '/faqs'},
  {label: 'Contact', href: '/contact'},
]

const id = await client.fetch(`*[_type == "navigationMenu" && location == "main"][0]._id`)
if (!id) {
  console.error('[nav] No navigationMenu with location "main" found.')
  process.exit(1)
}

await client
  .patch(id)
  .set({
    items: ITEMS.map((it, i) => ({
      _key: `nav-${i}`,
      _type: 'navItem',
      label: it.label,
      href: it.href,
      linkType: 'custom',
      visible: true,
      children: [],
    })),
  })
  .commit()

console.log(`[nav] ${ITEMS.length} items set on ${id}: ${ITEMS.map((i) => i.label).join(', ')}`)
