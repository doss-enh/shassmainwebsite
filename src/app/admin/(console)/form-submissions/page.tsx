import {listFormSubmissions} from '@/lib/db/formSubmissions'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function FormSubmissionsPage() {
  const submissions = await listFormSubmissions().catch(() => [])

  return (
    <div>
      <PageHeader title="Form submissions" description={`${submissions.length} total submissions`} />
      <DataTable
        rows={submissions.map((s) => ({...s, _id: s.id}))}
        emptyMessage="No form submissions yet."
        columns={[
          {header: 'Type', render: (s) => <span className="capitalize">{s.form_type?.replace('_', ' ')}</span>},
          {header: 'Name', render: (s) => s.name || '—'},
          {header: 'Email', render: (s) => <span className="text-muted">{s.email || '—'}</span>},
          {header: 'Phone', render: (s) => s.phone || '—'},
          {header: 'Status', render: (s) => <StatusBadge status={s.status} />},
          {header: 'Submitted', render: (s) => <span className="text-muted">{formatDateTime(s.created_at)}</span>},
        ]}
      />
    </div>
  )
}
