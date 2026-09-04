import {revalidatePath} from 'next/cache'
import {listUsers, createUser, setUserActive} from '@/lib/db/users'
import {ROLES, isValidRole} from '@/lib/roles'
import {logAudit} from '@/lib/db/auditLog'
import {getCurrentUser} from '@/lib/auth'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'

export const dynamic = 'force-dynamic'

async function addUser(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const role = String(formData.get('role') || 'viewer')
  if (!name || !email || !password || !isValidRole(role)) return

  await createUser({name, email, password, role})
  const actor = await getCurrentUser()
  await logAudit({actor: actor?.email || 'console', action: 'user.created', target: email})
  revalidatePath('/admin/users')
}

async function toggleActive(id: string, active: boolean) {
  'use server'
  await setUserActive(id, active)
  revalidatePath('/admin/users')
}

export default async function UsersPage() {
  const users = await listUsers().catch(() => [])

  return (
    <div>
      <PageHeader title="Users" description={`${users.length} console users`} />

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 text-sm font-semibold text-foreground">Add a user</div>
        <form action={addUser} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="name" placeholder="Name" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input name="email" type="email" placeholder="Email" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input name="password" type="password" placeholder="Temporary password" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="flex gap-2">
            <select name="role" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Add</button>
          </div>
        </form>
      </div>

      <DataTable
        rows={users.map((u) => ({...u, _id: u.id}))}
        emptyMessage="No users yet."
        columns={[
          {header: 'Name', render: (u) => <span className="font-medium">{u.name}</span>},
          {header: 'Email', render: (u) => <span className="text-muted">{u.email}</span>},
          {header: 'Role', render: (u) => <span className="capitalize">{u.role.replace('_', ' ')}</span>},
          {
            header: 'Status',
            render: (u) => (
              <form action={toggleActive.bind(null, u.id, !u.active)}>
                <button className={u.active ? 'text-success' : 'text-muted'}>{u.active ? 'Active' : 'Disabled'}</button>
              </form>
            ),
          },
        ]}
      />
    </div>
  )
}
