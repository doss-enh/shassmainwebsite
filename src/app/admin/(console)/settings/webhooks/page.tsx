import {revalidatePath} from 'next/cache'
import {listWebhooks, createWebhook} from '@/lib/db/webhooks'
import {DataTable} from '@/components/admin/DataTable'

export const dynamic = 'force-dynamic'

const events = ['enquiry.created', 'form_submission.created', 'newsletter_subscriber.created']

async function addWebhook(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '').trim()
  const url = String(formData.get('url') || '').trim()
  const event = String(formData.get('event') || events[0])
  if (!name || !url) return
  await createWebhook({name, url, event})
  revalidatePath('/admin/settings/webhooks')
}

export default async function WebhooksSettingsPage() {
  const webhooks = await listWebhooks().catch(() => [])

  return (
    <div>
      <p className="mb-4 text-sm text-muted">Fire an HTTP POST when an enquiry, form submission, or newsletter signup is created.</p>

      <form action={addWebhook} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
        <input name="name" placeholder="Name" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <input name="url" type="url" placeholder="https://…" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <select name="event" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {events.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Add webhook</button>
      </form>

      <DataTable
        rows={webhooks.map((w) => ({...w, _id: w.id}))}
        emptyMessage="No webhooks configured."
        columns={[
          {header: 'Name', render: (w) => <span className="font-medium">{w.name}</span>},
          {header: 'Event', render: (w) => <span className="font-mono text-xs text-muted">{w.event}</span>},
          {header: 'URL', render: (w) => <span className="text-muted">{w.url}</span>},
          {header: 'Status', render: (w) => (w.active ? 'Active' : 'Disabled')},
        ]}
      />
    </div>
  )
}
