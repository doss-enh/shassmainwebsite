import {sql} from '@/lib/db'

export type NewsletterSubscriber = {
  id: string
  email: string
  status: string
  subscribed_at: string
}

export async function subscribeToNewsletter(email: string) {
  await sql`
    insert into newsletter_subscriber (email, status)
    values (${email}, 'subscribed')
    on conflict (email) do update set status = 'subscribed'
  `
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  return sql<NewsletterSubscriber[]>`
    select id, email, status, subscribed_at from newsletter_subscriber order by subscribed_at desc
  `
}

export async function getSubscribedCount(): Promise<number> {
  const [row] = await sql<{count: string}[]>`
    select count(*)::text as count from newsletter_subscriber where status = 'subscribed'
  `
  return Number(row?.count || 0)
}
