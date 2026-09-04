import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {dashboardEnquiryCountsQuery, enquiriesOver14DaysQuery, recentEnquiriesQuery} from '@sanity-lib/lib/queries'
import {StatCard} from '@/components/admin/StatCard'
import {Panel} from '@/components/admin/Panel'
import {EnquiriesTrendChart} from '@/components/admin/EnquiriesTrendChart'
import {PipelineBar} from '@/components/admin/PipelineBar'
import {StatusBadge} from '@/components/admin/StatusBadge'
import {buildDailySeries, formatShortDate, percentChange} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Counts = {
  needsReply: number
  inProgress: number
  last7Days: number
  prev7Days: number
  won: number
  lost: number
  subscribers: number
  productsLive: number
  categoriesCount: number
  pipelineNew: number
  pipelineContacted: number
  pipelineQuoted: number
  pipelineNegotiation: number
  pipelineWon: number
  pipelineLost: number
  totalEnquiries: number
}

type RecentEnquiry = {
  _id: string
  enquiryNumber: string
  customerName: string
  company?: string
  status: string
  createdAt: string
  itemCount: number
}

const emptyCounts: Counts = {
  needsReply: 0,
  inProgress: 0,
  last7Days: 0,
  prev7Days: 0,
  won: 0,
  lost: 0,
  subscribers: 0,
  productsLive: 0,
  categoriesCount: 0,
  pipelineNew: 0,
  pipelineContacted: 0,
  pipelineQuoted: 0,
  pipelineNegotiation: 0,
  pipelineWon: 0,
  pipelineLost: 0,
  totalEnquiries: 0,
}

async function getData() {
  try {
    const [counts, recent, last14] = await Promise.all([
      client.fetch<Counts>(dashboardEnquiryCountsQuery),
      client.fetch<RecentEnquiry[]>(recentEnquiriesQuery),
      client.fetch<{createdAt: string}[]>(enquiriesOver14DaysQuery),
    ])
    return {counts, recent, last14}
  } catch {
    return {counts: emptyCounts, recent: [] as RecentEnquiry[], last14: [] as {createdAt: string}[]}
  }
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
  const {counts, recent, last14} = await getData()
  const chartData = buildDailySeries(last14.map((e) => e.createdAt))
  const trendChange = percentChange(counts.last7Days, counts.prev7Days)
  const closedCount = counts.won + counts.lost
  const winRate = closedCount > 0 ? Math.round((counts.won / closedCount) * 100) : null
  const pipelineMax = Math.max(
    counts.pipelineNew,
    counts.pipelineContacted,
    counts.pipelineQuoted,
    counts.pipelineNegotiation,
    counts.pipelineWon,
    counts.pipelineLost,
    1
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back, DOSS.{' '}
            {counts.needsReply > 0 && (
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

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Needs a reply" sublabel="Oldest first" value={counts.needsReply} accent={counts.needsReply > 0} />
        <StatCard label="In progress" sublabel="Contacted, quoted, negotiating" value={counts.inProgress} />
        <StatCard
          label="Last 7 days"
          sublabel="vs previous 7"
          value={counts.last7Days}
          change={{value: Math.abs(trendChange), direction: trendChange >= 0 ? 'up' : 'down'}}
        />
        <StatCard label="Win rate" sublabel={closedCount > 0 ? `${closedCount} closed enquiries` : 'No closed enquiries'} value={winRate === null ? '—' : `${winRate}%`} />
        <StatCard label="Subscribers" value={counts.subscribers} />
        <StatCard label="Products live" sublabel={`${counts.categoriesCount} categories`} value={counts.productsLive} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Enquiries over 14 days" subtitle={`${last14.length} in total`} action={{label: 'All enquiries', href: '/admin/enquiries'}} className="lg:col-span-2">
          <EnquiriesTrendChart data={chartData} />
        </Panel>

        <Panel title="Pipeline" subtitle="Where enquiries currently sit">
          <PipelineBar label="New" value={counts.pipelineNew} max={pipelineMax} />
          <PipelineBar label="Contacted" value={counts.pipelineContacted} max={pipelineMax} />
          <PipelineBar label="Quoted" value={counts.pipelineQuoted} max={pipelineMax} />
          <PipelineBar label="Negotiation" value={counts.pipelineNegotiation} max={pipelineMax} />
          <PipelineBar label="Won" value={counts.pipelineWon} max={pipelineMax} />
          <PipelineBar label="Lost" value={counts.pipelineLost} max={pipelineMax} />
          <div className="pt-3 text-xs text-muted">{counts.totalEnquiries} enquiries all time</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Recent enquiries" action={{label: 'View all', href: '/admin/enquiries'}} className="lg:col-span-2">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((e) => (
                <li key={e._id}>
                  <Link href={`/admin/enquiries/${e._id}`} className="flex items-center justify-between gap-4 py-3 hover:opacity-80">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="font-mono text-xs text-muted">{e.enquiryNumber}</span>
                        <span>{e.customerName}</span>
                        {e.company && <span className="text-muted">· {e.company}</span>}
                      </div>
                      <div className="text-xs text-muted">
                        {e.itemCount} product{e.itemCount === 1 ? '' : 's'} (quotation)
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted">{formatShortDate(e.createdAt)}</span>
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
