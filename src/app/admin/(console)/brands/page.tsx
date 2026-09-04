import {client} from '@sanity-lib/lib/client'
import {allBrandsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Brand = {_id: string; name: string; logo?: any}

async function getBrands() {
  try {
    return await client.fetch<Brand[]>(allBrandsQuery)
  } catch {
    return []
  }
}

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <div>
      <PageHeader
        title="Brands"
        description={`${brands.length} brands`}
        action={<StudioLinkButton href={studioCreateUrl('brand')} label="New brand" />}
      />
      <DataTable<Brand>
        rows={brands}
        emptyMessage="No brands yet."
        columns={[
          {
            header: 'Brand',
            render: (b) => {
              const img = urlFor(b.logo)?.width(64).height(64).url()
              return (
                <a href={studioEditUrl('brand', b._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{b.name}</span>
                </a>
              )
            },
          },
        ]}
      />
    </div>
  )
}
