import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {updateSiteSettings} from '@/lib/settingsActions'
import {TextField, NumberField, ToggleField, SaveButton} from '@/components/admin/SettingsFields'

export const dynamic = 'force-dynamic'

const textFields = ['recaptchaSiteKey']
const numberFields = ['rateLimitPerHour']
const booleanFields = ['recaptchaEnabled', 'honeypotEnabled']

async function getSettings() {
  try {
    return await client.fetch(siteSettingsQuery)
  } catch {
    return null
  }
}

export default async function SpamSettingsPage() {
  const settings = await getSettings()

  async function save(formData: FormData) {
    'use server'
    await updateSiteSettings({textFields, numberFields, booleanFields}, formData)
  }

  return (
    <form action={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <ToggleField label="Enable reCAPTCHA" name="recaptchaEnabled" defaultChecked={settings?.recaptchaEnabled} hint="Show Google reCAPTCHA on the enquiry and contact forms." />
      <TextField label="reCAPTCHA site key" name="recaptchaSiteKey" defaultValue={settings?.recaptchaSiteKey} />
      <ToggleField label="Enable honeypot field" name="honeypotEnabled" defaultChecked={settings?.honeypotEnabled} hint="Adds a hidden field that traps simple bots." />
      <NumberField label="Max submissions per IP / hour" name="rateLimitPerHour" defaultValue={settings?.rateLimitPerHour} />
      <SaveButton />
    </form>
  )
}
