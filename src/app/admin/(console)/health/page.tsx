import {client} from '@sanity-lib/lib/client'
import {sql} from '@/lib/db'
import {PageHeader} from '@/components/admin/PageHeader'

export const dynamic = 'force-dynamic'

async function checkSanityRead() {
  try {
    await client.fetch(`*[0]`)
    return true
  } catch {
    return false
  }
}

async function checkDatabase() {
  try {
    await sql`select 1`
    return true
  } catch {
    return false
  }
}

function CheckRow({label, ok, detail}: {label: string; ok: boolean; detail?: string}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3.5 last:border-b-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {detail && <div className="text-xs text-muted">{detail}</div>}
      </div>
      <span className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? 'text-success' : 'text-danger'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-success' : 'bg-danger'}`} />
        {ok ? 'OK' : 'Not configured'}
      </span>
    </div>
  )
}

export default async function HealthPage() {
  const projectIdConfigured = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const writeTokenConfigured = !!process.env.SANITY_API_WRITE_TOKEN
  const databaseUrlConfigured = !!process.env.DATABASE_URL

  const [sanityReachable, databaseReachable] = await Promise.all([
    projectIdConfigured ? checkSanityRead() : Promise.resolve(false),
    databaseUrlConfigured ? checkDatabase() : Promise.resolve(false),
  ])

  return (
    <div>
      <PageHeader title="Health" description="Connectivity and configuration status." />
      <div className="max-w-xl overflow-hidden rounded-xl border border-border bg-card">
        <CheckRow label="Sanity project configured" ok={projectIdConfigured} detail="NEXT_PUBLIC_SANITY_PROJECT_ID" />
        <CheckRow label="Sanity dataset reachable" ok={sanityReachable} detail={process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'} />
        <CheckRow label="Sanity write access (imports, revalidation)" ok={writeTokenConfigured} detail="SANITY_API_WRITE_TOKEN" />
        <CheckRow label="Postgres configured" ok={databaseUrlConfigured} detail="DATABASE_URL" />
        <CheckRow label="Postgres reachable" ok={databaseReachable} detail="Enquiries, users, sessions, audit log" />
      </div>
    </div>
  )
}
