import {client} from '@sanity-lib/lib/client'
import {allRolesQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Role = {_id: string; name: string; permissions?: string[]}

async function getRoles() {
  try {
    return await client.fetch<Role[]>(allRolesQuery)
  } catch {
    return []
  }
}

export default async function RolesPage() {
  const roles = await getRoles()

  return (
    <div>
      <PageHeader
        title="Roles"
        description={`${roles.length} roles`}
        action={<StudioLinkButton href={studioCreateUrl('role')} label="New role" />}
      />
      <DataTable<Role>
        rows={roles}
        emptyMessage="No roles defined yet."
        columns={[
          {
            header: 'Role',
            render: (r) => (
              <a href={studioEditUrl('role', r._id)} className="font-medium hover:text-primary">
                {r.name}
              </a>
            ),
          },
          {header: 'Permissions', render: (r) => <span className="text-muted">{r.permissions?.join(', ') || '—'}</span>},
        ]}
      />
    </div>
  )
}
