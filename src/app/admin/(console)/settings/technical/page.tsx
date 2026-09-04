import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextAreaField, ToggleField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['robotsTxt']
const booleanFields = ['maintenanceMode']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function TechnicalSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields, booleanFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <ToggleField label="Maintenance mode" name="maintenanceMode" defaultChecked={settings?.maintenanceMode} hint="Shows a maintenance page to visitors while enabled." />
      <TextAreaField label="robots.txt override" name="robotsTxt" defaultValue={settings?.robotsTxt} />
      <SaveButton />
    </form>
  )
}
