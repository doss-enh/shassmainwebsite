import {client} from '@sanity-lib/lib/client'
import {allPostsQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {Pagination} from '@/components/admin/Pagination'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

type Post = {_id: string; title: string; excerpt?: string; publishedAt?: string; author?: string}

async function getPosts() {
  try {
    return await client.fetch<Post[]>(allPostsQuery)
  } catch {
    return []
  }
}

export default async function BlogPostsPage({searchParams}: {searchParams: Promise<{page?: string}>}) {
  const {page: pageParam} = await searchParams
  const posts = await getPosts()

  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  // Clamp so a stale ?page= past the end lands on the last page.
  const page = Math.min(Math.max(1, Number(pageParam) || 1), pages)
  const rows = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title="Blog posts"
        description={`${posts.length} posts`}
        action={<StudioLinkButton href={studioCreateUrl('post')} label="New post" />}
      />
      <DataTable<Post>
        rows={rows}
        emptyMessage="No blog posts yet."
        columns={[
          {
            header: 'Post',
            render: (p) => (
              <a href={studioEditUrl('post', p._id)} className="font-medium hover:text-primary">
                {p.title}
              </a>
            ),
          },
          {header: 'Author', render: (p) => <span className="text-muted">{p.author || '—'}</span>},
          {header: 'Published', render: (p) => <span className="text-muted">{p.publishedAt ? formatDateTime(p.publishedAt) : '—'}</span>},
        ]}
      />
      <Pagination
        page={page}
        pages={pages}
        total={posts.length}
        label="posts"
        hrefFor={(n) => (n <= 1 ? '/admin/blog-posts' : `/admin/blog-posts?page=${n}`)}
      />
    </div>
  )
}
