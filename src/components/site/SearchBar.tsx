'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect, useId, useRef, useState} from 'react'

type Result = {id: string; title: string; sku?: string; category?: string; href: string; image: string | null}

/**
 * Header search with typeahead. Suggestions are advisory — Enter always goes
 * to the full listing, so the form still works if the request is slow or
 * fails. Arrow keys and Escape are wired because a dropdown you cannot
 * dismiss or navigate from a keyboard is worse than none.
 */
export function SearchBar({onNavigate, autoFocus = false}: {onNavigate?: () => void; autoFocus?: boolean}) {
  const router = useRouter()
  const listId = useId()
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = term.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    // Debounced, and aborted on the next keystroke so a slow earlier request
    // cannot land after a newer one and show stale suggestions.
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {signal: controller.signal})
        const data = await res.json()
        setResults(data.results || [])
        setCursor(-1)
        setOpen(true)
      } catch {
        /* aborted or offline — leave the last results in place */
      } finally {
        setLoading(false)
      }
    }, 220)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = term.trim()
    if (!q) return
    setOpen(false)
    onNavigate?.()
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') return setOpen(false)
    if (!open || !results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c <= 0 ? results.length - 1 : c - 1))
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault()
      setOpen(false)
      onNavigate?.()
      router.push(results[cursor].href)
    }
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <input
          type="search"
          name="q"
          value={term}
          autoFocus={autoFocus}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search the shop..."
          aria-label="Search products"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full rounded-full bg-white px-5 py-2.5 pr-12 text-[13px] text-neutral-800 outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary">
          {loading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.2-8.6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </button>
      </form>

      {open && term.trim().length >= 2 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-xl"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-500">{loading ? 'Searching…' : `No products match “${term.trim()}”`}</li>
          ) : (
            <>
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === cursor}>
                  <Link
                    href={r.href}
                    onClick={() => {
                      setOpen(false)
                      onNavigate?.()
                    }}
                    className={`flex items-center gap-3 px-3 py-2 ${i === cursor ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                      {r.image && <img src={r.image} alt="" className="h-full w-full object-contain" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-neutral-900">{r.title}</span>
                      <span className="block truncate text-[11px] text-neutral-500">
                        {[r.sku, r.category].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-neutral-100">
                <Link
                  href={`/products?q=${encodeURIComponent(term.trim())}`}
                  onClick={() => {
                    setOpen(false)
                    onNavigate?.()
                  }}
                  className="block px-4 py-2.5 text-[13px] font-semibold text-primary hover:bg-neutral-50"
                >
                  See all results for “{term.trim()}”
                </Link>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  )
}
