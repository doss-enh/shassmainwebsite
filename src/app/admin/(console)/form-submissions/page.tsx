import {client} from '@sanity-lib/lib/client'
import {allFormSubmissionsQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Submission = {
  _id: string
  formType: string
  name?: string
  email?: string
  phone?: string
  status: string
  createdAt: string
}

async function getSubmissions() {
  try {
    return await client.fetch<Submission[]>(allFormSubmissionsQuery)
  } catch {
    return []
  }
}

export default async function FormSubmissionsPage() {
  const submissions = await getSubmissions()

  return (
    <div>
      <PageHeader title="Form submissions" description={`${submissions.length} total submissions`} />
      <DataTable<Submission>
        rows={submissions}
        emptyMessage="No form submissions yet."
        columns={[
          {header: 'Type', render: (s) => <span className="capitalize">{s.formType?.replace('_', ' ')}</span>},
          {header: 'Name', render: (s) => s.name || '—'},
          {header: 'Email', render: (s) => <span className="text-muted">{s.email || '—'}</span>},
          {header: 'Phone', render: (s) => s.phone || '—'},
          {header: 'Status', render: (s) => <StatusBadge status={s.status} />},
          {header: 'Submitted', render: (s) => <span className="text-muted">{formatDateTime(s.createdAt)}</span>},
        ]}
      />
    </div>
  )
}
