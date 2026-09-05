import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {activeBannersQuery, allCategoriesQuery, allProductsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {ProductCard} from '@/components/site/ProductCard'
import {HeroCarousel, type HeroSlide} from '@/components/site/HeroCarousel'

export const revalidate = 60

type Banner = {_id: string; heading?: string; subheading?: string; title?: string; cta?: {label?: string; href?: string}}
type Category = {_id: string; name: string; slug?: {current: string}; image?: any}
type Product = {
  _id: string
  title: string
  slug?: {current: string}
  featuredImage?: any
  featured?: boolean
  category?: {name: string}
}

async function getHomeData() {
  try {
    const [banners, categories, products] = await Promise.all([
      client.fetch<Banner[]>(activeBannersQuery, {placement: 'homepage-hero'}),
      client.fetch<Category[]>(allCategoriesQuery),
      client.fetch<Product[]>(allProductsQuery),
    ])
    return {
      banners,
      categories: categories.filter((c) => !!c.image).slice(0, 9),
      featured: products.filter((p) => p.featured).slice(0, 8),
      gridImages: products
        .map((p) => urlFor(p.featuredImage)?.width(220).height(220).url())
        .filter((u): u is string => !!u)
        .slice(0, 9),
    }
  } catch {
    return {banners: [] as Banner[], categories: [] as Category[], featured: [] as Product[], gridImages: [] as string[]}
  }
}

const whyUs = [
  {icon: '📦', title: 'Wide Selection', desc: 'Thousands of items across every category, updated regularly.'},
  {icon: '🎨', title: 'Custom Branding', desc: 'Your logo applied cleanly across materials and finishes.'},
  {icon: '🤝', title: 'Personal Service', desc: "A dedicated contact who follows your order end to end."},
]

const fallbackSlide: HeroSlide = {
  id: 'fallback',
  heading: 'Your Business Promotion Tool',
  subheading:
    "Branded merchandise and corporate gifts, sourced and personalized for your brand. Add products to your quote list and we'll get back to you fast.",
  ctaLabel: 'Browse products',
  ctaHref: '/products',
}

export default async function HomePage() {
  const {banners, categories, featured, gridImages} = await getHomeData()

  const slides: HeroSlide[] =
    banners.length > 0
      ? banners.map((b) => ({
          id: b._id,
          heading: b.heading || b.title || fallbackSlide.heading,
          subheading: b.subheading,
          ctaLabel: b.cta?.label || fallbackSlide.ctaLabel,
          ctaHref: b.cta?.href?.replace('/collections/', '/products') || fallbackSlide.ctaHref,
        }))
      : [fallbackSlide]

  return (
    <div>
      <HeroCarousel slides={slides} gridImages={gridImages} />

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">Choose category</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
            {categories.map((c) => {
              const img = urlFor(c.image)?.width(160).height(160).url()
              return (
                <Link
                  key={c._id}
                  href={`/products?category=${c.slug?.current}`}
                  className="group flex flex-col items-center gap-2 rounded-sm border border-neutral-200 p-3 text-center hover:border-primary hover:shadow-sm"
                >
                  <div className="aspect-square w-full overflow-hidden bg-neutral-50">
                    {img && <img src={img} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  </div>
                  <div className="truncate text-xs font-medium uppercase text-neutral-700 group-hover:text-primary">{c.name}</div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
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
        <section className="mx-auto max-w-6xl px-4 pb-16">
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
    </div>
  )
}
