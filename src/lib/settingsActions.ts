'use server'

import {revalidatePath} from 'next/cache'
import {client, serverClient} from '@sanity-lib/lib/client'

const SETTINGS_DOC_ID = 'siteSettings-singleton'

export async function getOrCreateSettingsId() {
  const existing = await client.fetch<{_id: string} | null>(`*[_type == "siteSettings"][0]{_id}`).catch(() => null)
  return existing?._id || SETTINGS_DOC_ID
}

export async function updateSiteSettings(
  {
    textFields = [],
    numberFields = [],
    booleanFields = [],
    listFields = [],
    objectFields = {},
  }: {
    textFields?: string[]
    numberFields?: string[]
    booleanFields?: string[]
    listFields?: string[]
    /** e.g. {address: ['streetAddress', 'locality', 'region', 'country']} — form field names are `${object}.${subField}` */
    objectFields?: Record<string, string[]>
  },
  formData: FormData
) {
  const id = await getOrCreateSettingsId()
  const patch: Record<string, unknown> = {}

  for (const field of textFields) {
    const raw = formData.get(field)
    if (raw !== null) patch[field] = raw
  }
  for (const field of numberFields) {
    const raw = formData.get(field)
    if (raw !== null && raw !== '') patch[field] = Number(raw)
  }
  for (const field of booleanFields) {
    patch[field] = formData.get(field) === 'on'
  }
  for (const field of listFields) {
    const raw = String(formData.get(field) || '')
    patch[field] = raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
  for (const [object, subFields] of Object.entries(objectFields)) {
    const value: Record<string, string> = {}
    for (const sub of subFields) {
      const raw = formData.get(`${object}.${sub}`)
      if (raw !== null) value[sub] = String(raw)
    }
    patch[object] = value
  }

  await serverClient.createIfNotExists({_id: id, _type: 'siteSettings'})
  await serverClient.patch(id).set(patch).commit()
  revalidatePath('/admin/settings')
}
