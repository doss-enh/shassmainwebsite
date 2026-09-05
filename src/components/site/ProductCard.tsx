import Link from 'next/link'
import {urlFor} from '@sanity-lib/lib/image'

type Product = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: any
  newProduct?: boolean
}

/**
 * Matches the live listing card: a contained image on white, then the title
 * and SKU centred beneath it. No border and no colour swatches — the live
 * grid is borderless and leaves colour to the product page.
 */
export function ProductCard({product, layout = 'grid'}: {product: Product; layout?: 'grid' | 'list'}) {
  const img = urlFor(product.featuredImage)?.width(400).height(400).url()
  const href = `/products/${product.slug?.current}`

  if (layout === 'list') {
    return (
      <Link href={href} className="group flex items-center gap-5 py-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden bg-white">
          {img && <img src={img} alt={product.featuredImage?.alt || product.title} loading="lazy" className="h-full w-full object-contain" />}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-neutral-800 group-hover:text-primary">{product.title}</div>
          {product.sku && <div className="mt-1 text-[12px] text-neutral-400">{product.sku}</div>}
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group relative block p-2 text-center">
      {product.newProduct && (
        <span className="absolute left-2 top-2 z-10 rounded-sm bg-[#2B9D93] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
          New
        </span>
      )}
      <div className="aspect-square overflow-hidden bg-white">
        {img && (
          <img
            src={img}
            alt={product.featuredImage?.alt || product.title}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-2 px-1 pb-2">
        <div className="line-clamp-2 text-[13px] leading-snug text-neutral-800 group-hover:text-primary">{product.title}</div>
        {product.sku && <div className="mt-1 text-[12px] text-neutral-400">{product.sku}</div>}
      </div>
    </Link>
  )
}
