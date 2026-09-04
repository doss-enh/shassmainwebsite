import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {blogPostBySlugQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PortableText} from '@/components/site/PortableText'
import {formatDateTime} from '@/lib/format'

export const revalidate = 300

type Post = {
  _id: string
  title: string
  coverImage?: any
  author?: string
  publishedAt: string
  body?: any[]
}

async function getPost(slug: string) {
  try {
    return await client.fetch<Post | null>(blogPostBySlugQuery, {slug})
  } catch {
    return null
  }
}

export default async function BlogPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const img = urlFor(post.coverImage)?.width(1200).height(600).url()

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-neutral-900">{post.title}</h1>
      <div className="mt-2 text-sm text-neutral-500">
        {post.author && <span>{post.author} · </span>}
        {formatDateTime(post.publishedAt)}
      </div>
      {img && <img src={img} alt="" className="mt-8 rounded-xl" />}
      {post.body && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <PortableText value={post.body} />
        </div>
      )}
    </article>
  )
}
