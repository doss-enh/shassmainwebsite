import Link from 'next/link'
import {urlFor} from '@sanity-lib/lib/image'
import {resolveSwatch} from '@/lib/colors'
import {AddToEnquiryButton} from './AddToEnquiryButton'

type Product = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: any
  colors?: string[]
  stockStatus?: string
}

/**
 * Archive card: stock flag, contained image, title, "Price on request",
 * colour dots and an Add to Enquiry button. There are no prices anywhere on
 * this site — every product is quoted — so the price line is fixed copy.
 */
export function ArchiveProductCard({product}: {product: Product}) {
  const img = urlFor(product.featuredImage)?.width(600).height(600).url()
  const href = `/products/${product.slug?.current}`
  const outOfStock = product.stockStatus === 'outofstock'
  const colors = (product.colors || []).slice(0, 6)

  return (
    <div className="group flex flex-col">
      <Link href={href} className="block">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide ${outOfStock ? 'text-neutral-400' : 'text-[#1a7f45]'}`}
        >
          {outOfStock ? 'Out of stock' : 'In stock'}
        </span>
        <div className="mt-2 aspect-square overflow-hidden bg-white">
          {img && (
            <img
              src={img}
              alt={product.featuredImage?.alt || product.title}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-snug text-neutral-900 group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-1.5 text-sm text-neutral-600">Price on request</p>
      </Link>

      {colors.length > 0 && (
        <ul className="mt-2 flex items-center gap-1.5">
          {colors.map((name) => {
            const swatch = resolveSwatch(name)
            return (
              <li
                key={name}
                title={swatch.label}
                className={`h-3.5 w-3.5 rounded-full ${!swatch.background ? 'bg-neutral-200' : ''} ${swatch.needsEdge ? 'ring-1 ring-neutral-300' : ''}`}
                style={swatch.background ? {background: swatch.background} : undefined}
              />
            )
          })}
        </ul>
      )}

      <div className="mt-3">
        <AddToEnquiryButton
          productId={product._id}
          name={product.title}
          slug={product.slug?.current || ''}
          image={img}
          variant="outline"
        />
      </div>
    </div>
  )
}
