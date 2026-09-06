import Link from 'next/link'
import {listEnquiries} from '@/lib/db/enquiries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function EnquiriesPage() {
  const enquiries = await listEnquiries().catch(() => [])

  return (
    <div>
      <PageHeader title="Product enquiries" description={`${enquiries.length} total enquiries`} />
      <DataTable
        rows={enquiries.map((e) => ({...e, _id: e.id}))}
        emptyMessage="No enquiries yet. They'll show up here as soon as a customer submits the enquiry form."
        columns={[
          {
            header: 'Enquiry',
            render: (e) => (
              <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-primary hover:underline">
                {e.enquiry_number}
              </Link>
            ),
          },
          {
            header: 'Customer',
            render: (e) => (
              <div>
                <div className="font-medium">{e.customer_name}</div>
                {e.company && <div className="text-xs text-muted">{e.company}</div>}
              </div>
            ),
          },
          {header: 'Email', render: (e) => <span className="text-muted">{e.email}</span>},
          {header: 'Items', render: (e) => e.item_count},
          {header: 'Status', render: (e) => <StatusBadge status={e.status} />},
          {header: 'Owner', render: (e) => <span className="text-muted">{e.assigned_to || 'Unassigned'}</span>},
          {
            header: 'Follow-up',
            render: (e) => {
              if (!e.follow_up_at) return <span className="text-muted">—</span>
              const due = new Date(e.follow_up_at) <= new Date() && !['won', 'lost'].includes(e.status)
              return (
                <span className={due ? 'font-semibold text-red-600' : 'text-muted'}>
                  {due ? 'Due · ' : ''}
                  {formatDateTime(e.follow_up_at)}
                </span>
              )
            },
          },
          {header: 'Submitted', render: (e) => <span className="text-muted">{formatDateTime(e.created_at)}</span>},
        ]}
      />
    </div>
  )
}
