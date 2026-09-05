import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {allPostsQuery, topLevelCategoriesQuery} from '@sanity-lib/lib/queries'
import {Breadcrumb} from '@/components/site/Breadcrumb'
import {formatDateTime} from '@/lib/format'

export const revalidate = 300

type Post = {_id: string; title: string; slug?: {current: string}; excerpt?: string; publishedAt?: string}
type Category = {_id: string; name: string; slug?: {current: string}}

async function getData() {
  try {
    const [posts, categories] = await Promise.all([
      client.fetch<Post[]>(allPostsQuery),
      client.fetch<Category[]>(topLevelCategoriesQuery),
    ])
    return {posts, categories}
  } catch {
    return {posts: [] as Post[], categories: [] as Category[]}
  }
}

export default async function BlogPage() {
  const {posts, categories} = await getData()

  return (
    <div className="bg-white">
      <Breadcrumb trail={[{label: 'Blogs'}]} />

      <div className="site-container py-12">
        <h1 className="mb-10 text-center text-3xl font-semibold text-neutral-900">Blogs</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {posts.length === 0 ? (
              <p className="text-neutral-500">No posts published yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {posts.map((post) => (
                  <li key={post._id} className="py-6 first:pt-0">
                    <Link href={`/blog/${post.slug?.current}`} className="group block">
                      <h2 className="text-lg font-bold text-neutral-900 group-hover:text-primary">{post.title}</h2>
                      {post.publishedAt && (
                        <div className="mt-1 text-xs text-neutral-500">{formatDateTime(post.publishedAt)}</div>
                      )}
                      {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-neutral-600">{post.excerpt}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="space-y-8">
            {categories.length > 0 && (
              <div>
                <h3 className="mb-3 text-base font-bold text-neutral-900">Categories</h3>
                <ul className="space-y-1.5 text-sm text-neutral-600">
                  {categories.map((c) => (
                    <li key={c._id}>
                      <Link href={`/products?category=${c.slug?.current}`} className="hover:text-primary">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {posts.length > 0 && (
              <div>
                <h3 className="mb-3 text-base font-bold text-neutral-900">Recent Posts</h3>
                <ul className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <li key={post._id}>
                      <Link href={`/blog/${post.slug?.current}`} className="text-[13px] font-medium text-neutral-700 hover:text-primary">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
