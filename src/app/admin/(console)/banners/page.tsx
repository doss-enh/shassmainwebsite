import {revalidatePath} from 'next/cache'
import {urlFor} from '@sanity-lib/lib/image'
import {
  listBanners,
  setBannerActive,
  setBannerPlacement,
  setBannerTitle,
  replaceBannerImage,
  deleteBanner,
  moveBanner,
  BANNER_PLACEMENTS,
} from '@/lib/banners'
import {getCurrentUser} from '@/lib/auth'
import {logAudit} from '@/lib/db/auditLog'
import {PageHeader} from '@/components/admin/PageHeader'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'
import {BannerCard} from '@/components/admin/BannerCard'

export const dynamic = 'force-dynamic'

async function audit(action: string, target: string) {
  const actor = await getCurrentUser()
  await logAudit({actor: actor?.email || 'console', action, target})
}

async function toggleActive(id: string, active: boolean) {
  'use server'
  await setBannerActive(id, active)
  await audit('banner.active_changed', `${id} -> ${active ? 'active' : 'inactive'}`)
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

async function changePlacement(id: string, placement: string) {
  'use server'
  await setBannerPlacement(id, placement)
  await audit('banner.placement_changed', `${id} -> ${placement}`)
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

async function rename(id: string, title: string) {
  'use server'
  await setBannerTitle(id, title)
  await audit('banner.renamed', title)
  revalidatePath('/admin/banners')
}

async function changeImage(id: string, formData: FormData) {
  'use server'
  const file = formData.get('image')
  if (file instanceof File) {
    await replaceBannerImage(id, file)
    await audit('banner.image_replaced', id)
  }
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

async function move(id: string, direction: 'up' | 'down') {
  'use server'
  await moveBanner(id, direction)
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

async function remove(id: string) {
  'use server'
  await deleteBanner(id)
  await audit('banner.deleted', id)
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

export default async function BannersPage() {
  const banners = await listBanners().catch(() => [])

  // Grouped by placement, because ordering only means anything within a group.
  const groups = BANNER_PLACEMENTS.map((placement) => ({
    placement,
    rows: banners.filter((b) => b.placement === placement),
  })).filter((g) => g.rows.length > 0)

  const unplaced = banners.filter((b) => !BANNER_PLACEMENTS.includes(b.placement as never))

  return (
    <div>
      <PageHeader
        title="Banners"
        description={`${banners.length} banners · edit here, or open Studio for headings and links`}
        action={<StudioLinkButton href={studioCreateUrl('banner')} label="New banner" />}
      />

      {banners.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted">No banners yet.</div>
      )}

      {[...groups, ...(unplaced.length ? [{placement: 'No placement', rows: unplaced}] : [])].map((group) => (
        <section key={group.placement} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {group.placement} <span className="font-normal text-muted">· {group.rows.length}</span>
          </h2>
          <div className="space-y-3">
            {group.rows.map((b, i) => (
              <BannerCard
                key={b._id}
                banner={{
                  id: b._id,
                  title: b.title,
                  heading: b.heading,
                  placement: b.placement || '',
                  active: !!b.active,
                  image: urlFor(b.image?.desktop)?.width(320).height(140).url() || null,
                  studioUrl: studioEditUrl('banner', b._id),
                }}
                placements={[...BANNER_PLACEMENTS]}
                isFirst={i === 0}
                isLast={i === group.rows.length - 1}
                onToggleActive={toggleActive}
                onChangePlacement={changePlacement}
                onRename={rename}
                onChangeImage={changeImage}
                onMove={move}
                onDelete={remove}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
