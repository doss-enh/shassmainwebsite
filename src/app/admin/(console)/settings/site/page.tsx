import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['siteName', 'tagline', 'legalName', 'email', 'phone', 'whatsapp']
const objectFields = {address: ['streetAddress', 'locality', 'region', 'country']}

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function SiteSettingsPage() {
  const settings = await getSettings()
  const address = settings?.address || {}

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields, objectFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <TextField label="Site name" name="siteName" defaultValue={settings?.siteName} />
      <TextField label="Tagline" name="tagline" defaultValue={settings?.tagline} />
      <TextField label="Legal company name" name="legalName" defaultValue={settings?.legalName} />
      <TextField label="Contact email" name="email" defaultValue={settings?.email} />
      <TextField label="Contact phone" name="phone" defaultValue={settings?.phone} />
      <TextField label="WhatsApp number" name="whatsapp" defaultValue={settings?.whatsapp} />

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">Address</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="Street address" name="address.streetAddress" defaultValue={address.streetAddress} />
          <TextField label="Locality" name="address.locality" defaultValue={address.locality} />
          <TextField label="Region" name="address.region" defaultValue={address.region} />
          <TextField label="Country" name="address.country" defaultValue={address.country} />
        </div>
      </div>

      <p className="text-xs text-muted">Logo, social links, announcements, and trust badges are managed in Studio (they need images and repeatable lists).</p>
      <SaveButton />
    </form>
  )
}
