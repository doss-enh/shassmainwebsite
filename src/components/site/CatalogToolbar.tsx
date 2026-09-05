import Link from 'next/link'
import clsx from 'clsx'

// The live toolbar's five orderings, in its order.
export const SORT_OPTIONS = [
  {value: '', label: 'Default'},
  {value: 'date_asc', label: 'Oldest'},
  {value: 'date_desc', label: 'Newest'},
  {value: 'name_asc', label: 'Name: A-Z'},
  {value: 'name_desc', label: 'Name: Z-A'},
] as const

/**
 * "Sort by [Default] … View [grid|list]", matching the live catalogue
 * toolbar. The dropdown is a <details> so it needs no client JS — sorting
 * and layout are both URL state, which keeps the listing a server component.
 */
export function CatalogToolbar({
  sort,
  view,
  hrefFor,
}: {
  sort: string
  view: 'grid' | 'list'
  hrefFor: (params: {sort?: string; view?: string}) => string
}) {
  const current = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0]

  return (
    <div className="mb-5 flex flex-wrap items-center justify-end gap-6 border-b border-neutral-200 pb-3">
      <div className="flex items-center gap-3">
        <span className="hidden text-[13px] text-neutral-500 lg:block">Sort by</span>
        <details className="relative [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[3px] border border-neutral-300 px-3 py-1.5 text-[13px] text-neutral-700 hover:border-neutral-400">
            {current.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <ul className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-[3px] border border-neutral-200 bg-white py-1 shadow-lg">
            {SORT_OPTIONS.map((o) => (
              <li key={o.value}>
                <Link
                  href={hrefFor({sort: o.value, view})}
                  className={clsx(
                    'block px-3 py-1.5 text-[13px]',
                    o.value === current.value ? 'bg-neutral-50 font-semibold text-primary' : 'text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-[13px] text-neutral-500 lg:block">View</span>
        <div className="flex items-center gap-1">
          <Link
            href={hrefFor({sort, view: ''})}
            aria-label="Grid view"
            aria-current={view === 'grid'}
            className={clsx('rounded-[3px] p-1.5', view === 'grid' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
            </svg>
          </Link>
          <Link
            href={hrefFor({sort, view: 'list'})}
            aria-label="List view"
            aria-current={view === 'list'}
            className={clsx('rounded-[3px] p-1.5', view === 'list' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 4h18v3H3zm0 6.5h18v3H3zM3 17h18v3H3z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
