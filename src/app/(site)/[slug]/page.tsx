import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {pageBySlugQuery} from '@sanity-lib/lib/queries'
import {PortableText} from '@/components/site/PortableText'

export const revalidate = 300

type Page = {_id: string; title: string; body?: any[]; published?: boolean}

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
  if (!page || page.published === false) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-neutral-900">{page.title}</h1>
      {page.body && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <PortableText value={page.body} />
        </div>
      )}
    </article>
  )
}
