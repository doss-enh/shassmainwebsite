import {revalidatePath} from 'next/cache'
import {listAssets, uploadAssets, deleteAssets, MEDIA_PAGE_SIZE} from '@/lib/media'
import {getCurrentUser} from '@/lib/auth'
import {logAudit} from '@/lib/db/auditLog'
import {PageHeader} from '@/components/admin/PageHeader'
import {Pagination} from '@/components/admin/Pagination'
import {MediaGrid} from '@/components/admin/MediaGrid'

export const dynamic = 'force-dynamic'

async function upload(formData: FormData) {
  'use server'
  const files = formData.getAll('files').filter((f): f is File => f instanceof File)
  const result = await uploadAssets(files)
  if (result.uploaded) {
    const actor = await getCurrentUser()
    await logAudit({actor: actor?.email || 'console', action: 'media.uploaded', target: `${result.uploaded} file(s)`})
  }
  revalidatePath('/admin/media')
  return result
}

async function remove(ids: string[]) {
  'use server'
  const result = await deleteAssets(ids)
  if (result.deleted) {
    const actor = await getCurrentUser()
    await logAudit({actor: actor?.email || 'console', action: 'media.deleted', target: `${result.deleted} asset(s)`})
  }
  revalidatePath('/admin/media')
  return result
}

export default async function MediaPage({searchParams}: {searchParams: Promise<{page?: string}>}) {
  const {page: pageParam} = await searchParams
  const requested = Math.max(1, Number(pageParam) || 1)

  const {assets, total, pages} = await listAssets(requested).catch(() => ({assets: [], total: 0, pages: 1}))
  // Clamp so a stale ?page= past the end shows the last page, not an empty grid.
  const page = Math.min(requested, pages)
  const shown = page === requested ? assets : (await listAssets(page)).assets

  return (
    <div>
      <PageHeader
        title="Media"
        description={`${total} images across products, blog posts and content · ${MEDIA_PAGE_SIZE} per page`}
      />

      <MediaGrid assets={shown} onUpload={upload} onDelete={remove} />

      <Pagination page={page} pages={pages} total={total} label="images" hrefFor={(n) => (n <= 1 ? '/admin/media' : `/admin/media?page=${n}`)} />
    </div>
  )
}
