import {sql} from '@/lib/db'

export type FormSubmission = {
  id: string
  form_type: string
  name: string | null
  email: string | null
  phone: string | null
  status: string
  created_at: string
}

export async function createFormSubmission(input: {
  formType: string
  name?: string
  email?: string
  phone?: string
  message?: string
  payload?: unknown
}) {
  await sql`
    insert into form_submission (form_type, name, email, phone, message, payload)
    values (${input.formType}, ${input.name || null}, ${input.email || null}, ${input.phone || null}, ${input.message || null}, ${input.payload ? JSON.stringify(input.payload) : null})
  `
}

export async function listFormSubmissions(): Promise<FormSubmission[]> {
  return sql<FormSubmission[]>`
    select id, form_type, name, email, phone, status, created_at
    from form_submission order by created_at desc
  `
}
