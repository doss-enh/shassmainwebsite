import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {productBySlugQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {AddToEnquiryButton} from '@/components/site/AddToEnquiryButton'
import {PortableText} from '@/components/site/PortableText'

export const revalidate = 60

type Product = {
  _id: string
  name: string
  slug: {current: string}
  images?: any[]
  shortDescription?: string
  description?: any[]
  minOrderQty?: number
  printAreas?: string[]
  category?: {name: string}
  brand?: {name: string}
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

  const mainImage = urlFor(product.images?.[0])?.width(700).height(700).url()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
            {mainImage && <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.slice(1, 6).map((img, i) => {
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
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{product.name}</h1>
          {product.brand?.name && <div className="mt-1 text-sm text-neutral-500">by {product.brand.name}</div>}

          {product.shortDescription && <p className="mt-4 text-neutral-700">{product.shortDescription}</p>}

          {product.minOrderQty && (
            <p className="mt-3 text-sm text-neutral-600">Minimum order quantity: {product.minOrderQty}</p>
          )}

          {product.printAreas && product.printAreas.length > 0 && (
            <p className="mt-1 text-sm text-neutral-600">Branding areas: {product.printAreas.join(', ')}</p>
          )}

          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-900">Add this product to your enquiry</p>
            <AddToEnquiryButton
              productId={product._id}
              name={product.name}
              slug={product.slug.current}
              image={mainImage}
            />
          </div>

          {product.description && (
            <div className="prose prose-neutral mt-8 max-w-none text-neutral-700">
              <PortableText value={product.description} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
