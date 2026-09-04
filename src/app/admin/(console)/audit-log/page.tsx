import {listRecentAuditLog} from '@/lib/db/auditLog'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const entries = await listRecentAuditLog().catch(() => [])

  return (
    <div>
      <PageHeader title="Audit log" description="Recent actions taken across the console." />
      <DataTable
        rows={entries.map((e) => ({...e, _id: e.id}))}
        emptyMessage="No audit log entries yet."
        columns={[
          {header: 'Action', render: (e) => <span className="font-medium">{e.action}</span>},
          {header: 'Actor', render: (e) => e.actor || '—'},
          {header: 'Target', render: (e) => <span className="text-muted">{e.target || '—'}</span>},
          {header: 'When', render: (e) => <span className="text-muted">{formatDateTime(e.created_at)}</span>},
        ]}
      />
    </div>
  )
}
