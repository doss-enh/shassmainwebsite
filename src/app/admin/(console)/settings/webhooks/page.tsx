import {client} from '@sanity-lib/lib/client'
import {allWebhooksQuery} from '@sanity-lib/lib/queries'
import {DataTable} from '@/components/admin/DataTable'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'

export const dynamic = 'force-dynamic'

type Webhook = {_id: string; name: string; url: string; event?: string; active?: boolean}

async function getWebhooks() {
  try {
    return await client.fetch<Webhook[]>(allWebhooksQuery)
  } catch {
    return []
  }
}

export default async function WebhooksSettingsPage() {
  const webhooks = await getWebhooks()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">Fire an HTTP request when an enquiry, form submission, or newsletter signup is created.</p>
        <StudioLinkButton href={studioCreateUrl('webhook')} label="New webhook" />
      </div>
      <DataTable<Webhook>
        rows={webhooks}
        emptyMessage="No webhooks configured."
        columns={[
          {
            header: 'Name',
            render: (w) => (
              <a href={studioEditUrl('webhook', w._id)} className="font-medium hover:text-primary">
                {w.name}
              </a>
            ),
          },
          {header: 'Event', render: (w) => <span className="font-mono text-xs text-muted">{w.event}</span>},
          {header: 'URL', render: (w) => <span className="text-muted">{w.url}</span>},
          {header: 'Status', render: (w) => (w.active ? 'Active' : 'Disabled')},
        ]}
      />
    </div>
  )
}
