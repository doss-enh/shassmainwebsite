import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {pageBySlugQuery} from '@sanity-lib/lib/queries'
import {PortableText} from '@/components/site/PortableText'
import {Breadcrumb} from '@/components/site/Breadcrumb'

export const revalidate = 300

type Page = {_id: string; title: string; body?: any[]}

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
      </article>
    </div>
  )
}
