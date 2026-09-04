import {client} from '@sanity-lib/lib/client'
import {allAttributesQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Attribute = {_id: string; name: string; values?: string[]}

async function getAttributes() {
  try {
    return await client.fetch<Attribute[]>(allAttributesQuery)
  } catch {
    return []
  }
}

export default async function AttributesPage() {
  const attributes = await getAttributes()

  return (
    <div>
      <PageHeader
        title="Attributes"
        description={`${attributes.length} attributes`}
        action={<StudioLinkButton href={studioCreateUrl('attribute')} label="New attribute" />}
      />
      <DataTable<Attribute>
        rows={attributes}
        emptyMessage="No attributes yet. Attributes power product variants like Color or Material."
        columns={[
          {
            header: 'Attribute',
            render: (a) => (
              <a href={studioEditUrl('attribute', a._id)} className="font-medium hover:text-primary">
                {a.name}
              </a>
            ),
          },
          {
            header: 'Values',
            render: (a) => <span className="text-muted">{a.values?.join(', ') || '—'}</span>,
          },
        ]}
      />
    </div>
  )
}
