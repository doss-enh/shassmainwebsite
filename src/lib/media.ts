import 'server-only'
import {serverClient} from '@sanity-lib/lib/client'

export const MEDIA_PAGE_SIZE = 60

export type MediaAsset = {
  _id: string
  url: string
  originalFilename?: string
  size?: number
  width?: number
  height?: number
  _createdAt: string
  /** How many documents point at this asset — 0 means it is safe to delete. */
  uses: number
}

export async function listAssets(page: number): Promise<{assets: MediaAsset[]; total: number; pages: number}> {
  const current = Math.max(1, page)
  const start = (current - 1) * MEDIA_PAGE_SIZE

  const {assets, total} = await serverClient.fetch<{assets: MediaAsset[]; total: number}>(
    `{
      "assets": *[_type == "sanity.imageAsset"] | order(_createdAt desc) [$start...$end] {
        _id, url, originalFilename, size, _createdAt,
        "width": metadata.dimensions.width,
        "height": metadata.dimensions.height,
        "uses": count(*[references(^._id)])
      },
      "total": count(*[_type == "sanity.imageAsset"])
    }`,
    {start, end: start + MEDIA_PAGE_SIZE},
  )

  return {assets, total, pages: Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE))}
}

export async function uploadAssets(files: File[]): Promise<{uploaded: number; failed: string[]}> {
  const failed: string[] = []
  let uploaded = 0

  for (const file of files) {
    if (!file || file.size === 0) continue
    if (!file.type.startsWith('image/')) {
      failed.push(`${file.name}: not an image`)
      continue
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      await serverClient.assets.upload('image', buffer, {filename: file.name})
      uploaded++
    } catch (err) {
      failed.push(`${file.name}: ${(err as Error).message}`)
    }
  }

  return {uploaded, failed}
}

/**
 * Deletes only assets nothing references. Sanity refuses to drop an asset
 * that is still in use, and the raw error is unhelpful, so in-use ones are
 * reported back by name instead of failing the whole batch.
 */
export async function deleteAssets(ids: string[]): Promise<{deleted: number; blocked: string[]}> {
  if (!ids.length) return {deleted: 0, blocked: []}

  const rows = await serverClient.fetch<{_id: string; originalFilename?: string; uses: number}[]>(
    `*[_type == "sanity.imageAsset" && _id in $ids]{_id, originalFilename, "uses": count(*[references(^._id)])}`,
    {ids},
  )

  const blocked: string[] = []
  let deleted = 0

  for (const row of rows) {
    if (row.uses > 0) {
      blocked.push(`${row.originalFilename || row._id} (used by ${row.uses} document${row.uses === 1 ? '' : 's'})`)
      continue
    }
    try {
      await serverClient.delete(row._id)
      deleted++
    } catch (err) {
      blocked.push(`${row.originalFilename || row._id}: ${(err as Error).message}`)
    }
  }

  return {deleted, blocked}
}
