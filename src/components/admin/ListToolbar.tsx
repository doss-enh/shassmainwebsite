'use client'

import Link from 'next/link'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useRef, useState, useTransition} from 'react'
import clsx from 'clsx'

/**
 * Search + filter bar for long console lists.
 *
 * Typing updates the URL as you go (debounced) and the server re-renders the
 * filtered page, so counts, filters and pagination stay authoritative rather
 * than being recomputed on a partial client-side copy of the data. The form
 * still submits normally if JS has not loaded.
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
  filters?: {label: string; href: string; active: boolean}[]
  hidden?: Record<string, string | undefined>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [term, setTerm] = useState(q)
  const [pending, startTransition] = useTransition()
  const typed = useRef(false)

  // Keep in step when the URL changes from somewhere else (a filter pill, the
  // back button) without clobbering what is being typed right now.
  useEffect(() => {
    if (!typed.current) setTerm(q)
  }, [q])

  useEffect(() => {
    if (!typed.current) return
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      const value = term.trim()
      value ? next.set('q', value) : next.delete('q')
      // A new search invalidates the current page cursor.
      next.delete('page')
      const qs = next.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, {scroll: false}))
    }, 250)
    return () => clearTimeout(timer)
  }, [term, params, pathname, router])

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form
        action={action}
        method="get"
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="relative min-w-0 flex-1 sm:max-w-sm"
      >
        {Object.entries(hidden || {}).map(([name, value]) =>
          value ? <input key={name} type="hidden" name={name} value={value} /> : null,
        )}
        <input
          type="search"
          name="q"
          value={term}
          onChange={(e) => {
            typed.current = true
            setTerm(e.target.value)
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-9 text-sm text-foreground outline-none focus:border-primary"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted">
          {pending ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.2-8.6" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </span>
      </form>

      {term && (
        <button
          type="button"
          onClick={() => {
            typed.current = true
            setTerm('')
          }}
          className="text-xs text-muted underline hover:text-foreground"
        >
          Clear search
        </button>
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
