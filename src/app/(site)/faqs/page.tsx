import {client} from '@sanity-lib/lib/client'
import {allFaqsQuery} from '@sanity-lib/lib/queries'
import {Breadcrumb} from '@/components/site/Breadcrumb'

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
    <div className="bg-white">
      <Breadcrumb trail={[{label: 'FAQs'}]} />
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Frequently Asked Questions</h1>
      <p className="mx-auto mb-10 max-w-xl text-sm text-neutral-600">
        Answers to the questions we hear most often about ordering, branding, and delivery.
      </p>

      {faqs.length === 0 ? (
        <p className="text-neutral-500">No FAQs published yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq._id} className="group rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-900 marker:content-none">
                {faq.question}
                <span className="ml-2 shrink-0 text-neutral-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
