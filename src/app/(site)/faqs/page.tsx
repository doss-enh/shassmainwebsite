import {client} from '@sanity-lib/lib/client'
import {allFaqsQuery} from '@sanity-lib/lib/queries'

export const revalidate = 300

type Faq = {_id: string; question: string; answer: string; category?: string}

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
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-semibold text-neutral-900">Frequently asked questions</h1>
      {faqs.length === 0 ? (
        <p className="text-neutral-500">No FAQs published yet.</p>
      ) : (
        <div className="divide-y divide-neutral-200">
          {faqs.map((faq) => (
            <details key={faq._id} className="group py-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-neutral-900 marker:content-none">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
