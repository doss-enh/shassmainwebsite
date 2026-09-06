import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {allPostsQuery} from '@sanity-lib/lib/queries'
import {getStorefrontRoots} from '@/lib/storefrontRoots'
import {Breadcrumb} from '@/components/site/Breadcrumb'
import {formatDateTime} from '@/lib/format'
import {urlFor} from '@sanity-lib/lib/image'
import {JsonLd} from '@/components/site/JsonLd'
import {breadcrumbJsonLd} from '@/lib/seo'

const PAGE_SIZE = 9

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
}
type Category = {_id: string; name: string; slug?: {current: string}}

async function getData() {
  try {
    const [posts, categories] = await Promise.all([
      client.fetch<Post[]>(allPostsQuery),
      getStorefrontRoots(),
    ])
    return {posts, categories}
  } catch {
    return {posts: [] as Post[], categories: [] as Category[]}
  }
}

export default async function BlogPage({searchParams}: {searchParams: Promise<{page?: string}>}) {
  const {page: pageParam} = await searchParams
  const {posts, categories} = await getData()

  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  // Clamp so a stale ?page= lands on the last page rather than an empty grid.
  const page = Math.min(Math.max(1, Number(pageParam) || 1), pages)
  const pageItems = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageHref = (n: number) => (n <= 1 ? '/blog' : `/blog?page=${n}`)

  return (
    <div className="bg-white">
      <JsonLd data={breadcrumbJsonLd([{name: 'Home', path: '/'}, {name: 'Blogs', path: '/blog'}])} />
      <Breadcrumb trail={[{label: 'Blogs'}]} />

      <div className="site-container py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">Blogs</h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            {posts.length} articles{pages > 1 ? ` · page ${page} of ${pages}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {posts.length === 0 ? (
              <p className="text-neutral-500">No posts published yet.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {pageItems.map((post) => {
                  const img = urlFor(post.mainImage)?.width(640).height(400).url()
                  return (
                    <li key={post._id}>
                      <Link href={`/blog/${post.slug?.current}`} className="group block">
                        <div className="aspect-[16/10] overflow-hidden rounded-md bg-neutral-100">
                          {img && (
                            <img
                              src={img}
                              alt={post.mainImage?.alt || post.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                        </div>
                        <h2 className="mt-3 line-clamp-2 text-base font-bold text-neutral-900 group-hover:text-primary">
                          {post.title}
                        </h2>
                        <div className="mt-1.5 text-xs text-neutral-500">
                          {post.author && <span>By {post.author}</span>}
                          {post.author && post.publishedAt && <span aria-hidden="true"> · </span>}
                          {post.publishedAt && <span>{formatDateTime(post.publishedAt)}</span>}
                        </div>
                        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-neutral-600">{post.excerpt}</p>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}

            {pages > 1 && (
              <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-primary hover:text-primary">
                    ‹
                  </Link>
                )}
                {Array.from({length: pages}, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
                  .map((n, idx, arr) => (
                    <span key={n} className="flex items-center gap-1.5">
                      {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-neutral-400">…</span>}
                      <Link
                        href={pageHref(n)}
                        aria-current={n === page ? 'page' : undefined}
                        className={
                          n === page
                            ? 'rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-white'
                            : 'rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-primary hover:text-primary'
                        }
                      >
                        {n}
                      </Link>
                    </span>
                  ))}
                {page < pages && (
                  <Link href={pageHref(page + 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-primary hover:text-primary">
                    ›
                  </Link>
                )}
              </nav>
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
