import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {postBySlugQuery} from '@sanity-lib/lib/queries'
import {PortableText} from '@/components/site/PortableText'
import {Breadcrumb} from '@/components/site/Breadcrumb'
import {formatDateTime} from '@/lib/format'

export const revalidate = 300

type Post = {
  _id: string
  title: string
  publishedAt?: string
  body?: any[]
}

async function getPost(slug: string) {
  try {
    return await client.fetch<Post | null>(postBySlugQuery, {slug})
  } catch {
    return null
  }
}

export default async function BlogPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div>
      <Breadcrumb trail={[{label: 'Blogs', href: '/blog'}, {label: post.title}]} />
      <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold text-neutral-900">{post.title}</h1>
      {post.publishedAt && <div className="mt-2 text-sm text-neutral-500">{formatDateTime(post.publishedAt)}</div>}
      {post.body && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <PortableText value={post.body} />
        </div>
      )}
      </article>
    </div>
  )
}
