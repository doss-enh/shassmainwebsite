import {client} from '@sanity-lib/lib/client'
import {allCataloguesQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Catalogue = {_id: string; title: string; coverImage?: any; published?: boolean; file?: any}

async function getCatalogues() {
  try {
    return await client.fetch<Catalogue[]>(allCataloguesQuery)
  } catch {
    return []
  }
}

export default async function CataloguePage() {
  const catalogues = await getCatalogues()

  return (
    <div>
      <PageHeader
        title="Catalogue"
        description={`${catalogues.length} downloadable catalogues`}
        action={<StudioLinkButton href={studioCreateUrl('catalogue')} label="New catalogue" />}
      />
      <DataTable<Catalogue>
        rows={catalogues}
        emptyMessage="No catalogues uploaded yet."
        columns={[
          {
            header: 'Title',
            render: (c) => {
              const img = urlFor(c.coverImage)?.width(64).height(64).url()
              return (
                <a href={studioEditUrl('catalogue', c._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{c.title}</span>
                </a>
              )
            },
          },
          {header: 'File', render: (c) => (c.file ? 'PDF attached' : '—')},
          {header: 'Status', render: (c) => (c.published ? 'Published' : 'Draft')},
        ]}
      />
    </div>
  )
}
