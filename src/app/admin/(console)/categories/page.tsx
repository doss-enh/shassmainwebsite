import {client} from '@sanity-lib/lib/client'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {Pagination} from '@/components/admin/Pagination'
import {ListToolbar} from '@/components/admin/ListToolbar'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

type Category = {
  _id: string
  name: string
  image?: Parameters<typeof urlFor>[0]
  parent?: {name: string}
  productCount: number
  childCount: number
}

async function getCategories() {
  try {
    // Counts make the empty and orphaned categories findable, which a plain
    // name/parent listing did not.
    return await client.fetch<Category[]>(
      `*[_type == "category"] | order(coalesce(parent->name, name) asc, name asc) {
        _id, name, image, parent->{name},
        "productCount": count(*[_type == "product" && status != "draft" && references(^._id)]),
        "childCount": count(*[_type == "category" && parent._ref == ^._id])
      }`,
    )
  } catch {
    return []
  }
}

const FILTERS = [
  {key: '', label: 'All'},
  {key: 'roots', label: 'Top level'},
  {key: 'empty', label: 'No products'},
] as const

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{q?: string; page?: string; filter?: string}>
}) {
  const {q = '', page: pageParam, filter = ''} = await searchParams
  const all = await getCategories()

  const needle = q.trim().toLowerCase()
  let rows = needle
    ? all.filter((c) => c.name.toLowerCase().includes(needle) || (c.parent?.name || '').toLowerCase().includes(needle))
    : all

  if (filter === 'roots') rows = rows.filter((c) => !c.parent)
  else if (filter === 'empty') rows = rows.filter((c) => c.productCount === 0)

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(pageParam) || 1), pages)
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const query = (over: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = {q: q || undefined, filter: filter || undefined, ...over}
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v)
    const s = params.toString()
    return s ? `/admin/categories?${s}` : '/admin/categories'
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description={needle || filter ? `${rows.length} of ${all.length} categories` : `${all.length} categories`}
        action={<StudioLinkButton href={studioCreateUrl('category')} label="New category" />}
      />

      <ListToolbar
        action="/admin/categories"
        q={q}
        placeholder="Search by name or parent…"
        hidden={{filter: filter || undefined}}
        filters={FILTERS.map((f) => ({
          label: f.label,
          href: query({filter: f.key || undefined, page: undefined}),
          active: filter === f.key,
        }))}
      />

      <DataTable<Category>
        rows={pageRows}
        emptyMessage={needle ? `No categories match “${q.trim()}”.` : 'No categories yet.'}
        columns={[
          {
            header: 'Category',
            render: (c) => {
              const img = urlFor(c.image)?.width(64).height(64).url()
              return (
                <a href={studioEditUrl('category', c._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{c.name}</span>
                </a>
              )
            },
          },
          {header: 'Parent', render: (c) => c.parent?.name || '—'},
          {header: 'Sub-categories', render: (c) => <span className="text-muted">{c.childCount || '—'}</span>},
          {
            header: 'Products',
            render: (c) => <span className={c.productCount === 0 ? 'text-muted' : ''}>{c.productCount}</span>,
          },
        ]}
      />

      <Pagination page={page} pages={pages} total={rows.length} label="categories" hrefFor={(n) => query({page: n > 1 ? String(n) : undefined})} />
    </div>
  )
}
