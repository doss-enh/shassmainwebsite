import {client} from '@sanity-lib/lib/client'
import {allPostsQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Post = {_id: string; title: string; excerpt?: string; publishedAt?: string}

async function getPosts() {
  try {
    return await client.fetch<Post[]>(allPostsQuery)
  } catch {
    return []
  }
}

export default async function BlogPostsPage() {
  const posts = await getPosts()

  return (
    <div>
      <PageHeader
        title="Blog posts"
        description={`${posts.length} posts`}
        action={<StudioLinkButton href={studioCreateUrl('post')} label="New post" />}
      />
      <DataTable<Post>
        rows={posts}
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
          {header: 'Published', render: (p) => <span className="text-muted">{p.publishedAt ? formatDateTime(p.publishedAt) : '—'}</span>},
        ]}
      />
    </div>
  )
}
