import {client} from '@sanity-lib/lib/client'
import {allProductsQuery, topLevelCategoriesQuery, categoryTreeFlatQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {ProductCard} from '@/components/site/ProductCard'
import {buildCategoryTree, type CategoryNode, type FlatCategory} from '@/lib/categoryTree'
import Link from 'next/link'
import clsx from 'clsx'

export const revalidate = 60

type Product = {
  _id: string
  title: string
  sku?: string
  newProduct?: boolean
  slug?: {current: string}
  featuredImage?: any
  category?: {name: string; slug?: {current: string}}
}

async function getData() {
  try {
    const [products, topLevel, flat] = await Promise.all([
      client.fetch<Product[]>(allProductsQuery),
      client.fetch<{_id: string; name: string; slug?: {current: string}}[]>(topLevelCategoriesQuery),
      client.fetch<FlatCategory[]>(categoryTreeFlatQuery),
    ])
    return {products, tree: buildCategoryTree(topLevel, flat)}
  } catch {
    return {products: [] as Product[], tree: [] as CategoryNode[]}
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

function flattenSlugs(node: CategoryNode): string[] {
  return [node.slug, ...node.children.flatMap(flattenSlugs)].filter((s): s is string => !!s)
}

const PAGE_SIZE = 24

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{category?: string; q?: string; sort?: string; page?: string}>
}) {
  const {category, q, sort, page} = await searchParams
  const {products, tree} = await getData()

  const activeNode = category ? findNode(tree, category) : undefined
  const activeSlugs = activeNode ? new Set(flattenSlugs(activeNode)) : null

  let filtered = activeSlugs ? products.filter((p) => p.category?.slug?.current && activeSlugs.has(p.category.slug.current)) : products
  if (q) {
    const needle = q.toLowerCase()
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(needle))
  }

  if (sort === 'name-asc') filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'name-desc') filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))

  const currentPage = Math.max(1, Number(page) || 1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function pageHref(n: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (sort) params.set('sort', sort)
    if (n > 1) params.set('page', String(n))
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  function sortHref(value: string) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (value) params.set('sort', value)
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  const heroImages = (activeNode ? filtered : products)
    .slice(0, 5)
    .map((p) => urlFor(p.featuredImage)?.width(160).height(160).url())
    .filter((u): u is string => !!u)

  // Sidebar shows the active top-level category's tree, or all top-level categories.
  const sidebarRoot = activeNode ? tree.find((t) => flattenSlugs(t).includes(activeNode.slug || '')) : undefined

  return (
    <div>
      <section className="site-hero-gradient relative overflow-hidden">
        <div className="site-container flex items-center justify-between gap-6 px-4 py-14">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{activeNode?.name || 'All Products'}</h1>
          {heroImages.length > 0 && (
            <div className="hidden gap-4 md:flex">
              {heroImages.map((src, i) => (
                <div key={i} className="h-20 w-20 rotate-45 overflow-hidden rounded-lg border-2 border-white/80 bg-white shadow-md">
                  <img src={src} alt="" className="h-full w-full -rotate-45 scale-150 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="site-container grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Product Categories</div>
          <ul className="overflow-hidden rounded-sm border border-neutral-200">
            {(sidebarRoot ? [sidebarRoot] : tree).map((node) => (
              <li key={node._id} className="border-b border-neutral-100 last:border-b-0">
                <Link
                  href={`/products?category=${node.slug}`}
                  className={clsx(
                    'block px-3 py-2 text-[13px] font-medium',
                    activeNode?._id === node._id ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  {node.name}
                </Link>
                {node.children.length > 0 && (
                  <ul className="bg-neutral-50">
                    {node.children.map((child) => (
                      <li key={child._id}>
                        <Link
                          href={`/products?category=${child.slug}`}
                          className={clsx(
                            'block px-6 py-1.5 text-[13px]',
                            activeNode?._id === child._id ? 'font-semibold text-primary' : 'text-neutral-600 hover:text-primary'
                          )}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <p className="text-sm text-neutral-500">{filtered.length} products</p>
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-neutral-500">Sort by</span>
              <Link href={sortHref('')} className={clsx('rounded-sm border px-2.5 py-1', !sort ? 'border-primary text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}>
                Default
              </Link>
              <Link href={sortHref('name-asc')} className={clsx('rounded-sm border px-2.5 py-1', sort === 'name-asc' ? 'border-primary text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}>
                A–Z
              </Link>
              <Link href={sortHref('name-desc')} className={clsx('rounded-sm border px-2.5 py-1', sort === 'name-desc' ? 'border-primary text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}>
                Z–A
              </Link>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-sm border border-dashed border-neutral-200 py-24 text-center text-neutral-500">No products found.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} />
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
