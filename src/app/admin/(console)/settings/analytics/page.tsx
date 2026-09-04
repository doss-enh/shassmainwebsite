import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextField, TextAreaField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['gaMeasurementId', 'gtmContainerId', 'metaPixelId', 'customHeadScripts']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function AnalyticsSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <TextField label="Google Analytics measurement ID" name="gaMeasurementId" defaultValue={settings?.gaMeasurementId} placeholder="G-XXXXXXX" />
      <TextField label="Google Tag Manager container ID" name="gtmContainerId" defaultValue={settings?.gtmContainerId} placeholder="GTM-XXXXXXX" />
      <TextField label="Meta Pixel ID" name="metaPixelId" defaultValue={settings?.metaPixelId} />
      <TextAreaField label="Custom head scripts" name="customHeadScripts" defaultValue={settings?.customHeadScripts} />
      <SaveButton />
    </form>
  )
}
