import {NextRequest, NextResponse} from 'next/server'
import {createFormSubmission} from '@/lib/db/formSubmissions'
import {fireWebhooks} from '@/lib/db/webhooks'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {name, email, phone, message} = body || {}

  if (!name || !email || !message) {
    return NextResponse.json({error: 'Name, email, and message are required.'}, {status: 400})
  }

  await createFormSubmission({formType: 'contact', name, email, phone, message, payload: body})
  await fireWebhooks('form_submission.created', {formType: 'contact', name, email})

  return NextResponse.json({ok: true})
}
