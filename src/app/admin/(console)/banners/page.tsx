import {client} from '@sanity-lib/lib/client'
import {allBannersQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Banner = {_id: string; title: string; placement?: string; active?: boolean; image?: {desktop?: any}}

async function getBanners() {
  try {
    return await client.fetch<Banner[]>(allBannersQuery)
  } catch {
    return []
  }
}

export default async function BannersPage() {
  const banners = await getBanners()

  return (
    <div>
      <PageHeader
        title="Banners"
        description={`${banners.length} banners`}
        action={<StudioLinkButton href={studioCreateUrl('banner')} label="New banner" />}
      />
      <DataTable<Banner>
        rows={banners}
        emptyMessage="No banners yet."
        columns={[
          {
            header: 'Banner',
            render: (b) => {
              const img = urlFor(b.image?.desktop)?.width(80).height(48).url()
              return (
                <a href={studioEditUrl('banner', b._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{b.title}</span>
                </a>
              )
            },
          },
          {header: 'Placement', render: (b) => b.placement || '—'},
          {header: 'Status', render: (b) => (b.active ? 'Active' : 'Inactive')},
        ]}
      />
    </div>
  )
}
