import 'server-only'
import {serverClient} from '@sanity-lib/lib/client'
import type {urlFor} from '@sanity-lib/lib/image'

export const BANNER_PLACEMENTS = ['homepage-hero', 'homepage-secondary', 'category-top'] as const
export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number]

export type BannerRow = {
  _id: string
  title: string
  heading?: string
  placement?: string
  active?: boolean
  sortOrder?: number
  image?: {desktop?: Parameters<typeof urlFor>[0]}
}

export async function listBanners(): Promise<BannerRow[]> {
  return serverClient.fetch(
    `*[_type == "banner"] | order(placement asc, coalesce(sortOrder, 999) asc, _createdAt asc) {
      _id, title, heading, placement, active, sortOrder, image
    }`,
  )
}

export async function setBannerActive(id: string, active: boolean) {
  await serverClient.patch(id).set({active}).commit()
}

export async function setBannerPlacement(id: string, placement: string) {
  if (!BANNER_PLACEMENTS.includes(placement as BannerPlacement)) return
  await serverClient.patch(id).set({placement}).commit()
}

export async function setBannerTitle(id: string, title: string) {
  if (!title.trim()) return
  await serverClient.patch(id).set({title: title.trim()}).commit()
}

/** Replaces the desktop artwork, keeping the alt text already on the field. */
export async function replaceBannerImage(id: string, file: File) {
  if (!file || file.size === 0 || !file.type.startsWith('image/')) return
  const asset = await serverClient.assets.upload('image', Buffer.from(await file.arrayBuffer()), {filename: file.name})
  const existingAlt = await serverClient.fetch<string | null>(`*[_id == $id][0].image.desktop.alt`, {id})
  await serverClient
    .patch(id)
    .set({
      'image.desktop': {
        _type: 'imageWithAlt',
        alt: existingAlt || undefined,
        asset: {_type: 'reference', _ref: asset._id},
      },
    })
    .commit()
}

export async function deleteBanner(id: string) {
  await serverClient.delete(id)
}

/**
 * Moves a banner one place within its own placement group. Order is stored as
 * a number, and imported banners have none, so the whole group is renumbered
 * from its current display order before the swap — otherwise the first move
 * on an unordered group would do nothing.
 */
export async function moveBanner(id: string, direction: 'up' | 'down') {
  const all = await listBanners()
  const target = all.find((b) => b._id === id)
  if (!target) return

  const group = all.filter((b) => b.placement === target.placement)
  const index = group.findIndex((b) => b._id === id)
  const swapWith = direction === 'up' ? index - 1 : index + 1
  if (swapWith < 0 || swapWith >= group.length) return

  const reordered = [...group]
  ;[reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]]

  const tx = reordered.reduce(
    (acc, banner, i) => acc.patch(banner._id, (p) => p.set({sortOrder: i + 1})),
    serverClient.transaction(),
  )
  await tx.commit()
}
