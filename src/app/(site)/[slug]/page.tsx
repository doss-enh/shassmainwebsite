import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {pageBySlugQuery} from '@sanity-lib/lib/queries'
import {PortableText} from '@/components/site/PortableText'
import {Breadcrumb} from '@/components/site/Breadcrumb'
import {urlFor} from '@sanity-lib/lib/image'

export const revalidate = 300

type Page = {_id: string; title: string; body?: any[]; gallery?: any[]}

async function getPage(slug: string) {
  try {
    return await client.fetch<Page | null>(pageBySlugQuery, {slug})
  } catch {
    return null
  }
}

export default async function DynamicPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <div className="bg-white">
      <Breadcrumb trail={[{label: page.title}]} />
      <article className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="mb-8 text-center text-3xl font-bold text-neutral-900">{page.title}</h1>
        {page.body && (
          <div className="prose prose-neutral max-w-none">
            <PortableText value={page.body} />
          </div>
        )}

        {/* Logo wall — the Clients page is fifteen customer marks. */}
        {page.gallery && page.gallery.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {page.gallery.map((img, i) => {
              const src = urlFor(img)?.height(120).url()
              if (!src) return null
              return (
                <li key={i} className="flex h-[70px] items-center justify-center">
                  <img src={src} alt={img?.alt || ''} loading="lazy" className="max-h-full max-w-full object-contain" />
                </li>
              )
            })}
          </ul>
        )}
      </article>
    </div>
  )
}
