import {client} from '@sanity-lib/lib/client'
import {recentAuditLogQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type AuditEntry = {_id: string; action: string; actor?: string; target?: string; createdAt: string}

async function getEntries() {
  try {
    return await client.fetch<AuditEntry[]>(recentAuditLogQuery)
  } catch {
    return []
  }
}

export default async function AuditLogPage() {
  const entries = await getEntries()

  return (
    <div>
      <PageHeader title="Audit log" description="Recent actions taken across the console." />
      <DataTable<AuditEntry>
        rows={entries}
        emptyMessage="No audit log entries yet."
        columns={[
          {header: 'Action', render: (e) => <span className="font-medium">{e.action}</span>},
          {header: 'Actor', render: (e) => e.actor || '—'},
          {header: 'Target', render: (e) => <span className="text-muted">{e.target || '—'}</span>},
          {header: 'When', render: (e) => <span className="text-muted">{formatDateTime(e.createdAt)}</span>},
        ]}
      />
    </div>
  )
}
