import Link from 'next/link'
import clsx from 'clsx'
import {resolveSwatch} from '@/lib/colors'
import type {FacetGroup} from '@/lib/facets'

export const SORT_OPTIONS = [
  {value: '', label: 'Featured'},
  {value: 'name_asc', label: 'Alphabetically, A-Z'},
  {value: 'name_desc', label: 'Alphabetically, Z-A'},
  {value: 'date_desc', label: 'Date, new to old'},
  {value: 'date_asc', label: 'Date, old to new'},
] as const

/**
 * The archive sidebar: result count, sort, availability, then one group per
 * filterable attribute. Everything is a link so the whole listing stays a
 * server component and each filter state is its own shareable URL.
 */
export function ArchiveFilters({
  total,
  sort,
  stockOnly,
  facets,
  sortHref,
  toggleStockHref,
  toggleValueHref,
}: {
  total: number
  sort: string
  stockOnly: boolean
  facets: FacetGroup[]
  sortHref: (value: string) => string
  toggleStockHref: () => string
  toggleValueHref: (name: string, value: string) => string
}) {
  return (
    <aside className="w-full lg:w-[244px] lg:shrink-0">
      <p className="text-sm text-neutral-900">
        <span className="font-semibold">{total}</span> products
      </p>

      <div className="mt-5">
        <label htmlFor="archive-sort" className="mb-2 block text-sm font-semibold text-neutral-900">
          Sort by
        </label>
        {/* A <select> would need client JS to navigate; these read the same
            and keep the page a server component. */}
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-800 [&::-webkit-details-marker]:hidden">
            {(SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0]).label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <ul className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
            {SORT_OPTIONS.map((o) => (
              <li key={o.value}>
                <Link
                  href={sortHref(o.value)}
                  className={clsx('block px-3 py-2 text-sm', o.value === sort ? 'bg-neutral-50 font-semibold text-primary' : 'text-neutral-700 hover:bg-neutral-50')}
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <FilterSection title="Availability">
        <Link href={toggleStockHref()} className="flex items-center gap-2.5 py-1 text-sm text-neutral-700 hover:text-primary">
          <Box checked={stockOnly} />
          In stock only
        </Link>
      </FilterSection>

      {facets.map((group) => (
        <FilterSection key={group.name} title={group.name}>
          <ul>
            {group.values.map((v) => {
              const swatch = group.name === 'Color' ? resolveSwatch(v.value) : null
              return (
                <li key={v.value}>
                  <Link
                    href={toggleValueHref(group.name, v.value)}
                    className="flex items-center gap-2.5 py-[5px] text-sm text-neutral-700 hover:text-primary"
                  >
                    {swatch && (
                      <span
                        aria-hidden="true"
                        className={clsx('h-[18px] w-[18px] shrink-0 rounded-full', !swatch.background && 'bg-neutral-200', swatch.needsEdge && 'ring-1 ring-neutral-300')}
                        style={swatch.background ? {background: swatch.background} : undefined}
                      />
                    )}
                    <Box checked={v.selected} />
                    <span className="min-w-0 flex-1 truncate">{v.value}</span>
                    <span className="text-[13px] text-neutral-400">{v.count}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </FilterSection>
      ))}
    </aside>
  )
}

function FilterSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 border-b border-neutral-300 pb-2 text-sm font-semibold text-neutral-900">{title}</h2>
      {children}
    </section>
  )
}

function Box({checked}: {checked: boolean}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border',
        checked ? 'border-primary bg-primary text-white' : 'border-neutral-400 bg-white',
      )}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </span>
  )
}
