import {NextRequest, NextResponse} from 'next/server'
import {subscribeToNewsletter} from '@/lib/db/newsletter'
import {fireWebhooks} from '@/lib/db/webhooks'

export async function POST(req: NextRequest) {
  const {email} = await req.json()
  if (!email || typeof email !== 'string') {
    return NextResponse.json({error: 'A valid email is required.'}, {status: 400})
  }

  await subscribeToNewsletter(email)
  await fireWebhooks('newsletter_subscriber.created', {email})

  return NextResponse.json({ok: true})
}
