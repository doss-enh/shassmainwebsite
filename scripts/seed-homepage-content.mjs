// Loads the homepage copy, section by section, matching the live site's
// structure and wording. Brand tiles and the highlight image are wired to
// real category/product assets already in the dataset.
//
//   node scripts/seed-homepage-content.mjs

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
  console.error('[seed-content] Sanity project id and write token must be set in .env.local')
  process.exit(1)
}
const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

let k = 0
const block = (text) => ({
  _type: 'block',
  _key: `b${k++}`,
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: `s${k++}`, text, marks: []}],
})
const section = (heading, paragraphs = []) => ({heading, body: paragraphs.map(block)})

// Brand tiles point at the four categories the live site features.
const BRAND_TILES = ['Gift Sets', 'Wireless Chargers', 'Bottle', 'Backpacks']

// Prefer the category's own image; several of these categories don't have
// one, so fall back to the first product filed under it that does.
const brandCats = await client.fetch(
  `*[_type == "category" && name in $names]{
     name,
     "slug": slug.current,
     "assetId": coalesce(
       image.asset._ref,
       *[_type == "product" && references(^._id) && defined(featuredImage.asset)][0].featuredImage.asset._ref
     )
   }`,
  {names: BRAND_TILES}
)
const byName = new Map(brandCats.filter((c) => c.assetId).map((c) => [c.name.toLowerCase(), c]))

const featureProduct = await client.fetch(
  `*[_type == "product" && defined(featuredImage.asset)][0]{"assetId": featuredImage.asset._ref, title}`
)

// The nine categories the live site shows in its "Choose Category" row,
// in that order. Referenced explicitly rather than inferred from the tree,
// because the dataset has more top-level categories than the row shows.
const ROW = ['Technology', 'Stationery', 'Premiums', 'Leisure', 'Kids', 'Drinkware', 'Care', 'Bags', 'Apparels']
const rowCats = await client.fetch(`*[_type == "category" && !defined(parent) && name in $names]{_id, name}`, {names: ROW})
const rowById = new Map(rowCats.map((c) => [c.name, c._id]))
const categoryRow = ROW.map((name, i) =>
  rowById.has(name) ? {_key: `row-${i}`, _type: 'reference', _ref: rowById.get(name)} : null
).filter(Boolean)

const patch = {
  categoryRow,

  introOne: section('Why Consider Shass Gift for Personalized Corporate Gifts in Dubai', [
    "We love what we do and it shows in the outstanding customer service we provide. Whether it's functional promotional items such as conference folders, document bags, headphones, and speakers, or customized merchandise solution unique to your business, we have you covered. We pride ourselves in providing high-quality, beautiful promotional merchandise that leaves a lasting impression and helps you compete effectively. Our prices are also very competitive, ensuring you get the best possible value for your investment.",
  ]),

  categoryHeading: 'Choose Category',

  introTwo: section('Largest Corporate & Promotional Gift item Suppliers in Dubai, UAE', [
    'Shass gifts are the one-stop shop where you can find the right corporate gifts and promotional giveaways to showcase your brand positively. Our corporate gift collections present innovations with endless possibilities and are guaranteed to impress everyone. We offer all types of corporate gifts, which can be personalized with your company logo. As a premium corporate gifts supplier, we offer customized products at affordable prices to fit all budgets. Our site offers a unique range of promotional and corporate gifts to guarantee the perfect gifting solutions for your clients or colleagues. We help to build your organizations brand image. Our products are backed by the quick delivery and guaranteed quality.',
  ]),

  brandsHeading: 'Featured Brands',
  featuredBrands: BRAND_TILES.map((name, i) => {
    const cat = byName.get(name.toLowerCase())
    return {
      _key: `brand-${i}`,
      label: name,
      link: cat?.slug ? `/products?category=${cat.slug}` : '/products',
      ...(cat?.assetId
        ? {image: {_type: 'imageWithAlt', alt: name, asset: {_type: 'reference', _ref: cat.assetId}}}
        : {}),
    }
  }),

  exploreSection: section('Explore the Best Corporate Gift Items in Dubai', [
    "Our wide portfolio of corporate gift items in Dubai includes everything from elegant executive sets and premium leather goods to creative desk accessories, eco-friendly giveaways, and luxury hampers. Whether you're rewarding employees, celebrating milestones, or strengthening client relationships, Shass Gifts ensures every product reflects your brand identity with precision and style.",
    'Each piece is carefully sourced, branded, and packaged to meet corporate standards — making us one of the most trusted corporate gift companies in Dubai. Our dedicated design team helps customize gifts to suit your message, season, or event theme, ensuring that your brand is remembered long after the occasion.',
  ]),

  highlightSection: section('Newly Added Promotional Giveaways in Dubai', [
    "Promotional products are often overlooked as a marketing tool, but they are extremely effective for brand recall. Promotional gift items are a great way to keep a company name or logo in people's minds for up to a year.",
    "Branded merchandise is useful for tradeshows, exhibitions, corporate conferences, and awards nights. Giving away corporate gift items to employees and customers is a great way to make a lasting impression. We have a great selection of premium gift items perfect for your next company event. We can print your company's logo and colors to ensure your product is ready in no time.",
  ]),
  highlightImage: featureProduct?.assetId
    ? {_type: 'imageWithAlt', alt: featureProduct.title, asset: {_type: 'reference', _ref: featureProduct.assetId}}
    : undefined,

  valuePropsSection: section('Dubai Corporate Gifts That Speak Your Brand Language', [
    "At Shass Gifts, we believe gifting isn't just about the item — it's about the emotion it conveys. Our curated Dubai corporate gifts collections combine utility, creativity, and class. From modern tech gadgets to timeless stationery, our gifts are designed to delight while showcasing your company's values.",
    'Every order is backed by our promise of quick delivery, dependable quality, and flawless branding — making us a preferred partner for corporate gifts Dubai businesses trust.',
  ]),
  valueProps: [
    {_key: 'vp1', icon: '💎', title: 'Curated Collections', text: 'Handpicked items that reflect quality and taste'},
    {_key: 'vp2', icon: '🚀', title: 'Quick Delivery', text: 'Fast turnaround without compromising quality'},
    {_key: 'vp3', icon: '✨', title: 'Quality Assured', text: 'Every product meets stringent corporate standards'},
  ],

  personalisationSection: section('Personalized Corporate Gifts Dubai — Tailored to Impress', [
    "Add a personal touch that turns a simple gesture into something memorable. Our personalized corporate gifts Dubai range includes custom engraving, embossing, and logo printing — perfect for making each piece distinctly yours. Whether it's a one-off bespoke box for a key client or a bulk order for team rewards, we handle it all with attention to detail and care.",
    "We also understand the importance of maintaining brand consistency. That's why every gift — from color tone to packaging — is aligned with your corporate identity.",
  ]),
  personalisationTags: ['✒️ Custom Engraving', '🖨️ Logo Printing', '👔 Embossing'],

  creativitySection: section('Corporate Promotional Gifts Dubai — Where Creativity Meets Marketing', [
    'Boost your brand visibility at trade shows, expos, and corporate events',
    'Our corporate promotional gifts Dubai selection is designed to boost your brand visibility at trade shows, expos, and corporate events. We help brands choose the right product mix — practical, creative, and cost-effective — to make every campaign memorable.',
  ]),

  whyUsHeading: 'Why Businesses Choose Shass Gifts',
  whyUsCards: [
    {_key: 'w1', icon: '🏆', title: 'Experience & Expertise', text: 'Years in the UAE gifting industry with deep market insight'},
    {_key: 'w2', icon: '⭐', title: 'Authoritativeness', text: 'Trusted by leading brands delivering thousands of orders yearly'},
    {_key: 'w3', icon: '🛡️', title: 'Trustworthiness', text: 'Transparent process, quality materials, consistent delivery'},
    {_key: 'w4', icon: '💡', title: 'Innovation', text: 'Eco-friendly ideas and smart packaging for fresh, relevant gifts'},
  ],

  closingSection: section("Partner with Dubai's Leading Corporate Gift Supplier", [
    'Make every gesture count with Shass Gifts — the go-to name for premium corporate gift items in Dubai, distinctive Dubai corporate gifts, and thoughtful personalized corporate gifts Dubai.',
    'When you think of corporate gifts Dubai, think of Shass — where innovation, craftsmanship, and brand storytelling come together.',
  ]),
  closingCtas: [
    {_key: 'c1', label: 'Get a Quote Today', href: '/contact', style: 'solid'},
    {_key: 'c2', label: 'Browse Catalog', href: '/products', style: 'outline'},
  ],

  clientsSection: section('Trusted by Leading Brands Across the UAE', [
    'We proudly partner with leading UAE companies who rely on us for quality, reliability, and premium corporate gifting solutions.',
  ]),

  faqSection: section('Frequently Asked Questions', [
    "Corporate gifts are a fantastic method to reach the appropriate audience at the right moment with the correct message. Corporate gifts are a useful tool for communicating the company's values of loyalty, appreciation, support, and inspiration to staff members.",
  ]),
}

await client.patch('homepage').set(patch).commit()
console.log('[seed-content] Homepage copy updated.')
console.log(`[seed-content] Category row: ${categoryRow.length}/${ROW.length} matched`)
console.log(`[seed-content] Brand tiles matched to categories: ${brandCats.map((c) => c.name).join(', ') || 'none'}`)
