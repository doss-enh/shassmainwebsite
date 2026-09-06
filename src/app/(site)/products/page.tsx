import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {allProductsQuery, categoryTreeFlatQuery, filterAttributesQuery} from '@sanity-lib/lib/queries'
import {getStorefrontRoots} from '@/lib/storefrontRoots'
import {buildCategoryTree, type CategoryNode, type FlatCategory} from '@/lib/categoryTree'
import {buildFacets, matchesSelection, inStock, selectionFromParams} from '@/lib/facets'
import {ArchiveFilters} from '@/components/site/ArchiveFilters'
import {ArchiveProductCard} from '@/components/site/ArchiveProductCard'
import {Breadcrumb} from '@/components/site/Breadcrumb'

export const revalidate = 60

type Product = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: any
  colors?: string[]
  stockStatus?: string
  featured?: boolean
  _createdAt?: string
  catSlugs?: (string | null)[]
  axes?: {name: string; values?: string[]}[]
  category?: {name: string; slug?: {current: string}}
}

type AttributeDef = {_id: string; name: string; values: string[]}

async function getData() {
  try {
    const [products, roots, flat, attributes] = await Promise.all([
      client.fetch<Product[]>(allProductsQuery),
      getStorefrontRoots(),
      client.fetch<FlatCategory[]>(categoryTreeFlatQuery),
      client.fetch<AttributeDef[]>(filterAttributesQuery),
    ])
    return {products, tree: buildCategoryTree(roots, flat), attributes}
  } catch {
    return {products: [] as Product[], tree: [] as CategoryNode[], attributes: [] as AttributeDef[]}
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

/** Root-first path down to `slug`, for the breadcrumb. */
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

const PAGE_SIZE = 40

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const one = (k: string) => (Array.isArray(params[k]) ? params[k]![0] : (params[k] as string | undefined))
  const category = one('category')
  const q = one('q')
  const sort = one('sort') || ''
  const stockOnly = one('stock') === '1'
  const page = one('page')

  const {products, tree, attributes} = await getData()
  const attributeNames = attributes.map((a) => a.name)
  const selection = selectionFromParams(params, attributeNames)

  const activeNode = category ? findNode(tree, category) : undefined
  const trail = activeNode?.slug ? pathTo(tree, activeNode.slug) || [] : []
  const activeSlugs = activeNode ? new Set(flattenSlugs(activeNode)) : null

  // Scope first: facet counts describe this category, not the whole catalogue.
  let inCategory = activeSlugs
    ? products.filter((p) => (p.catSlugs || [p.category?.slug?.current]).some((s) => s && activeSlugs.has(s)))
    : products
  if (q) {
    const needle = q.toLowerCase()
    inCategory = inCategory.filter((p) => p.title.toLowerCase().includes(needle))
  }

  const facets = buildFacets(inCategory, attributes.map((a) => ({name: a.name, values: a.values || []})), selection, stockOnly)

  let filtered = inCategory.filter((p) => (!stockOnly || inStock(p)) && matchesSelection(p, selection))

  const byDate = (a: Product, b: Product) => Date.parse(a._createdAt || '') - Date.parse(b._createdAt || '')
  if (sort === 'name_asc') filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'name_desc') filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
  else if (sort === 'date_asc') filtered = [...filtered].sort(byDate)
  else if (sort === 'date_desc') filtered = [...filtered].sort((a, b) => byDate(b, a))
  else filtered = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured))

  const currentPage = Math.max(1, Number(page) || 1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  /** Rebuilds the query string with one thing changed; drops the page cursor. */
  function href(changes: Record<string, string | string[] | undefined>) {
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (q) next.set('q', q)
    if (sort) next.set('sort', sort)
    if (stockOnly) next.set('stock', '1')
    for (const [name, values] of Object.entries(selection)) for (const v of values) next.append(name, v)

    for (const [key, value] of Object.entries(changes)) {
      next.delete(key)
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v))
      else if (value) next.set(key, value)
    }
    next.delete('page')
    const qs = next.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  function toggleValueHref(name: string, value: string) {
    const current = selection[name] || []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    return href({[name]: next})
  }

  function pageHref(n: number) {
    const base = href({})
    if (n <= 1) return base
    return `${base}${base.includes('?') ? '&' : '?'}page=${n}`
  }

  const title = activeNode?.name || 'All Products'

  return (
    <div className="bg-white">
      <div className="site-container">
        <Breadcrumb
          trail={[
            {label: 'Collections', href: '/products'},
            ...trail.map((c) => ({label: c.name, href: `/products?category=${c.slug}`})),
          ]}
        />

        <header className="pb-6">
          <h1 className="font-heading text-4xl font-bold text-neutral-900">{title}</h1>
          <p className="mt-1.5 text-sm text-neutral-600">{filtered.length} products</p>
        </header>

        {/* Sub-categories of the current level, as counted pills. */}
        {activeNode && activeNode.children.length > 0 && (
          <ul className="mb-8 flex flex-wrap gap-3">
            {activeNode.children.map((child) => {
              const slugs = new Set(flattenSlugs(child))
              const count = products.filter((p) => (p.catSlugs || []).some((s) => s && slugs.has(s))).length
              return (
                <li key={child._id}>
                  <Link
                    href={`/products?category=${child.slug}`}
                    className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    {child.name} <span className="text-neutral-400">({count})</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-col gap-10 pb-16 lg:flex-row">
          <ArchiveFilters
            total={filtered.length}
            sort={sort}
            stockOnly={stockOnly}
            facets={facets}
            sortHref={(value) => href({sort: value})}
            toggleStockHref={() => href({stock: stockOnly ? undefined : '1'})}
            toggleValueHref={toggleValueHref}
          />

          <div className="min-w-0 flex-1">
            {pageItems.length === 0 ? (
              <p className="rounded-md border border-dashed border-neutral-300 py-24 text-center text-neutral-500">
                No products match these filters.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                  {pageItems.map((p) => (
                    <ArchiveProductCard key={p._id} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                    {currentPage > 1 && (
                      <Link href={pageHref(currentPage - 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-primary hover:text-primary">
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
                            aria-current={n === currentPage ? 'page' : undefined}
                            className={
                              n === currentPage
                                ? 'rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-white'
                                : 'rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-primary hover:text-primary'
                            }
                          >
                            {n}
                          </Link>
                        </span>
                      ))}
                    {currentPage < totalPages && (
                      <Link href={pageHref(currentPage + 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-primary hover:text-primary">
                        ›
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
