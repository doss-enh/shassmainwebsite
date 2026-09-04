import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextField, NumberField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['smtpHost', 'smtpUser', 'fromEmail']
const numberFields = ['smtpPort']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function SmtpSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields, numberFields, listFields: ['notifyEmails']}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <TextField label="SMTP host" name="smtpHost" defaultValue={settings?.smtpHost} />
      <NumberField label="SMTP port" name="smtpPort" defaultValue={settings?.smtpPort} />
      <TextField label="SMTP username" name="smtpUser" defaultValue={settings?.smtpUser} />
      <TextField label="From email address" name="fromEmail" defaultValue={settings?.fromEmail} />
      <TextField
        label="Notify on new enquiry (comma-separated emails)"
        name="notifyEmails"
        defaultValue={(settings?.notifyEmails || []).join(', ')}
      />
      <p className="text-xs text-muted">SMTP password is stored as a server environment variable, not here — set it alongside your deployment secrets.</p>
      <SaveButton />
    </form>
  )
}
