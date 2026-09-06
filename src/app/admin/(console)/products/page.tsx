import {client} from '@sanity-lib/lib/client'
import {allProductsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {Pagination} from '@/components/admin/Pagination'
import {ListToolbar} from '@/components/admin/ListToolbar'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

type Product = {
  _id: string
  title: string
  sku?: string
  featured?: boolean
  newProduct?: boolean
  stockStatus?: string
  featuredImage?: Parameters<typeof urlFor>[0]
  category?: {name: string}
}

async function getProducts() {
  try {
    return await client.fetch<Product[]>(allProductsQuery)
  } catch {
    return []
  }
}

const FILTERS = [
  {key: '', label: 'All'},
  {key: 'featured', label: 'Featured'},
  {key: 'new', label: 'New'},
  {key: 'no-image', label: 'Missing image'},
  {key: 'no-category', label: 'No category'},
] as const

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{q?: string; page?: string; filter?: string}>
}) {
  const {q = '', page: pageParam, filter = ''} = await searchParams
  const all = await getProducts()

  const needle = q.trim().toLowerCase()
  let rows = needle
    ? all.filter(
        (p) => p.title.toLowerCase().includes(needle) || (p.sku || '').toLowerCase().includes(needle),
      )
    : all

  if (filter === 'featured') rows = rows.filter((p) => p.featured)
  else if (filter === 'new') rows = rows.filter((p) => p.newProduct)
  else if (filter === 'no-image') rows = rows.filter((p) => !p.featuredImage)
  else if (filter === 'no-category') rows = rows.filter((p) => !p.category?.name)

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  // Clamp so a stale page number lands on the last page rather than an empty table.
  const page = Math.min(Math.max(1, Number(pageParam) || 1), pages)
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const query = (over: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = {q: q || undefined, filter: filter || undefined, ...over}
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v)
    const s = params.toString()
    return s ? `/admin/products?${s}` : '/admin/products'
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description={
          needle || filter
            ? `${rows.length} of ${all.length} products`
            : `${all.length} products`
        }
        action={<StudioLinkButton href={studioCreateUrl('product')} label="New product" />}
      />

      <ListToolbar
        action="/admin/products"
        q={q}
        placeholder="Search by name or SKU…"
        hidden={{filter: filter || undefined}}
        filters={FILTERS.map((f) => ({
          label: f.label,
          href: query({filter: f.key || undefined, page: undefined}),
          active: filter === f.key,
        }))}
      />

      <DataTable<Product>
        rows={pageRows}
        emptyMessage={needle ? `No products match “${q.trim()}”.` : 'No products yet. Create one to get started.'}
        columns={[
          {
            header: 'Product',
            render: (p) => {
              const img = urlFor(p.featuredImage)?.width(64).height(64).url()
              return (
                <a href={studioEditUrl('product', p._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{p.title}</span>
                  {p.featured && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark">Featured</span>}
                </a>
              )
            },
          },
          {header: 'SKU', render: (p) => <span className="text-muted">{p.sku || '—'}</span>},
          {header: 'Category', render: (p) => p.category?.name || '—'},
          {header: 'Stock', render: (p) => p.stockStatus || '—'},
        ]}
      />

      <Pagination page={page} pages={pages} total={rows.length} label="products" hrefFor={(n) => query({page: n > 1 ? String(n) : undefined})} />
    </div>
  )
}
