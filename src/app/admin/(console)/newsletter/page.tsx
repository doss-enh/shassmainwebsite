import {listNewsletterSubscribers} from '@/lib/db/newsletter'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function NewsletterPage() {
  const subscribers = await listNewsletterSubscribers().catch(() => [])

  return (
    <div>
      <PageHeader title="Newsletter" description={`${subscribers.length} subscribers`} />
      <DataTable
        rows={subscribers.map((s) => ({...s, _id: s.id}))}
        emptyMessage="No newsletter subscribers yet."
        columns={[
          {header: 'Email', render: (s) => s.email},
          {header: 'Status', render: (s) => <StatusBadge status={s.status} />},
          {header: 'Subscribed', render: (s) => <span className="text-muted">{formatDateTime(s.subscribed_at)}</span>},
        ]}
      />
    </div>
  )
}
