import Link from 'next/link'
import {urlFor} from '@sanity-lib/lib/image'

type Product = {
  _id: string
  name: string
  slug?: {current: string}
  image?: any
  category?: {name: string}
}

export function ProductCard({product}: {product: Product}) {
  const img = urlFor(product.image)?.width(400).height(400).url()
  const href = `/products/${product.slug?.current}`

  return (
    <Link href={href} className="group block overflow-hidden rounded-xl border border-neutral-200">
      <div className="aspect-square bg-neutral-100">
        {img && <img src={img} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
      </div>
      <div className="p-3">
        {product.category?.name && <div className="text-xs text-neutral-500">{product.category.name}</div>}
        <div className="mt-0.5 truncate text-sm font-medium text-neutral-900">{product.name}</div>
      </div>
    </Link>
  )
}
