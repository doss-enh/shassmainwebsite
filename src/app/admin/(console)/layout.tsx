import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {AdminSidebar} from '@/components/admin/AdminSidebar'
import {AdminTopbar} from '@/components/admin/AdminTopbar'

async function getNeedsReplyCount() {
  try {
    return await client.fetch<number>(`count(*[_type == "enquiry" && status == "new"])`)
  } catch {
    return 0
  }
}

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const [needsReplyCount, settings] = await Promise.all([
    getNeedsReplyCount(),
    client.fetch(siteSettingsQuery).catch(() => null),
  ])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar needsReplyCount={needsReplyCount} orgName={settings?.siteName || 'Shass Gift'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
