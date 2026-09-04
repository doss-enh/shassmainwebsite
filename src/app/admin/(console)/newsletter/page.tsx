import {client} from '@sanity-lib/lib/client'
import {allNewsletterSubscribersQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Subscriber = {_id: string; email: string; status: string; subscribedAt: string}

async function getSubscribers() {
  try {
    return await client.fetch<Subscriber[]>(allNewsletterSubscribersQuery)
  } catch {
    return []
  }
}

export default async function NewsletterPage() {
  const subscribers = await getSubscribers()

  return (
    <div>
      <PageHeader title="Newsletter" description={`${subscribers.length} subscribers`} />
      <DataTable<Subscriber>
        rows={subscribers}
        emptyMessage="No newsletter subscribers yet."
        columns={[
          {header: 'Email', render: (s) => s.email},
          {header: 'Status', render: (s) => <StatusBadge status={s.status} />},
          {header: 'Subscribed', render: (s) => <span className="text-muted">{formatDateTime(s.subscribedAt)}</span>},
        ]}
      />
    </div>
  )
}
