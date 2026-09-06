'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'
import type {CategoryNode} from '@/lib/categoryTree'
import {SearchBar} from './SearchBar'

type NavItem = {label: string; href: string}

/**
 * Mobile navigation. The desktop flyout opens on hover, which does nothing on
 * a touch screen, and every header link was hidden below md — so without this
 * a phone had no way to reach anything but the logo.
 */
export function MobileNav({tree, items, phone}: {tree: CategoryNode[]; items: NavItem[]; phone?: string}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // A drawer that leaves the page scrolling behind it feels broken.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-white lg:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden="true" />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <span className="font-heading text-base font-bold text-neutral-900">Menu</span>
              <button type="button" onClick={close} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search is the fastest route to a product on a small screen, so
                it sits above the category tree rather than below it. */}
            <div className="border-b border-neutral-200 bg-neutral-50 p-3 [&_input]:border [&_input]:border-neutral-300">
              <SearchBar onNavigate={close} />
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="border-b border-neutral-200 py-1">
                <li>
                  <Link href="/" onClick={close} className="block px-4 py-2.5 text-sm font-semibold text-neutral-900">
                    Home
                  </Link>
                </li>
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} onClick={close} className="block px-4 py-2.5 text-sm font-semibold text-neutral-900">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="px-4 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Product categories</p>
              <ul className="pb-6">
                {tree.map((root) => {
                  const isOpen = expanded === root._id
                  return (
                    <li key={root._id} className="border-b border-neutral-100">
                      <div className="flex items-center">
                        <Link href={`/products?category=${root.slug}`} onClick={close} className="flex-1 px-4 py-3 text-sm font-medium text-neutral-800">
                          {root.name}
                        </Link>
                        {root.children.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : root._id)}
                            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${root.name}`}
                            aria-expanded={isOpen}
                            className="flex h-11 w-12 items-center justify-center text-neutral-500"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {isOpen && root.children.length > 0 && (
                        <ul className="bg-neutral-50 pb-2">
                          {root.children.map((child) => (
                            <li key={child._id}>
                              <Link href={`/products?category=${child.slug}`} onClick={close} className="block py-2 pl-8 pr-4 text-[13px] text-neutral-700">
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>

            {phone && (
              <a href={`tel:${phone}`} className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-primary">
                Call us · {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
