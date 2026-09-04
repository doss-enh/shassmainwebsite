import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {homepageBannerQuery, allCategoriesQuery, allProductsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {ProductCard} from '@/components/site/ProductCard'

export const revalidate = 60

type Slide = {_key: string; title?: string; subtitle?: string; ctaLabel?: string; ctaLink?: string; image?: any}
type Category = {_id: string; name: string; slug?: {current: string}; image?: any}
type Product = {
  _id: string
  name: string
  slug?: {current: string}
  image?: any
  status: string
  featured?: boolean
  category?: {name: string}
}

async function getHomeData() {
  try {
    const [banner, categories, products] = await Promise.all([
      client.fetch<{slides?: Slide[]} | null>(homepageBannerQuery),
      client.fetch<Category[]>(allCategoriesQuery),
      client.fetch<Product[]>(allProductsQuery),
    ])
    return {
      slides: banner?.slides || [],
      categories: categories.slice(0, 9),
      featured: products.filter((p) => p.status === 'live').slice(0, 8),
    }
  } catch {
    return {slides: [] as Slide[], categories: [] as Category[], featured: [] as Product[]}
  }
}

const whyUs = [
  {icon: '💎', title: 'Curated Collections', desc: 'Handpicked items that reflect quality and taste.'},
  {icon: '🚀', title: 'Quick Turnaround', desc: 'Fast quotes and production without compromising quality.'},
  {icon: '✨', title: 'Quality Assured', desc: 'Every product meets our own corporate standards.'},
]

export default async function HomePage() {
  const {slides, categories, featured} = await getHomeData()
  const hero = slides[0]
  const heroTiles = featured.slice(0, 9)

  return (
    <div>
      <section className="site-hero-gradient relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-2">
          <div className="text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {hero?.title || 'Your Business Promotion Tool'}
            </h1>
            <p className="mt-4 max-w-md text-white/85">
              {hero?.subtitle ||
                "Branded merchandise and corporate gifts, sourced and personalized for your brand. Add products to your quote list and we'll get back to you fast."}
            </p>
            <Link
              href={hero?.ctaLink || '/products'}
              className="mt-7 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90"
            >
              {hero?.ctaLabel || 'Browse products'}
            </Link>
          </div>

          {heroTiles.length > 0 && (
            <div className="hidden grid-cols-3 gap-3 md:grid">
              {heroTiles.map((p, i) => {
                const img = urlFor(p.image)?.width(200).height(200).url()
                return (
                  <div
                    key={p._id}
                    className="aspect-square overflow-hidden rounded-2xl bg-white/10 shadow-lg"
                    style={{transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`}}
                  >
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-6 text-center text-2xl font-semibold text-neutral-900">Choose a category</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
            {categories.map((c) => {
              const img = urlFor(c.image)?.width(160).height(160).url()
              return (
                <Link key={c._id} href={`/products?category=${c.slug?.current}`} className="group text-center">
                  <div className="mx-auto aspect-square w-full overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
                    {img && <img src={img} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  </div>
                  <div className="mt-2 truncate text-xs font-medium text-neutral-700 group-hover:text-primary">{c.name}</div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          {whyUs.map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-3xl">{item.icon}</div>
              <div className="mt-3 text-base font-semibold text-neutral-900">{item.title}</div>
              <p className="mt-1 text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-neutral-900">Featured products</h2>
            <Link href="/products" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="site-hero-gradient">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center text-white">
          <h2 className="text-2xl font-semibold">Partner with a dedicated corporate gifting team</h2>
          <p className="max-w-xl text-white/85">Browse the catalogue, add what you need, and send us your enquiry — we'll quote you directly.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90">
              Browse products
            </Link>
            <Link href="/contact" className="rounded-md border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Get a quote
            </Link>
          </div>
        </div>
      </section>

      {categories.length === 0 && featured.length === 0 && (
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Products are coming soon</h2>
          <p className="mt-2 text-neutral-600">Connect a Sanity project and add products to populate this page.</p>
        </section>
      )}
    </div>
  )
}
