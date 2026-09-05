import Link from 'next/link'
import {urlFor} from '@sanity-lib/lib/image'

type Product = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: any
  newProduct?: boolean
  category?: {name: string}
}

export function ProductCard({product}: {product: Product}) {
  const img = urlFor(product.featuredImage)?.width(400).height(400).url()
  const href = `/products/${product.slug?.current}`

  return (
    <Link href={href} className="group relative block overflow-hidden rounded-sm border border-neutral-200 transition-shadow hover:shadow-md">
      {product.newProduct && (
        <span className="absolute left-2 top-2 z-10 rounded-sm bg-green-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
          New
        </span>
      )}
      <div className="aspect-square bg-neutral-100">
        {img && <img src={img} alt={product.featuredImage?.alt || product.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-medium text-neutral-900">{product.title}</div>
        {product.sku && <div className="mt-0.5 font-mono text-[11px] text-neutral-400">{product.sku}</div>}
      </div>
    </Link>
  )
}
