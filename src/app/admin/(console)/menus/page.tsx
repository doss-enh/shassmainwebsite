import {client} from '@sanity-lib/lib/client'
import {allMenusQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Menu = {_id: string; title: string; location: string; items?: any[]}

async function getMenus() {
  try {
    return await client.fetch<Menu[]>(allMenusQuery)
  } catch {
    return []
  }
}

export default async function MenusPage() {
  const menus = await getMenus()

  return (
    <div>
      <PageHeader
        title="Menus"
        description={`${menus.length} menus`}
        action={<StudioLinkButton href={studioCreateUrl('menu')} label="New menu" />}
      />
      <DataTable<Menu>
        rows={menus}
        emptyMessage="No menus yet. Create a header or footer menu to get started."
        columns={[
          {
            header: 'Menu',
            render: (m) => (
              <a href={studioEditUrl('menu', m._id)} className="font-medium hover:text-primary">
                {m.title}
              </a>
            ),
          },
          {header: 'Location', render: (m) => <span className="capitalize">{m.location}</span>},
          {header: 'Items', render: (m) => m.items?.length || 0},
        ]}
      />
    </div>
  )
}
