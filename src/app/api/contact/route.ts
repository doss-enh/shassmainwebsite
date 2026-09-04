import {NextRequest, NextResponse} from 'next/server'
import {serverClient} from '@sanity-lib/lib/client'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {name, email, phone, message} = body || {}

  if (!name || !email || !message) {
    return NextResponse.json({error: 'Name, email, and message are required.'}, {status: 400})
  }

  await serverClient.create({
    _type: 'formSubmission',
    formType: 'contact',
    name,
    email,
    phone: phone || undefined,
    message,
    payload: JSON.stringify(body),
    status: 'new',
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ok: true})
}
