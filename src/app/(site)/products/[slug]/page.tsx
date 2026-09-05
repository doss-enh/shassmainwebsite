import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {productBySlugQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {AddToEnquiryButton} from '@/components/site/AddToEnquiryButton'
import {VariantPicker} from '@/components/site/VariantPicker'
import {PortableText} from '@/components/site/PortableText'
import {Breadcrumb} from '@/components/site/Breadcrumb'

export const revalidate = 60

type Product = {
  _id: string
  title: string
  slug: {current: string}
  featuredImage?: any
  gallery?: any[]
  shortDescription?: string
  description?: any[]
  minimumOrderQuantity?: number
  variantAxes?: {name: string; values?: string[]}[]
  variants?: {sku?: string; isDefault?: boolean; stockStatus?: string; options?: {name: string; value: string}[]}[]
  faqs?: {question: string; answer: string}[]
  category?: {name: string}
}

async function getProduct(slug: string) {
  try {
    return await client.fetch<Product | null>(productBySlugQuery, {slug})
  } catch {
    return null
  }
}

export default async function ProductDetailPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const images = [product.featuredImage, ...(product.gallery || [])].filter(Boolean)
  const mainImage = urlFor(images[0])?.width(700).height(700).url()
  const hasVariants = (product.variants?.length || 0) > 0 && (product.variantAxes?.length || 0) > 0

  return (
    <div className="bg-white">
      <Breadcrumb
        trail={[
          {label: 'Products', href: '/products'},
          ...(product.category?.name ? [{label: product.category.name}] : []),
          {label: product.title},
        ]}
      />
      <div className="site-container py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
            {mainImage && <img src={mainImage} alt={product.title} className="h-full w-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(1, 6).map((img, i) => {
                const thumb = urlFor(img)?.width(150).height(150).url()
                return (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                    {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          {product.category?.name && <div className="text-sm text-neutral-500">{product.category.name}</div>}
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{product.title}</h1>

          {product.shortDescription && <p className="mt-4 text-neutral-700">{product.shortDescription}</p>}

          {product.minimumOrderQuantity && (
            <p className="mt-3 text-sm text-neutral-600">Minimum order quantity: {product.minimumOrderQuantity}</p>
          )}

          <div className="mt-6">
            {hasVariants ? (
              <VariantPicker
                productId={product._id}
                title={product.title}
                slug={product.slug.current}
                image={mainImage}
                axes={product.variantAxes || []}
                variants={product.variants || []}
              />
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="mb-3 text-sm font-medium text-neutral-900">Add this product to your enquiry</p>
                <AddToEnquiryButton productId={product._id} name={product.title} slug={product.slug.current} image={mainImage} />
              </div>
            )}
          </div>

          {product.description && (
            <div className="prose prose-neutral mt-8 max-w-none text-neutral-700">
              <PortableText value={product.description} />
            </div>
          )}

          {product.faqs && product.faqs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-neutral-900">Questions about this product</h2>
              <div className="divide-y divide-neutral-200">
                {product.faqs.map((faq, i) => (
                  <details key={i} className="py-3">
                    <summary className="cursor-pointer text-sm font-medium text-neutral-900">{faq.question}</summary>
                    <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
