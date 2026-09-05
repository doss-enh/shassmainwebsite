import Link from 'next/link'
import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {productBySlugQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {ProductGallery} from '@/components/site/ProductGallery'
import {ProductPurchasePanel} from '@/components/site/ProductPurchasePanel'
import {ShareLinks} from '@/components/site/ShareLinks'
import {PortableText} from '@/components/site/PortableText'
import {Breadcrumb} from '@/components/site/Breadcrumb'
import {ProductCard} from '@/components/site/ProductCard'

export const revalidate = 60

type Cat = {name: string; slug?: {current: string}; parent?: Cat}

type Product = {
  _id: string
  title: string
  slug: {current: string}
  sku?: string
  featuredImage?: any
  gallery?: any[]
  shortDescription?: string
  description?: any[]
  minimumOrderQuantity?: number
  colors?: string[]
  variantAxes?: {name: string; values?: string[]}[]
  variants?: {sku?: string; isDefault?: boolean; stockStatus?: string; options?: {name: string; value: string}[]}[]
  category?: Cat
  additionalCategories?: Cat[]
  related?: {_id: string; title: string; sku?: string; slug?: {current: string}; featuredImage?: any}[]
}

async function getProduct(slug: string) {
  try {
    return await client.fetch<Product | null>(productBySlugQuery, {slug})
  } catch {
    return null
  }
}

/** Root-first ancestry, e.g. Technology → USB Flash Drives → Eco-Friendly USB. */
function ancestry(cat?: Cat): Cat[] {
  const chain: Cat[] = []
  for (let c = cat; c; c = c.parent) chain.unshift(c)
  return chain
}

const catHref = (c: Cat) => (c.slug?.current ? `/products?category=${c.slug.current}` : '/products')

// Matches the live product page's right-hand card.
const ASSURANCES = [
  {title: 'Free Shipping', text: 'For all over UAE', d: 'M3 12h11V6H3v6zm11 0h3l3 3v3h-6v-6zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'},
  {title: 'E - Catalogue', text: 'Promotional Products', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6'},
  {title: 'Secure Payment', text: 'Guarantee secure payments', d: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z'},
]

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.title,
    description: product.shortDescription?.slice(0, 160),
  }
}

export default async function ProductDetailPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const images = [product.featuredImage, ...(product.gallery || [])].filter(Boolean)
  const heroImage = urlFor(images[0])?.width(700).height(700).url()
  const chain = ancestry(product.category)

  // Live lists the whole ancestry plus any extra categories, de-duplicated.
  const metaCats: Cat[] = []
  for (const c of [...chain, ...(product.additionalCategories || [])]) {
    if (!metaCats.some((x) => x.name === c.name)) metaCats.push(c)
  }

  return (
    <div className="bg-white">
      <Breadcrumb
        trail={[
          {label: 'Products', href: '/products'},
          ...chain.map((c) => ({label: c.name, href: catHref(c)})),
          {label: product.title},
        ]}
      />

      <div className="site-container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)_240px]">
          <ProductGallery images={images} title={product.title} />

          <div className="min-w-0">
            {/* 20px / 400 Montserrat, as measured on the live page. */}
            <h1 className="font-heading text-xl font-normal text-[#212529]">{product.title}</h1>

            {product.shortDescription && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-600">{product.shortDescription}</p>
            )}

            <ProductPurchasePanel
              productId={product._id}
              title={product.title}
              slug={product.slug.current}
              image={heroImage}
              sku={product.sku}
              colors={product.colors || []}
              axes={product.variantAxes || []}
              variants={product.variants || []}
              minimumOrderQuantity={product.minimumOrderQuantity}
            />

            <div className="mt-6 space-y-1.5 text-[13px] text-neutral-600">
              {product.sku && (
                <div>
                  <span className="mr-1 text-neutral-500">SKU:</span>
                  <span className="text-neutral-800">{product.sku}</span>
                </div>
              )}
              {metaCats.length > 0 && (
                <div>
                  <span className="mr-1 text-neutral-500">Categories:</span>
                  {metaCats.map((c, i) => (
                    <span key={`${c.name}-${i}`}>
                      {i > 0 && ', '}
                      <Link href={catHref(c)} className="text-primary hover:underline">
                        {c.name}
                      </Link>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ShareLinks path={`/products/${product.slug.current}`} title={product.title} />
          </div>

          <aside className="rounded-md bg-[#f7f8fa] p-5">
            <ul className="space-y-6">
              {ASSURANCES.map((a) => (
                <li key={a.title} className="flex gap-3">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 shrink-0 text-primary">
                    <path d={a.d} />
                  </svg>
                  <div>
                    <div className="font-heading text-[15px] font-bold text-neutral-900">{a.title}</div>
                    <div className="text-[13px] text-neutral-500">{a.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {product.description && (
          <section className="mt-14">
            <div className="border-b border-neutral-200">
              <span className="inline-block border-b-2 border-primary pb-2 text-base font-semibold text-neutral-900">Description</span>
            </div>
            <div className="prose prose-neutral mt-5 max-w-none text-sm text-neutral-600">
              <PortableText value={product.description} />
            </div>
          </section>
        )}

        {product.related && product.related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading text-2xl font-bold text-neutral-900">Related products</h2>
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {product.related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
