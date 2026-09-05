import Link from 'next/link'
import {notFound} from 'next/navigation'
import {client} from '@sanity-lib/lib/client'
import {postBySlugQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PortableText} from '@/components/site/PortableText'
import {Breadcrumb} from '@/components/site/Breadcrumb'
import {ShareLinks} from '@/components/site/ShareLinks'
import {formatDateTime} from '@/lib/format'

export const revalidate = 300

type Post = {
  _id: string
  title: string
  slug?: {current: string}
  excerpt?: string
  publishedAt?: string
  mainImage?: any
  author?: string
  category?: string
  tags?: string[]
  body?: any[]
}

async function getPost(slug: string) {
  try {
    return await client.fetch<Post | null>(postBySlugQuery, {slug})
  } catch {
    return null
  }
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {title: post.title, description: post.excerpt}
}

export default async function BlogPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const hero = urlFor(post.mainImage)?.width(1200).height(630).url()

  return (
    <div className="bg-white">
      <Breadcrumb trail={[{label: 'Blogs', href: '/blog'}, {label: post.title}]} />

      <article className="mx-auto max-w-3xl px-4 pb-14">
        <h1 className="font-heading text-3xl font-bold leading-tight text-neutral-900">{post.title}</h1>

        {/* Live shows "By <author> on <date>" beneath the title. */}
        <div className="mt-3 text-sm text-neutral-500">
          {post.author && <span>By {post.author}</span>}
          {post.author && post.publishedAt && <span aria-hidden="true"> · </span>}
          {post.publishedAt && <span>{formatDateTime(post.publishedAt)}</span>}
          {post.category && (
            <>
              <span aria-hidden="true"> · in </span>
              <span>{post.category}</span>
            </>
          )}
        </div>

        {hero && (
          <img
            src={hero}
            alt={post.mainImage?.alt || post.title}
            className="mt-6 w-full rounded-md object-cover"
          />
        )}

        {post.body && (
          <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary">
            <PortableText value={post.body} />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-neutral-500">Tags:</span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-neutral-100 px-2.5 py-1 text-neutral-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        <ShareLinks path={`/blog/${post.slug?.current || slug}`} title={post.title} />

        <Link href="/blog" className="mt-10 inline-block text-sm font-semibold text-primary hover:underline">
          ← Back to all posts
        </Link>
      </article>
    </div>
  )
}
