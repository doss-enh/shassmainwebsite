import {client} from '@sanity-lib/lib/client'
import {allPagesQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Page = {_id: string; title: string; slug?: {current: string}; published?: boolean}

async function getPages() {
  try {
    return await client.fetch<Page[]>(allPagesQuery)
  } catch {
    return []
  }
}

export default async function PagesPage() {
  const pages = await getPages()

  return (
    <div>
      <PageHeader
        title="Pages"
        description={`${pages.length} pages`}
        action={<StudioLinkButton href={studioCreateUrl('page')} label="New page" />}
      />
      <DataTable<Page>
        rows={pages}
        emptyMessage="No pages yet."
        columns={[
          {
            header: 'Title',
            render: (p) => (
              <a href={studioEditUrl('page', p._id)} className="font-medium hover:text-primary">
                {p.title}
              </a>
            ),
          },
          {header: 'Slug', render: (p) => <span className="text-muted">/{p.slug?.current}</span>},
          {header: 'Status', render: (p) => (p.published ? 'Published' : 'Draft')},
        ]}
      />
    </div>
  )
}
