import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextField, NumberField, ToggleField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['taxLabel']
const numberFields = ['taxRate']
const booleanFields = ['taxEnabled']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function TaxSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields, numberFields, booleanFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <ToggleField label="Show tax on quotes" name="taxEnabled" defaultChecked={settings?.taxEnabled} hint="Since this site is enquiry-only, tax is informational — shown on quotation PDFs, not charged online." />
      <TextField label="Tax label" name="taxLabel" defaultValue={settings?.taxLabel} placeholder="VAT" />
      <NumberField label="Tax rate (%)" name="taxRate" defaultValue={settings?.taxRate} />
      <SaveButton />
    </form>
  )
}
