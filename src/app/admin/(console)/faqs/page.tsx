import {client} from '@sanity-lib/lib/client'
import {allFaqsQuery} from '@sanity-lib/lib/queries'
import {PageHeader} from '@/components/admin/PageHeader'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Faq = {_id: string; question: string; category?: string}

async function getFaqs() {
  try {
    return await client.fetch<Faq[]>(allFaqsQuery)
  } catch {
    return []
  }
}

export default async function FaqsPage() {
  const faqs = await getFaqs()

  return (
    <div>
      <PageHeader
        title="FAQs"
        description={`${faqs.length} questions`}
        action={<StudioLinkButton href={studioCreateUrl('faq')} label="New FAQ" />}
      />
      <DataTable<Faq>
        rows={faqs}
        emptyMessage="No FAQs yet."
        columns={[
          {
            header: 'Question',
            render: (f) => (
              <a href={studioEditUrl('faq', f._id)} className="font-medium hover:text-primary">
                {f.question}
              </a>
            ),
          },
          {header: 'Category', render: (f) => f.category || '—'},
        ]}
      />
    </div>
  )
}
