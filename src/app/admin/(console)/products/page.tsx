import {client} from '@sanity-lib/lib/client'
import {allProductsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Product = {
  _id: string
  title: string
  sku?: string
  featured?: boolean
  bestSeller?: boolean
  newProduct?: boolean
  stockStatus?: string
  featuredImage?: any
  category?: {name: string}
}

async function getProducts() {
  try {
    return await client.fetch<Product[]>(allProductsQuery)
  } catch {
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products`}
        action={<StudioLinkButton href={studioCreateUrl('product')} label="New product" />}
      />
      <DataTable<Product>
        rows={products}
        emptyMessage="No products yet. Create one to get started."
        columns={[
          {
            header: 'Product',
            render: (p) => {
              const img = urlFor(p.featuredImage)?.width(64).height(64).url()
              return (
                <a href={studioEditUrl('product', p._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{p.title}</span>
                  {p.featured && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark">Featured</span>}
                </a>
              )
            },
          },
          {header: 'SKU', render: (p) => <span className="text-muted">{p.sku || '—'}</span>},
          {header: 'Category', render: (p) => p.category?.name || '—'},
          {header: 'Stock', render: (p) => p.stockStatus || '—'},
        ]}
      />
    </div>
  )
}
