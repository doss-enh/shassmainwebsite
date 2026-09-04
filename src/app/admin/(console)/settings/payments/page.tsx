import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextAreaField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['paymentsNote', 'bankDetails']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function PaymentsSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <p className="rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary-dark">
        This site takes no online payments — everything is quoted and invoiced manually after an enquiry. These fields
        appear on quotation documents.
      </p>
      <TextAreaField label="Payment terms note" name="paymentsNote" defaultValue={settings?.paymentsNote} />
      <TextAreaField label="Bank details (for quotes)" name="bankDetails" defaultValue={settings?.bankDetails} />
      <SaveButton />
    </form>
  )
}
