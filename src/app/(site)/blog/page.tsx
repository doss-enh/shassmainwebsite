import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {allBlogPostsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {formatDateTime} from '@/lib/format'

export const revalidate = 300

type Post = {_id: string; title: string; slug?: {current: string}; coverImage?: any; author?: string; publishedAt: string}

async function getPosts() {
  try {
    return await client.fetch<Post[]>(allBlogPostsQuery)
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-semibold text-neutral-900">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-neutral-500">No posts published yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const img = urlFor(post.coverImage)?.width(500).height(320).url()
            return (
              <Link key={post._id} href={`/blog/${post.slug?.current}`} className="group block">
                <div className="aspect-[3/2] overflow-hidden rounded-xl bg-neutral-100">
                  {img && <img src={img} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                </div>
                <div className="mt-3 text-xs text-neutral-500">{formatDateTime(post.publishedAt)}</div>
                <h2 className="mt-1 text-lg font-semibold text-neutral-900 group-hover:text-primary">{post.title}</h2>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
