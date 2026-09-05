import {client} from '@sanity-lib/lib/client'
import {allProductsQuery, categoryTreeFlatQuery, rootBannersQuery} from '@sanity-lib/lib/queries'
import {getStorefrontRoots} from '@/lib/storefrontRoots'
import {urlFor} from '@sanity-lib/lib/image'
import {ProductCard} from '@/components/site/ProductCard'
import {CatalogToolbar} from '@/components/site/CatalogToolbar'
import {buildCategoryTree, type CategoryNode, type FlatCategory} from '@/lib/categoryTree'
import Link from 'next/link'
import clsx from 'clsx'

export const revalidate = 60

type Product = {
  _id: string
  title: string
  _createdAt?: string
  sku?: string
  newProduct?: boolean
  slug?: {current: string}
  featuredImage?: any
  category?: {name: string; slug?: {current: string}}
}

async function getData() {
  try {
    const [products, topLevel, flat, banners] = await Promise.all([
      client.fetch<Product[]>(allProductsQuery),
      getStorefrontRoots(),
      client.fetch<FlatCategory[]>(categoryTreeFlatQuery),
      client.fetch<{_id: string; name: string; banner?: any}[]>(rootBannersQuery),
    ])
    return {products, tree: buildCategoryTree(topLevel, flat), banners}
  } catch {
    return {products: [] as Product[], tree: [] as CategoryNode[], banners: [] as {_id: string; name: string; banner?: any}[]}
  }
}

function findNode(nodes: CategoryNode[], slug: string): CategoryNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node
    const found = findNode(node.children, slug)
    if (found) return found
  }
  return undefined
}

/** Root-first path down to `slug`, as the live sidebar lists it. */
function pathTo(nodes: CategoryNode[], slug: string, trail: CategoryNode[] = []): CategoryNode[] | undefined {
  for (const node of nodes) {
    const next = [...trail, node]
    if (node.slug === slug) return next
    const found = pathTo(node.children, slug, next)
    if (found) return found
  }
  return undefined
}

function flattenSlugs(node: CategoryNode): string[] {
  return [node.slug, ...node.children.flatMap(flattenSlugs)].filter((s): s is string => !!s)
}

const PAGE_SIZE = 40  // matches the live listing

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{category?: string; q?: string; sort?: string; page?: string; view?: string}>
}) {
  const {category, q, sort, page, view} = await searchParams
  const layout: 'grid' | 'list' = view === 'list' ? 'list' : 'grid'
  const {products, tree, banners} = await getData()

  const activeNode = category ? findNode(tree, category) : undefined
  const activeSlugs = activeNode ? new Set(flattenSlugs(activeNode)) : null

  let filtered = activeSlugs ? products.filter((p) => p.category?.slug?.current && activeSlugs.has(p.category.slug.current)) : products
  if (q) {
    const needle = q.toLowerCase()
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(needle))
  }

  // Same five orderings the live toolbar offers.
  const byDate = (a: Product, b: Product) => Date.parse(a._createdAt || '') - Date.parse(b._createdAt || '')
  if (sort === 'name_asc') filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'name_desc') filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
  else if (sort === 'date_asc') filtered = [...filtered].sort(byDate)
  else if (sort === 'date_desc') filtered = [...filtered].sort((a, b) => byDate(b, a))

  const currentPage = Math.max(1, Number(page) || 1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function pageHref(n: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (sort) params.set('sort', sort)
    if (view) params.set('view', view)
    if (n > 1) params.set('page', String(n))
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  function toolbarHref({sort: nextSort, view: nextView}: {sort?: string; view?: string}) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (nextSort) params.set('sort', nextSort)
    if (nextView) params.set('view', nextView)
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  const heroImages = (activeNode ? filtered : products)
    .slice(0, 5)
    .map((p) => urlFor(p.featuredImage)?.width(160).height(160).url())
    .filter((u): u is string => !!u)

  const trail = activeNode?.slug ? pathTo(tree, activeNode.slug) || [] : []
  const rootBanner = trail.length ? banners.find((b) => b._id === trail[0]._id) : undefined
  const bannerUrl = urlFor(rootBanner?.banner)?.width(2530).url()

  return (
    <div className="bg-white">
      {/* Live puts a full-bleed banner here, one per root, inherited by
          every category beneath it — not a gradient panel. */}
      {bannerUrl && (
        <div className="w-full">
          <img src={bannerUrl} alt={activeNode?.name || 'Shass Gift'} className="h-auto w-full object-cover" />
        </div>
      )}

      <div className="site-container grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-wide text-neutral-800">Product Categories</div>
          <ul className="space-y-1.5 text-[13px]">
            <li>
              <Link href="/products" className={clsx('block', activeNode ? 'text-neutral-600 hover:text-primary' : 'font-semibold text-primary')}>
                All categories
              </Link>
            </li>
            {/* The live sidebar walks the ancestry down to the current
                category, indenting a step at a time, then lists its children. */}
            {trail.map((node, depth) => (
              <li key={node._id} style={{paddingLeft: `${(depth + 1) * 12}px`}}>
                <Link
                  href={`/products?category=${node.slug}`}
                  className={clsx(
                    'block',
                    activeNode?._id === node._id ? 'font-semibold text-primary' : 'text-neutral-600 hover:text-primary'
                  )}
                >
                  {node.name}
                </Link>
              </li>
            ))}
            {(activeNode ? activeNode.children : tree).map((child) => (
              <li key={child._id} style={{paddingLeft: `${(trail.length + 1) * 12}px`}}>
                <Link href={`/products?category=${child.slug}`} className="block text-neutral-600 hover:text-primary">
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <CatalogToolbar sort={sort || ''} view={layout} hrefFor={toolbarHref} />

          {filtered.length === 0 ? (
            <div className="rounded-sm border border-dashed border-neutral-200 py-24 text-center text-neutral-500">No products found.</div>
          ) : (
            <>
              <div className={layout === 'list' ? 'divide-y divide-neutral-200' : 'grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}>
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} layout={layout} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
                  {currentPage > 1 && (
                    <Link href={pageHref(currentPage - 1)} className="rounded-sm border border-neutral-200 px-3 py-1.5 text-[13px] text-neutral-600 hover:border-primary hover:text-primary">
                      ‹
                    </Link>
                  )}
                  {Array.from({length: totalPages}, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 2)
                    .map((n, idx, arr) => (
                      <span key={n} className="flex items-center gap-1.5">
                        {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-neutral-400">…</span>}
                        <Link
                          href={pageHref(n)}
                          className={clsx(
                            'rounded-sm border px-3 py-1.5 text-[13px]',
                            n === currentPage ? 'border-primary bg-primary text-white' : 'border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
                          )}
                        >
                          {n}
                        </Link>
                      </span>
                    ))}
                  {currentPage < totalPages && (
                    <Link href={pageHref(currentPage + 1)} className="rounded-sm border border-neutral-200 px-3 py-1.5 text-[13px] text-neutral-600 hover:border-primary hover:text-primary">
                      ›
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
