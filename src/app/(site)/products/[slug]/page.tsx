import Link from 'next/link'
import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {productBySlugQuery, siteSettingsQuery} from '@sanity-lib/lib/queries'
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
  faqs?: {question: string; answer: string}[]
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

// Icon shapes stay in code — the copy is editable in Studio under
// Site Settings, and each entry names one of these.
const ASSURANCE_ICONS: Record<string, string> = {
  shipping: 'M3 12h11V6H3v6zm11 0h3l3 3v3h-6v-6zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  catalogue: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6',
  secure: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z',
  support: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
}

type Assurance = {icon?: string; title?: string; text?: string}

// Shown until someone fills the field in, so the card is never empty.
const DEFAULT_ASSURANCES: Assurance[] = [
  {icon: 'shipping', title: 'Free Shipping', text: 'For all over UAE'},
  {icon: 'catalogue', title: 'E - Catalogue', text: 'Promotional Products'},
  {icon: 'secure', title: 'Secure Payment', text: 'Guarantee secure payments'},
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

  const settings = await client.fetch<{productAssurances?: Assurance[]}>(siteSettingsQuery).catch(() => null)
  const assurances = settings?.productAssurances?.length ? settings.productAssurances : DEFAULT_ASSURANCES

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
              {assurances.map((a, i) => (
                <li key={`${a.title}-${i}`} className="flex gap-3">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 shrink-0 text-primary">
                    <path d={ASSURANCE_ICONS[a.icon || 'catalogue'] || ASSURANCE_ICONS.catalogue} />
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

        {product.faqs && product.faqs.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading text-2xl font-bold text-neutral-900">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
              {product.faqs.map((faq, i) => (
                <details key={i} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                      className="shrink-0 text-primary transition-transform group-open:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
                </details>
              ))}
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
