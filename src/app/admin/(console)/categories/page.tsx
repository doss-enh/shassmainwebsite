import {client} from '@sanity-lib/lib/client'
import {allCategoriesQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Category = {_id: string; name: string; image?: any; parent?: {name: string}}

async function getCategories() {
  try {
    return await client.fetch<Category[]>(allCategoriesQuery)
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <PageHeader
        title="Categories"
        description={`${categories.length} categories`}
        action={<StudioLinkButton href={studioCreateUrl('category')} label="New category" />}
      />
      <DataTable<Category>
        rows={categories}
        emptyMessage="No categories yet."
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
        ]}
      />
    </div>
  )
}
