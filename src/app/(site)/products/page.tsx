import {client} from '@sanity-lib/lib/client'
import {allProductsQuery, allCategoriesQuery} from '@sanity-lib/lib/queries'
import {ProductCard} from '@/components/site/ProductCard'
import Link from 'next/link'
import clsx from 'clsx'

export const revalidate = 60

type Product = {
  _id: string
  name: string
  slug?: {current: string}
  image?: any
  status: string
  category?: {name: string; slug?: {current: string}}
}
type Category = {_id: string; name: string; slug?: {current: string}}

async function getData() {
  try {
    const [products, categories] = await Promise.all([
      client.fetch<Product[]>(allProductsQuery),
      client.fetch<Category[]>(allCategoriesQuery),
    ])
    return {products: products.filter((p) => p.status === 'live'), categories}
  } catch {
    return {products: [] as Product[], categories: [] as Category[]}
  }
}

export default async function ProductsPage({searchParams}: {searchParams: Promise<{category?: string}>}) {
  const {category} = await searchParams
  const {products, categories} = await getData()
  const filtered = category ? products.filter((p) => p.category?.slug?.current === category) : products

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Products</h1>
      <p className="mb-8 text-neutral-600">Browse our range and add items to your enquiry — we'll quote you directly.</p>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={clsx('rounded-full border px-3 py-1.5 text-sm', !category ? 'border-primary bg-primary-soft text-primary-dark' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300')}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${c.slug?.current}`}
              className={clsx('rounded-full border px-3 py-1.5 text-sm', category === c.slug?.current ? 'border-primary bg-primary-soft text-primary-dark' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300')}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-24 text-center text-neutral-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
