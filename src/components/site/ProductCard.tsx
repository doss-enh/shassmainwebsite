import Link from 'next/link'
import {urlFor} from '@sanity-lib/lib/image'
import {ColorSwatches} from './ColorSwatches'

type Product = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: any
  newProduct?: boolean
  colors?: string[]
}

/**
 * Matches the live listing card: a contained image on white, then the title,
 * SKU and available colours left-aligned beneath it. Both text rows are 14px
 * and the SKU is black, as measured on the live grid.
 */
export function ProductCard({product, layout = 'grid'}: {product: Product; layout?: 'grid' | 'list'}) {
  const img = urlFor(product.featuredImage)?.width(400).height(400).url()
  const href = `/products/${product.slug?.current}`

  const meta = (
    <>
      <div className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-primary">
        {product.title}
      </div>
      {product.sku && <div className="mt-1.5 text-sm text-neutral-900">{product.sku}</div>}
      {product.colors && product.colors.length > 0 && (
        <div className="mt-2">
          <ColorSwatches colors={product.colors} />
        </div>
      )}
    </>
  )

  if (layout === 'list') {
    return (
      <Link href={href} className="group flex items-center gap-5 py-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden bg-white">
          {img && (
            <img
              src={img}
              alt={product.featuredImage?.alt || product.title}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <div className="min-w-0">{meta}</div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group relative block p-2">
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
      <div className="mt-3 px-1 pb-2">{meta}</div>
    </Link>
  )
}
