import {client} from '@sanity-lib/lib/client'
import {allBlogPostsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Post = {_id: string; title: string; coverImage?: any; author?: string; category?: string; publishedAt: string}

async function getPosts() {
  try {
    return await client.fetch<Post[]>(allBlogPostsQuery)
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
        action={<StudioLinkButton href={studioCreateUrl('blogPost')} label="New post" />}
      />
      <DataTable<Post>
        rows={posts}
        emptyMessage="No blog posts yet."
        columns={[
          {
            header: 'Post',
            render: (p) => {
              const img = urlFor(p.coverImage)?.width(64).height(64).url()
              return (
                <a href={studioEditUrl('blogPost', p._id)} className="flex items-center gap-3 hover:text-primary">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{p.title}</span>
                </a>
              )
            },
          },
          {header: 'Author', render: (p) => p.author || '—'},
          {header: 'Category', render: (p) => p.category || '—'},
          {header: 'Published', render: (p) => <span className="text-muted">{formatDateTime(p.publishedAt)}</span>},
        ]}
      />
    </div>
  )
}
