import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {productCountQuery, categoryCountQuery} from '@sanity-lib/lib/queries'
import {getDashboardCounts, getRecentEnquiries, getEnquiryCreatedDatesInRange} from '@/lib/db/enquiries'
import {getSubscribedCount} from '@/lib/db/newsletter'
import {StatCard} from '@/components/admin/StatCard'
import {Panel} from '@/components/admin/Panel'
import {EnquiriesTrendChart} from '@/components/admin/EnquiriesTrendChart'
import {PipelineBar} from '@/components/admin/PipelineBar'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {buildDailySeries, formatShortDate, percentChange} from '@/lib/format'

export const dynamic = 'force-dynamic'

async function getData() {
  const [counts, recent, last14, subscribers, productsLive, categoriesCount] = await Promise.all([
    getDashboardCounts().catch(() => null),
    getRecentEnquiries().catch(() => []),
    getEnquiryCreatedDatesInRange(14).catch(() => []),
    getSubscribedCount().catch(() => 0),
    client.fetch<number>(productCountQuery).catch(() => 0),
    client.fetch<number>(categoryCountQuery).catch(() => 0),
  ])
  return {counts, recent, last14, subscribers, productsLive, categoriesCount}
}

const actionLinks = [
  {label: 'View enquiries', href: '/admin/enquiries'},
  {label: 'Products', href: '/admin/products'},
  {label: 'Pages', href: '/admin/pages'},
  {label: 'Blog', href: '/admin/blog-posts'},
  {label: 'Menus', href: '/admin/menus'},
  {label: 'Site settings', href: '/admin/settings/site'},
]

export default async function DashboardPage() {
  const {counts, recent, last14, subscribers, productsLive, categoriesCount} = await getData()

  const chartData = buildDailySeries(last14)
  const trendChange = counts ? percentChange(counts.last7Days, counts.prev7Days) : 0
  const closedCount = counts ? counts.won + counts.lost : 0
  const winRate = closedCount > 0 ? Math.round((counts!.won / closedCount) * 100) : null
  const pipelineMax = counts
    ? Math.max(
        counts.pipelineNew,
        counts.pipelineContacted,
        counts.pipelineQuoted,
        counts.pipelineNegotiation,
        counts.pipelineWon,
        counts.pipelineLost,
        1
      )
    : 1

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back.{' '}
            {!!counts?.needsReply && (
              <span className="font-medium text-danger">{counts.needsReply} enquiries need a reply.</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actionLinks.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/[0.03]"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {!counts && (
        <div className="mb-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          Couldn't reach the database. Run <code className="font-mono">npm run db:dev</code> and{' '}
          <code className="font-mono">npm run db:migrate</code>, then set <code className="font-mono">DATABASE_URL</code>.
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Needs a reply" sublabel="Oldest first" value={counts?.needsReply ?? '—'} accent={!!counts?.needsReply} />
        <StatCard label="In progress" sublabel="Contacted, quoted, negotiating" value={counts?.inProgress ?? '—'} />
        <StatCard
          label="Last 7 days"
          sublabel="vs previous 7"
          value={counts?.last7Days ?? '—'}
          change={counts ? {value: Math.abs(trendChange), direction: trendChange >= 0 ? 'up' : 'down'} : undefined}
        />
        <StatCard label="Win rate" sublabel={closedCount > 0 ? `${closedCount} closed enquiries` : 'No closed enquiries'} value={winRate === null ? '—' : `${winRate}%`} />
        <StatCard label="Subscribers" value={subscribers} />
        <StatCard label="Products live" sublabel={`${categoriesCount} categories`} value={productsLive} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Enquiries over 14 days" subtitle={`${last14.length} in total`} action={{label: 'All enquiries', href: '/admin/enquiries'}} className="lg:col-span-2">
          <EnquiriesTrendChart data={chartData} />
        </Panel>

        <Panel title="Pipeline" subtitle="Where enquiries currently sit">
          <PipelineBar label="New" value={counts?.pipelineNew ?? 0} max={pipelineMax} />
          <PipelineBar label="Contacted" value={counts?.pipelineContacted ?? 0} max={pipelineMax} />
          <PipelineBar label="Quoted" value={counts?.pipelineQuoted ?? 0} max={pipelineMax} />
          <PipelineBar label="Negotiation" value={counts?.pipelineNegotiation ?? 0} max={pipelineMax} />
          <PipelineBar label="Won" value={counts?.pipelineWon ?? 0} max={pipelineMax} />
          <PipelineBar label="Lost" value={counts?.pipelineLost ?? 0} max={pipelineMax} />
          <div className="pt-3 text-xs text-muted">{counts?.totalEnquiries ?? 0} enquiries all time</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Recent enquiries" action={{label: 'View all', href: '/admin/enquiries'}} className="lg:col-span-2">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-4 py-3 hover:opacity-80">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="font-mono text-xs text-muted">{e.enquiry_number}</span>
                        <span>{e.customer_name}</span>
                        {e.company && <span className="text-muted">· {e.company}</span>}
                      </div>
                      <div className="text-xs text-muted">
                        {e.item_count} product{e.item_count === 1 ? '' : 's'} (quotation)
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted">{formatShortDate(e.created_at)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Most asked about" subtitle="Last 14 days">
          <p className="py-8 text-center text-sm text-muted">Not enough data yet.</p>
        </Panel>
      </div>
    </div>
  )
}
