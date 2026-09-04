import {client} from '@sanity-lib/lib/client'
import {allCataloguesQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'

export const revalidate = 300

type Catalogue = {_id: string; title: string; description?: string; coverImage?: any; published?: boolean; file?: {asset?: {url: string}}}

async function getCatalogues() {
  try {
    const items = await client.fetch<Catalogue[]>(allCataloguesQuery)
    return items.filter((c) => c.published !== false)
  } catch {
    return []
  }
}

export default async function CataloguePage() {
  const catalogues = await getCatalogues()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Download our catalogue</h1>
      <p className="mb-8 text-neutral-600">Browse our full product range offline, or share it with your team.</p>

      {catalogues.length === 0 ? (
        <p className="text-neutral-500">No catalogues published yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {catalogues.map((c) => {
            const img = urlFor(c.coverImage)?.width(400).height(280).url()
            return (
              <div key={c._id} className="overflow-hidden rounded-xl border border-neutral-200">
                <div className="aspect-[4/3] bg-neutral-100">
                  {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold text-neutral-900">{c.title}</div>
                  {c.description && <p className="mt-1 text-sm text-neutral-600">{c.description}</p>}
                  <a
                    href="/contact"
                    className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
                  >
                    Request a copy
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
