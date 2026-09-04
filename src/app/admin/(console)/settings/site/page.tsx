import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextField, TextAreaField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['siteName', 'tagline', 'currency', 'contactEmail', 'contactPhone', 'whatsapp', 'address']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function SiteSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <TextField label="Site name" name="siteName" defaultValue={settings?.siteName} />
      <TextField label="Tagline" name="tagline" defaultValue={settings?.tagline} />
      <TextField label="Display currency" name="currency" defaultValue={settings?.currency} placeholder="AED" />
      <TextField label="Contact email" name="contactEmail" defaultValue={settings?.contactEmail} />
      <TextField label="Contact phone" name="contactPhone" defaultValue={settings?.contactPhone} />
      <TextField label="WhatsApp number" name="whatsapp" defaultValue={settings?.whatsapp} />
      <TextAreaField label="Address" name="address" defaultValue={settings?.address} />
      <p className="text-xs text-muted">Logo, favicon, and social share image are managed in Studio (they need image uploads).</p>
      <SaveButton />
    </form>
  )
}
