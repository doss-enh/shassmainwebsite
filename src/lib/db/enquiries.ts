import {sql} from '@/lib/db'

export type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'negotiation' | 'won' | 'lost'
export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'quoted', 'negotiation', 'won', 'lost']

export type EnquiryListRow = {
  id: string
  enquiry_number: string
  status: EnquiryStatus
  customer_name: string
  company: string | null
  email: string
  phone: string | null
  created_at: string
  item_count: number
  assigned_to: string | null
  follow_up_at: string | null
}

export type EnquiryItemInput = {
  productId: string
  productName: string
  productSku?: string
  productUrl?: string
  imageUrl?: string
  quantity: number
  note?: string
}

export type CreateEnquiryInput = {
  customerName: string
  company?: string
  email: string
  phone?: string
  message?: string
  source?: string
  items: EnquiryItemInput[]
}

async function nextEnquiryNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const rows = await sql<{count: string}[]>`
    select count(*)::text as count from enquiry where enquiry_number like ${'ENQ-' + year + '-%'}
  `
  const n = Number(rows[0]?.count || 0) + 1
  return `ENQ-${year}-${String(n).padStart(4, '0')}`
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<{id: string; enquiryNumber: string}> {
  const enquiryNumber = await nextEnquiryNumber()

  return sql.begin(async (tx) => {
    const [customer] = await tx<{id: string}[]>`
      insert into customer (name, email, phone, company)
      values (${input.customerName}, ${input.email}, ${input.phone || null}, ${input.company || null})
      on conflict (email) do update set
        name = excluded.name,
        phone = coalesce(excluded.phone, customer.phone),
        company = coalesce(excluded.company, customer.company),
        updated_at = now()
      returning id
    `

    const [enquiry] = await tx<{id: string}[]>`
      insert into enquiry (enquiry_number, customer_id, customer_name, company, email, phone, message, source)
      values (
        ${enquiryNumber}, ${customer.id}, ${input.customerName}, ${input.company || null},
        ${input.email}, ${input.phone || null}, ${input.message || null}, ${input.source || 'website'}
      )
      returning id
    `

    for (const item of input.items) {
      await tx`
        insert into enquiry_item (enquiry_id, product_id, product_name, product_sku, product_url, image_url, quantity, note)
        values (
          ${enquiry.id}, ${item.productId}, ${item.productName}, ${item.productSku || null},
          ${item.productUrl || null}, ${item.imageUrl || null}, ${item.quantity}, ${item.note || null}
        )
      `
    }

    return {id: enquiry.id, enquiryNumber}
  })
}

export async function listEnquiries(): Promise<EnquiryListRow[]> {
  return sql<EnquiryListRow[]>`
    select e.id, e.enquiry_number, e.status, e.customer_name, e.company, e.email, e.phone, e.created_at,
      e.assigned_to, e.follow_up_at,
      (select count(*) from enquiry_item ei where ei.enquiry_id = e.id)::int as item_count
    from enquiry e
    -- Anything due or overdue floats to the top; the rest stay newest-first.
    order by
      (e.follow_up_at is not null and e.follow_up_at <= now() and e.status not in ('won','lost')) desc,
      e.follow_up_at asc nulls last,
      e.created_at desc
  `
}

export type EnquiryDetail = {
  id: string
  enquiry_number: string
  status: EnquiryStatus
  customer_name: string
  company: string | null
  email: string
  phone: string | null
  message: string | null
  created_at: string
  assigned_to: string | null
  follow_up_at: string | null
  items: {
    id: string
    product_id: string
    product_name: string
    product_sku: string | null
    product_url: string | null
    image_url: string | null
    quantity: number
    note: string | null
  }[]
  notes: {id: string; text: string; author: string; created_at: string}[]
}

export async function getEnquiry(id: string): Promise<EnquiryDetail | null> {
  const [enquiry] = await sql<Omit<EnquiryDetail, 'items' | 'notes'>[]>`
    select id, enquiry_number, status, customer_name, company, email, phone, message, created_at,
      assigned_to, follow_up_at
    from enquiry where id = ${id}
  `
  if (!enquiry) return null

  const items = await sql<EnquiryDetail['items']>`
    select id, product_id, product_name, product_sku, product_url, image_url, quantity, note
    from enquiry_item where enquiry_id = ${id} order by created_at asc
  `
  const notes = await sql<EnquiryDetail['notes']>`
    select id, text, author, created_at from enquiry_note where enquiry_id = ${id} order by created_at asc
  `

  return {...enquiry, items, notes}
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  await sql`update enquiry set status = ${status}, updated_at = now() where id = ${id}`
}

export async function addEnquiryNote(id: string, text: string, author: string) {
  await sql`insert into enquiry_note (enquiry_id, text, author) values (${id}, ${text}, ${author})`
}

export type DashboardCounts = {
  needsReply: number
  inProgress: number
  last7Days: number
  prev7Days: number
  won: number
  lost: number
  pipelineNew: number
  pipelineContacted: number
  pipelineQuoted: number
  pipelineNegotiation: number
  pipelineWon: number
  pipelineLost: number
  totalEnquiries: number
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [row] = await sql<
    {
      needs_reply: string
      in_progress: string
      last_7_days: string
      prev_7_days: string
      won: string
      lost: string
      pipeline_new: string
      pipeline_contacted: string
      pipeline_quoted: string
      pipeline_negotiation: string
      pipeline_won: string
      pipeline_lost: string
      total: string
    }[]
  >`
    select
      count(*) filter (where status = 'new')::text as needs_reply,
      count(*) filter (where status in ('contacted','quoted','negotiation'))::text as in_progress,
      count(*) filter (where created_at > now() - interval '7 days')::text as last_7_days,
      count(*) filter (where created_at <= now() - interval '7 days' and created_at > now() - interval '14 days')::text as prev_7_days,
      count(*) filter (where status = 'won')::text as won,
      count(*) filter (where status = 'lost')::text as lost,
      count(*) filter (where status = 'new')::text as pipeline_new,
      count(*) filter (where status = 'contacted')::text as pipeline_contacted,
      count(*) filter (where status = 'quoted')::text as pipeline_quoted,
      count(*) filter (where status = 'negotiation')::text as pipeline_negotiation,
      count(*) filter (where status = 'won')::text as pipeline_won,
      count(*) filter (where status = 'lost')::text as pipeline_lost,
      count(*)::text as total
    from enquiry
  `

  return {
    needsReply: Number(row?.needs_reply || 0),
    inProgress: Number(row?.in_progress || 0),
    last7Days: Number(row?.last_7_days || 0),
    prev7Days: Number(row?.prev_7_days || 0),
    won: Number(row?.won || 0),
    lost: Number(row?.lost || 0),
    pipelineNew: Number(row?.pipeline_new || 0),
    pipelineContacted: Number(row?.pipeline_contacted || 0),
    pipelineQuoted: Number(row?.pipeline_quoted || 0),
    pipelineNegotiation: Number(row?.pipeline_negotiation || 0),
    pipelineWon: Number(row?.pipeline_won || 0),
    pipelineLost: Number(row?.pipeline_lost || 0),
    totalEnquiries: Number(row?.total || 0),
  }
}

export async function getRecentEnquiries(limit = 6): Promise<EnquiryListRow[]> {
  return sql<EnquiryListRow[]>`
    select e.id, e.enquiry_number, e.status, e.customer_name, e.company, e.email, e.phone, e.created_at,
      e.assigned_to, e.follow_up_at,
      (select count(*) from enquiry_item ei where ei.enquiry_id = e.id)::int as item_count
    from enquiry e
    -- Anything due or overdue floats to the top; the rest stay newest-first.
    order by
      (e.follow_up_at is not null and e.follow_up_at <= now() and e.status not in ('won','lost')) desc,
      e.follow_up_at asc nulls last,
      e.created_at desc
    limit ${limit}
  `
}

export async function getEnquiryCreatedDatesInRange(days = 14): Promise<string[]> {
  const rows = await sql<{created_at: string}[]>`
    select created_at from enquiry where created_at > now() - (${days} || ' days')::interval
  `
  return rows.map((r) => r.created_at)
}

export async function getNeedsReplyCount(): Promise<number> {
  const [row] = await sql<{count: string}[]>`select count(*)::text as count from enquiry where status = 'new'`
  return Number(row?.count || 0)
}


/** Who is chasing this enquiry, and when it is next due. */
export async function setEnquiryNurture(
  id: string,
  input: {assignedTo?: string | null; followUpAt?: string | null},
) {
  await sql`
    update enquiry set
      assigned_to = ${input.assignedTo ?? null},
      follow_up_at = ${input.followUpAt ? new Date(input.followUpAt) : null},
      updated_at = now()
    where id = ${id}
  `
}

export type FollowUpCounts = {due: number; upcoming: number; unassigned: number}

/** Open enquiries only — a won or lost one needs no chasing. */
export async function getFollowUpCounts(): Promise<FollowUpCounts> {
  const [row] = await sql<FollowUpCounts[]>`
    select
      count(*) filter (where follow_up_at is not null and follow_up_at <= now())::int as due,
      count(*) filter (where follow_up_at is not null and follow_up_at > now())::int as upcoming,
      count(*) filter (where assigned_to is null)::int as unassigned
    from enquiry
    where status not in ('won', 'lost')
  `
  return row || {due: 0, upcoming: 0, unassigned: 0}
}
