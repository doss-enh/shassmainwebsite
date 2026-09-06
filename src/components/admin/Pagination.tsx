import Link from 'next/link'
import clsx from 'clsx'

/**
 * Console pagination. Renders nothing for a single page, and elides the
 * middle when there are many, keeping the first, last and a window around
 * the current page.
 */
export function Pagination({
  page,
  pages,
  total,
  hrefFor,
  label = 'items',
}: {
  page: number
  pages: number
  total: number
  hrefFor: (page: number) => string
  label?: string
}) {
  if (pages <= 1) return null

  const numbers = Array.from({length: pages}, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 2,
  )

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
      <p className="text-sm text-muted">
        Page {page} of {pages} · {total} {label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-primary">
            Previous
          </Link>
        )}
        {numbers.map((n, i) => (
          <span key={n} className="flex items-center gap-1.5">
            {i > 0 && numbers[i - 1] !== n - 1 && <span className="px-1 text-muted">…</span>}
            <Link
              href={hrefFor(n)}
              aria-current={n === page ? 'page' : undefined}
              className={clsx(
                'rounded-lg border px-3 py-1.5 text-sm',
                n === page ? 'border-primary bg-primary text-white' : 'border-border text-muted hover:border-primary hover:text-primary',
              )}
            >
              {n}
            </Link>
          </span>
        ))}
        {page < pages && (
          <Link href={hrefFor(page + 1)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-primary">
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
