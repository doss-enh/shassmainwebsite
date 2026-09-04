import {listCustomers} from '@/lib/db/customers'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await listCustomers().catch(() => [])

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers — built automatically from enquiries`}
      />
      <DataTable
        rows={customers.map((c) => ({...c, _id: c.id}))}
        emptyMessage="No customers yet. They're created automatically the first time someone submits an enquiry."
        columns={[
          {header: 'Name', render: (c) => <span className="font-medium">{c.name}</span>},
          {header: 'Company', render: (c) => c.company || '—'},
          {header: 'Email', render: (c) => <span className="text-muted">{c.email}</span>},
          {header: 'Phone', render: (c) => c.phone || '—'},
          {header: 'Added', render: (c) => <span className="text-muted">{formatDateTime(c.created_at)}</span>},
        ]}
      />
    </div>
  )
}
