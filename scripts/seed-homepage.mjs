// Creates (or refreshes) the homepage singleton so every band on the page
// has content to render. Headings and card titles are set here; the body
// copy is deliberately short and generic — replace it with your own wording
// in Studio, which is exactly what this document exists for.
//
//   node scripts/seed-homepage.mjs           # create if missing
//   node scripts/seed-homepage.mjs --force   # overwrite existing content

import {createClient} from '@sanity/client'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({path: path.join(__dirname, '..', '.env.local'), quiet: true})

const FORCE = process.argv.includes('--force')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) {
  console.error('[seed-homepage] Sanity project id and write token must be set in .env.local')
  process.exit(1)
}

const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

let key = 0
const block = (text) => ({
  _type: 'block',
  _key: `b${key++}`,
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: `s${key++}`, text, marks: []}],
})
const section = (heading, paragraphs) => ({heading, body: paragraphs.map(block)})
const imageRef = (id, alt) => (id ? {_type: 'imageWithAlt', alt, asset: {_type: 'reference', _ref: id}} : undefined)

// Pull real imagery so the bands aren't empty frames.
const categories = await client.fetch(
  `*[_type == "category" && defined(image.asset)][0...4]{name, "assetId": image.asset._ref, "slug": slug.current}`
)
const featureProduct = await client.fetch(
  `*[_type == "product" && defined(featuredImage.asset)][0]{"assetId": featuredImage.asset._ref, title}`
)

const doc = {
  _id: 'homepage',
  _type: 'homepage',

  introOne: section('Why Choose Shass Gift for Corporate Gifting', [
    'We supply branded merchandise and corporate gifts to businesses across the UAE, from everyday promotional items to premium executive pieces.',
    'Every order is sourced, branded and packed to a consistent standard, so what reaches your client or your team reflects your brand properly.',
  ]),

  categoryHeading: 'Choose Category',

  introTwo: section('Corporate & Promotional Gift Suppliers in Dubai', [
    'Our range spans technology, drinkware, bags, stationery, apparel and more — all of it customisable with your logo.',
    'Tell us the occasion, the quantity and the budget, and we will come back with options and a quotation.',
  ]),

  brandsHeading: 'Featured Brands',
  featuredBrands: categories.slice(0, 4).map((c, i) => ({
    _key: `brand-${i}`,
    label: c.name,
    link: `/products?category=${c.slug}`,
    image: imageRef(c.assetId, c.name),
  })),

  exploreSection: section('Explore the Range', [
    'From desk accessories and drinkware to bags, tech and eco-friendly giveaways, the catalogue is built around what corporate buyers actually order.',
    'Browse by category, add what interests you to a quote list, and send it over — we will price it and confirm lead times.',
  ]),

  highlightSection: section('Newly Added Promotional Giveaways', [
    'New lines are added throughout the year, with an emphasis on practical items people keep and use.',
    'Branded merchandise works hardest at trade shows, conferences and staff events, where a useful item keeps your name in circulation long after the day itself.',
  ]),
  highlightImage: imageRef(featureProduct?.assetId, featureProduct?.title),

  valuePropsSection: section('What You Get Working With Us', []),
  valueProps: [
    {_key: 'vp1', icon: '📦', title: 'Wide Selection', text: 'Thousands of items across every category, updated regularly.'},
    {_key: 'vp2', icon: '🎨', title: 'Custom Branding', text: 'Your logo applied cleanly across materials and finishes.'},
    {_key: 'vp3', icon: '🤝', title: 'Personal Service', text: 'A dedicated contact who follows your order end to end.'},
  ],

  personalisationSection: section('Personalised Corporate Gifts', [
    'Engraving, embossing and logo printing turn a standard item into something that carries your brand properly.',
    'We handle single bespoke pieces for a key client and bulk runs for a whole team with the same attention.',
  ]),
  personalisationTags: ['Custom Engraving', 'Logo Printing', 'Embossing'],

  creativitySection: section('Promotional Gifts That Support Your Marketing', [
    'The right product mix makes a campaign memorable — practical, well made, and priced so you can give it away at scale.',
  ]),

  whyUsHeading: 'Why Businesses Choose Us',
  whyUsCards: [
    {_key: 'w1', icon: '🏆', title: 'Experience', text: 'Years supplying corporate gifts across the UAE market.'},
    {_key: 'w2', icon: '⭐', title: 'Reliability', text: 'Orders delivered complete, branded correctly, on schedule.'},
    {_key: 'w3', icon: '🛡️', title: 'Quality', text: 'Materials and print checked before anything ships.'},
    {_key: 'w4', icon: '💡', title: 'Fresh Ideas', text: 'New and eco-friendly lines added through the year.'},
  ],

  closingSection: section('Partner With a Dedicated Gifting Team', [
    'Tell us what the occasion is and we will put options in front of you, with pricing and lead times.',
  ]),
  closingCtas: [
    {_key: 'c1', label: 'Get a Quote', href: '/contact', style: 'solid'},
    {_key: 'c2', label: 'Browse Catalogue', href: '/products', style: 'outline'},
  ],

  clientsSection: section('Trusted by Businesses Across the UAE', [
    'We work with companies of every size, from startups placing a first order to groups running annual gifting programmes.',
  ]),

  faqSection: section('Frequently Asked Questions', [
    'The questions we are asked most often about ordering, branding and delivery.',
  ]),
}

const existing = await client.fetch(`*[_type == "homepage"][0]{_id}`)
if (existing && !FORCE) {
  console.log(`[seed-homepage] A homepage document already exists (${existing._id}). Re-run with --force to overwrite.`)
  process.exit(0)
}

await client.createOrReplace(doc)
console.log('[seed-homepage] Homepage document written.')
console.log(`[seed-homepage] ${doc.featuredBrands.length} brand tiles, highlight image: ${doc.highlightImage ? 'yes' : 'none'}`)
console.log('[seed-homepage] Edit the copy at /studio → Homepage.')
