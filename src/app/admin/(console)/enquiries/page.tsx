import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {allEnquiriesQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Enquiry = {
  _id: string
  enquiryNumber: string
  customerName: string
  company?: string
  email: string
  phone?: string
  status: string
  createdAt: string
  itemCount: number
}

async function getEnquiries() {
  try {
    return await client.fetch<Enquiry[]>(allEnquiriesQuery)
  } catch {
    return []
  }
}

export default async function EnquiriesPage() {
  const enquiries = await getEnquiries()

  return (
    <div>
      <PageHeader title="Product enquiries" description={`${enquiries.length} total enquiries`} />
      <DataTable<Enquiry>
        rows={enquiries}
        emptyMessage="No enquiries yet. They'll show up here as soon as a customer submits the enquiry form."
        columns={[
          {
            header: 'Enquiry',
            render: (e) => (
              <Link href={`/admin/enquiries/${e._id}`} className="font-medium text-primary hover:underline">
                {e.enquiryNumber}
              </Link>
            ),
          },
          {
            header: 'Customer',
            render: (e) => (
              <div>
                <div className="font-medium">{e.customerName}</div>
                {e.company && <div className="text-xs text-muted">{e.company}</div>}
              </div>
            ),
          },
          {header: 'Email', render: (e) => <span className="text-muted">{e.email}</span>},
          {header: 'Items', render: (e) => e.itemCount},
          {header: 'Status', render: (e) => <StatusBadge status={e.status} />},
          {header: 'Submitted', render: (e) => <span className="text-muted">{formatDateTime(e.createdAt)}</span>},
        ]}
      />
    </div>
  )
}
