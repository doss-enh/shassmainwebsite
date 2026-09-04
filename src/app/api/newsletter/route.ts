import {NextRequest, NextResponse} from 'next/server'
import {serverClient} from '@sanity-lib/lib/client'

export async function POST(req: NextRequest) {
  const {email} = await req.json()
  if (!email || typeof email !== 'string') {
    return NextResponse.json({error: 'A valid email is required.'}, {status: 400})
  }

  const existing = await serverClient.fetch<{_id: string} | null>(
    `*[_type == "newsletterSubscriber" && email == $email][0]{_id}`,
    {email}
  )

  if (existing) {
    await serverClient.patch(existing._id).set({status: 'subscribed'}).commit()
  } else {
    await serverClient.create({
      _type: 'newsletterSubscriber',
      email,
      status: 'subscribed',
      subscribedAt: new Date().toISOString(),
    })
  }

  return NextResponse.json({ok: true})
}
