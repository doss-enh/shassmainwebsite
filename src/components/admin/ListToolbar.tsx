import Link from 'next/link'
import clsx from 'clsx'

/**
 * Search + filter bar for long console lists. Submits as a plain GET form so
 * the list stays a server component and every filter state is a shareable URL.
 */
export function ListToolbar({
  action,
  q,
  placeholder = 'Search…',
  filters,
  hidden,
}: {
  action: string
  q: string
  placeholder?: string
  /** Optional pill filters, e.g. stock status. */
  filters?: {label: string; href: string; active: boolean}[]
  /** Params to carry through the search form so a search does not drop them. */
  hidden?: Record<string, string | undefined>
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form action={action} method="get" role="search" className="relative min-w-0 flex-1 sm:max-w-sm">
        {Object.entries(hidden || {}).map(([name, value]) =>
          value ? <input key={name} type="hidden" name={name} value={value} /> : null,
        )}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-9 text-sm text-foreground outline-none focus:border-primary"
        />
        <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {q && (
        <Link href={action} className="text-xs text-muted underline hover:text-foreground">
          Clear search
        </Link>
      )}

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className={clsx(
                'rounded-lg border px-3 py-1.5 text-xs',
                f.active ? 'border-primary bg-primary text-white' : 'border-border text-muted hover:border-primary hover:text-primary',
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
