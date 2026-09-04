import {notFound} from 'next/navigation'
import Link from 'next/link'
import {revalidatePath} from 'next/cache'
import {getEnquiry, updateEnquiryStatus, addEnquiryNote, ENQUIRY_STATUSES, type EnquiryStatus} from '@/lib/db/enquiries'
import {logAudit} from '@/lib/db/auditLog'
import {getCurrentUser} from '@/lib/auth'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {formatDateTime} from '@/lib/format'

export const dynamic = 'force-dynamic'

async function updateStatus(id: string, formData: FormData) {
  'use server'
  const status = String(formData.get('status')) as EnquiryStatus
  await updateEnquiryStatus(id, status)
  const user = await getCurrentUser()
  await logAudit({actor: user?.email || 'console', action: 'enquiry.status_changed', target: id, metadata: {status}})
  revalidatePath(`/admin/enquiries/${id}`)
  revalidatePath('/admin/enquiries')
  revalidatePath('/admin/dashboard')
}

async function addNote(id: string, formData: FormData) {
  'use server'
  const text = String(formData.get('text') || '').trim()
  if (!text) return
  const user = await getCurrentUser()
  await addEnquiryNote(id, text, user?.name || 'Console')
  revalidatePath(`/admin/enquiries/${id}`)
}

export default async function EnquiryDetailPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const enquiry = await getEnquiry(id).catch(() => null)
  if (!enquiry) notFound()

  const boundUpdateStatus = updateStatus.bind(null, id)
  const boundAddNote = addNote.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/enquiries" className="mb-4 inline-block text-sm text-muted hover:text-foreground">
        ← All enquiries
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
            {enquiry.enquiry_number}
            <StatusBadge status={enquiry.status} />
          </h1>
          <p className="mt-1 text-sm text-muted">Submitted {formatDateTime(enquiry.created_at)}</p>
        </div>
        <form action={boundUpdateStatus} className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={enquiry.status}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            Update
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 text-sm font-semibold text-foreground">Products enquired</div>
            {enquiry.items.length === 0 && <p className="text-sm text-muted">No products attached to this enquiry.</p>}
            <ul className="divide-y divide-border">
              {enquiry.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{item.product_name}</div>
                    <div className="truncate text-xs text-muted">
                      {item.product_sku && <span className="font-mono">{item.product_sku}</span>}
                      {item.note && <span>{item.product_sku ? ' · ' : ''}{item.note}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-muted">Qty: {item.quantity}</div>
                </li>
              ))}
            </ul>
          </div>

          {enquiry.message && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 text-sm font-semibold text-foreground">Message</div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{enquiry.message}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 text-sm font-semibold text-foreground">Internal notes</div>
            <ul className="mb-4 space-y-3">
              {enquiry.notes.map((note) => (
                <li key={note.id} className="rounded-lg bg-black/[0.02] p-3 text-sm">
                  <p className="text-foreground/90">{note.text}</p>
                  <p className="mt-1 text-xs text-muted">
                    {note.author} · {formatDateTime(note.created_at)}
                  </p>
                </li>
              ))}
              {enquiry.notes.length === 0 && <p className="text-sm text-muted">No internal notes yet.</p>}
            </ul>
            <form action={boundAddNote} className="flex gap-2">
              <input
                name="text"
                placeholder="Add a note…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-black/[0.03]">
                Add
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 text-sm font-semibold text-foreground">Customer</div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Name</dt>
                <dd className="text-foreground">{enquiry.customer_name}</dd>
              </div>
              {enquiry.company && (
                <div>
                  <dt className="text-xs text-muted">Company</dt>
                  <dd className="text-foreground">{enquiry.company}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="text-foreground">
                  <a href={`mailto:${enquiry.email}`} className="text-primary hover:underline">
                    {enquiry.email}
                  </a>
                </dd>
              </div>
              {enquiry.phone && (
                <div>
                  <dt className="text-xs text-muted">Phone</dt>
                  <dd className="text-foreground">{enquiry.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
