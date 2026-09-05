import {client} from '@sanity-lib/lib/client'
import {pageBySlugQuery, siteSettingsQuery} from '@sanity-lib/lib/queries'
import {PortableText} from '@/components/site/PortableText'
import {ContactForm} from '@/components/site/ContactForm'
import {Breadcrumb} from '@/components/site/Breadcrumb'

export const revalidate = 300

async function getData() {
  try {
    const [page, settings] = await Promise.all([
      client.fetch(pageBySlugQuery, {slug: 'contact'}),
      client.fetch(siteSettingsQuery),
    ])
    return {page, settings}
  } catch {
    return {page: null, settings: null}
  }
}

export default async function ContactPage() {
  const {page, settings} = await getData()
  const address = settings?.address as {streetAddress?: string; locality?: string; region?: string; country?: string} | undefined
  const addressLine = address ? [address.streetAddress, address.locality, address.region, address.country].filter(Boolean).join(', ') : undefined
  const mapQuery = addressLine ? encodeURIComponent(addressLine) : undefined

  return (
    <div>
      <Breadcrumb trail={[{label: page?.title || 'Contact'}]} />
      <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold text-neutral-900">{page?.title || 'Contact'}</h1>

      {mapQuery && (
        <div className="mb-10 aspect-[16/6] w-full overflow-hidden rounded-sm border border-neutral-200">
          <iframe
            title="Location map"
            className="h-full w-full"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          {page?.body ? (
            <div className="prose prose-neutral max-w-none">
              <PortableText value={page.body} />
            </div>
          ) : (
            <p className="text-neutral-600">Have a question that's not about a specific product? Send us a message.</p>
          )}
        </div>

        <div className="rounded-sm border border-neutral-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
      </div>
    </div>
  )
}
