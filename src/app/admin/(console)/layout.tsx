import {redirect} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {getCurrentUser} from '@/lib/auth'
import {getNeedsReplyCount} from '@/lib/db/enquiries'
import {AdminSidebar} from '@/components/admin/AdminSidebar'
import {AdminTopbar} from '@/components/admin/AdminTopbar'

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  const [needsReplyCount, settings] = await Promise.all([
    getNeedsReplyCount().catch(() => 0),
    client.fetch(siteSettingsQuery).catch(() => null),
  ])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar needsReplyCount={needsReplyCount} orgName={settings?.siteName || 'Shass Gift'} user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
