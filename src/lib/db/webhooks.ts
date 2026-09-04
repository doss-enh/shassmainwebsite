import {sql} from '@/lib/db'

export type Webhook = {
  id: string
  name: string
  url: string
  event: string
  active: boolean
  created_at: string
}

export async function listWebhooks(): Promise<Webhook[]> {
  return sql<Webhook[]>`select id, name, url, event, active, created_at from webhook order by created_at desc`
}

export async function createWebhook(input: {name: string; url: string; event: string}) {
  await sql`insert into webhook (name, url, event) values (${input.name}, ${input.url}, ${input.event})`
}

const WEBHOOK_EVENTS = ['enquiry.created', 'form_submission.created', 'newsletter_subscriber.created'] as const
type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]

export async function fireWebhooks(event: WebhookEvent, payload: unknown) {
  try {
    const hooks = await sql<{url: string}[]>`select url from webhook where event = ${event} and active = true`
    await Promise.allSettled(
      hooks.map((h) =>
        fetch(h.url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({event, payload}),
        })
      )
    )
  } catch {
    // Never let a webhook failure break the request that triggered it.
  }
}
