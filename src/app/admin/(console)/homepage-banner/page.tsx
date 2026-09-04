import {client} from '@sanity-lib/lib/client'
import {homepageBannerQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Slide = {_key: string; title?: string; subtitle?: string; ctaLabel?: string; image?: any}
type Banner = {_id: string; slides?: Slide[]}

async function getBanner() {
  try {
    return await client.fetch<Banner | null>(homepageBannerQuery)
  } catch {
    return null
  }
}

export default async function HomepageBannerPage() {
  const banner = await getBanner()
  const slides = banner?.slides || []

  return (
    <div>
      <PageHeader
        title="Homepage banner"
        description={`${slides.length} slides`}
        action={banner && <StudioLinkButton href={studioEditUrl('homepageBanner', banner._id)} label="Edit in Studio" />}
      />
      {slides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted">
          No banner slides yet. Create the Homepage Banner document in Studio to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => {
            const img = urlFor(slide.image)?.width(400).height(240).url()
            return (
              <div key={slide._key} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-[5/3] bg-primary-soft">
                  {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-foreground">{slide.title || 'Untitled slide'}</div>
                  {slide.subtitle && <div className="text-xs text-muted">{slide.subtitle}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
