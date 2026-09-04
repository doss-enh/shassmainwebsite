import {client} from '@sanity-lib/lib/client'
import {allConsoleUsersQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type ConsoleUser = {_id: string; name: string; email: string; active?: boolean; role?: {name: string}}

async function getUsers() {
  try {
    return await client.fetch<ConsoleUser[]>(allConsoleUsersQuery)
  } catch {
    return []
  }
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${users.length} console users`}
        action={<StudioLinkButton href={studioCreateUrl('consoleUser')} label="New user" />}
      />
      <DataTable<ConsoleUser>
        rows={users}
        emptyMessage="No console users listed yet."
        columns={[
          {
            header: 'Name',
            render: (u) => (
              <a href={studioEditUrl('consoleUser', u._id)} className="font-medium hover:text-primary">
                {u.name}
              </a>
            ),
          },
          {header: 'Email', render: (u) => <span className="text-muted">{u.email}</span>},
          {header: 'Role', render: (u) => u.role?.name || '—'},
          {header: 'Status', render: (u) => (u.active ? 'Active' : 'Disabled')},
        ]}
      />
    </div>
  )
}
