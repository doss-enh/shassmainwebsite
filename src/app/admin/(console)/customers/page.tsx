import {client} from '@sanity-lib/lib/client'
import {allCustomersQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Customer = {_id: string; name: string; email?: string; phone?: string; company?: string; createdAt: string}

async function getCustomers() {
  try {
    return await client.fetch<Customer[]>(allCustomersQuery)
  } catch {
    return []
  }
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers`}
        action={<StudioLinkButton href={studioCreateUrl('customer')} label="New customer" />}
      />
      <DataTable<Customer>
        rows={customers}
        emptyMessage="No customers yet."
        columns={[
          {
            header: 'Name',
            render: (c) => (
              <a href={studioEditUrl('customer', c._id)} className="font-medium hover:text-primary">
                {c.name}
              </a>
            ),
          },
          {header: 'Company', render: (c) => c.company || '—'},
          {header: 'Email', render: (c) => <span className="text-muted">{c.email || '—'}</span>},
          {header: 'Phone', render: (c) => c.phone || '—'},
          {header: 'Added', render: (c) => <span className="text-muted">{formatDateTime(c.createdAt)}</span>},
        ]}
      />
    </div>
  )
}
