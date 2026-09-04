import {client} from '@sanity-lib/lib/client'
import {PageHeader} from '@/components/admin/PageHeader'

export const dynamic = 'force-dynamic'

type Asset = {_id: string; url: string; originalFilename?: string; size?: number}

async function getAssets() {
  try {
    return await client.fetch<Asset[]>(
      `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...60] { _id, url, originalFilename, size }`
    )
  } catch {
    return []
  }
}

export default async function MediaPage() {
  const assets = await getAssets()

  return (
    <div>
      <PageHeader
        title="Media"
        description="Images uploaded across products, blog posts, and content. Upload new files from within Studio's editors."
      />
      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted">
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {assets.map((a) => (
            <a
              key={a._id}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="group aspect-square overflow-hidden rounded-lg border border-border bg-card"
            >
              <img src={`${a.url}?w=200&h=200&fit=crop`} alt={a.originalFilename || ''} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
