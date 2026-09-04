import {client} from '@sanity-lib/lib/client'
import {allRedirectsQuery} from '@sanity-lib/lib/queries'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Redirect = {_id: string; source: string; destination: string; type?: string}

async function getRedirects() {
  try {
    return await client.fetch<Redirect[]>(allRedirectsQuery)
  } catch {
    return []
  }
}

export default async function RedirectsSettingsPage() {
  const redirects = await getRedirects()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">Old URLs that should forward to a new path.</p>
        <StudioLinkButton href={studioCreateUrl('redirect')} label="New redirect" />
      </div>
      <DataTable<Redirect>
        rows={redirects}
        emptyMessage="No redirects configured."
        columns={[
          {
            header: 'Source',
            render: (r) => (
              <a href={studioEditUrl('redirect', r._id)} className="font-mono text-xs font-medium hover:text-primary">
                {r.source}
              </a>
            ),
          },
          {header: 'Destination', render: (r) => <span className="font-mono text-xs text-muted">{r.destination}</span>},
          {header: 'Type', render: (r) => r.type},
        ]}
      />
    </div>
  )
}
