import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {activeBannersQuery, allProductsQuery, homepageQuery, allFaqsQuery} from '@sanity-lib/lib/queries'
import {getStorefrontRoots} from '@/lib/storefrontRoots'
import {urlFor} from '@sanity-lib/lib/image'
import {ProductCard} from '@/components/site/ProductCard'
import {HeroCarousel, type HeroSlide} from '@/components/site/HeroCarousel'
import {
  CopyBand,
  FeaturedBrands,
  HighlightBand,
  IconCards,
  TagPills,
  CtaButtons,
  ClientLogos,
} from '@/components/site/HomeSections'
import {VideoStrip} from '@/components/site/VideoStrip'

export const revalidate = 60

type Banner = {
  _id: string
  heading?: string
  subheading?: string
  title?: string
  cta?: {label?: string; href?: string}
  image?: {desktop?: any}
}
type Category = {_id: string; name: string; slug?: {current: string}; image?: any}
type Product = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: any
  featured?: boolean
  newProduct?: boolean
  colors?: string[]
  category?: {name: string}
}
type Faq = {_id: string; question: string; answer: string}

async function getHomeData() {
  try {
    const [banners, categories, products, home, faqs] = await Promise.all([
      client.fetch<Banner[]>(activeBannersQuery, {placement: 'homepage-hero'}),
      getStorefrontRoots(),
      client.fetch<Product[]>(allProductsQuery),
      client.fetch<any>(homepageQuery),
      client.fetch<Faq[]>(allFaqsQuery),
    ])
    return {
      banners,
      home,
      faqs,
      // The row is curated in Studio; fall back to top-level categories.
      categories: (home?.categoryRow?.length ? home.categoryRow : categories).slice(0, 9) as Category[],
      featured: products.filter((p) => p.featured).slice(0, 12),
    }
  } catch {
    return {
      banners: [] as Banner[],
      home: null as any,
      faqs: [] as Faq[],
      categories: [] as Category[],
      featured: [] as Product[],
    }
  }
}

const fallbackSlide: HeroSlide = {
  id: 'fallback',
  heading: 'Your Business Promotion Tool',
  subheading: 'Branded merchandise and corporate gifts, sourced and personalised for your brand.',
  ctaLabel: 'Browse products',
  href: '/products',
}

export default async function HomePage() {
  const {banners, home, faqs, categories, featured} = await getHomeData()

  const slides: HeroSlide[] =
    banners.length > 0
      ? banners.map((b) => ({
          id: b._id,
          image: urlFor(b.image?.desktop)?.width(2560).quality(85).auto('format').url(),
          alt: b.image?.desktop?.alt || b.title,
          href: b.cta?.href?.replace('/collections/', '/products') || '/products',
          heading: b.heading || b.title,
          subheading: b.subheading,
          ctaLabel: b.cta?.label,
        }))
      : [fallbackSlide]

  return (
    <div>
      {/* 1 — Hero, continuing the header's gradient band */}
      <HeroCarousel slides={slides} />

      <div className="bg-white">
        {/* 2 — Intro copy */}
        <CopyBand section={home?.introOne} />

        {/* 3 — Category row */}
        {categories.length > 0 && (
          <section className="site-container py-10">
            <h2 className="site-h2 mb-5 text-[#212529]">{home?.categoryHeading || 'Choose Category'}</h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
              {categories.map((c) => {
                const img = urlFor(c.image)?.width(180).height(180).url()
                return (
                  <Link key={c._id} href={`/products?category=${c.slug?.current}`} className="group text-center">
                    <div className="aspect-square overflow-hidden rounded-sm border border-neutral-200 bg-white p-2 transition-shadow group-hover:shadow-md">
                      {img && <img src={img} alt="" className="h-full w-full object-contain" />}
                    </div>
                    <div className="mt-2 truncate text-[11px] font-medium text-neutral-700 group-hover:text-primary">{c.name}</div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* 4 — Second intro copy block */}
        <CopyBand section={home?.introTwo} size="hero" />

        {/* 5 — Featured brands */}
        <FeaturedBrands heading={home?.brandsHeading} tiles={home?.featuredBrands} />

        {/* 6 — Light band */}
        {(home?.exploreSection?.heading || home?.exploreSection?.body) && (
          <div className="bg-[#f4f5fb]">
            <CopyBand section={home.exploreSection} />
          </div>
        )}

        {/* 7 — Gradient highlight band */}
        <HighlightBand section={home?.highlightSection} image={home?.highlightImage} />

        {/* 8 — Value props */}
        {(home?.valuePropsSection?.heading || home?.valueProps?.length) && (
          <CopyBand section={home?.valuePropsSection}>
            <IconCards cards={home?.valueProps} />
          </CopyBand>
        )}

        {/* 9 — Personalisation band */}
        {(home?.personalisationSection?.heading || home?.personalisationTags?.length) && (
          <div className="bg-site-secondary">
            <CopyBand section={home?.personalisationSection} tone="dark">
              <TagPills tags={home?.personalisationTags} />
            </CopyBand>
          </div>
        )}

        {/* 10 — Creativity band */}
        <CopyBand section={home?.creativitySection} />

        {/* 11 — Why businesses choose us */}
        {(home?.whyUsHeading || home?.whyUsCards?.length) && (
          <div className="bg-neutral-800">
            <CopyBand section={{heading: home?.whyUsHeading}} tone="dark">
              <IconCards cards={home?.whyUsCards} tone="dark" columns={4} />
            </CopyBand>
          </div>
        )}

        {/* 12 — Closing CTA + video strip */}
        {(home?.closingSection?.heading || home?.closingCtas?.length || home?.videos?.length) && (
          <CopyBand section={home?.closingSection}>
            <CtaButtons buttons={home?.closingCtas} />
            <VideoStrip videos={home?.videos} />
          </CopyBand>
        )}

        {/* 13 — Featured products */}
        {featured.length > 0 && (
          <div className="bg-neutral-50">
            <section className="site-container py-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="site-h2 text-[#212529]">Featured products</h2>
                <Link href="/products" className="text-[13px] font-medium text-primary hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                {featured.slice(0, 10).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 14 — Clients */}
        {(home?.clientsSection?.heading || home?.clientLogos?.length) && (
          <CopyBand section={home?.clientsSection}>
            <ClientLogos logos={home?.clientLogos} />
          </CopyBand>
        )}

        {/* 15 — FAQs */}
        {faqs.length > 0 && (
          <CopyBand section={home?.faqSection ?? {heading: 'Frequently Asked Questions'}}>
            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {faqs.map((faq) => (
                <details key={faq._id} className="group rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-neutral-900 marker:content-none">
                    {faq.question}
                    <span className="ml-2 shrink-0 text-neutral-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[13px] text-neutral-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </CopyBand>
        )}
      </div>
    </div>
  )
}
