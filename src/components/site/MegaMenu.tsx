'use client'

import {useState} from 'react'
import Link from 'next/link'
import type {CategoryNode} from '@/lib/categoryTree'

function hrefFor(slug?: string) {
  return slug ? `/products?category=${slug}` : '/products'
}

export function MegaMenu({tree}: {tree: CategoryNode[]}) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(tree[0]?._id ?? null)
  const active = tree.find((c) => c._id === activeId)

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-2 text-[13px] font-semibold text-white hover:text-white/80">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Product Categories
      </button>

      {open && tree.length > 0 && (
        <div className="absolute left-0 top-full z-30 flex max-h-[70vh] w-[920px] max-w-[90vw] overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-xl">
          <ul className="w-56 shrink-0 overflow-y-auto border-r border-neutral-100 bg-neutral-50 py-2">
            {tree.map((cat) => (
              <li key={cat._id} onMouseEnter={() => setActiveId(cat._id)}>
                <Link
                  href={hrefFor(cat.slug)}
                  className={`flex items-center justify-between px-4 py-2.5 text-[13px] font-medium ${
                    activeId === cat._id ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {cat.name}
                  {cat.children.length > 0 && <span className="text-xs">›</span>}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex-1 overflow-y-auto p-6">
            {active && active.children.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-6 gap-y-5">
                {active.children.map((sub) => (
                  <div key={sub._id}>
                    <Link href={hrefFor(sub.slug)} className="text-[13px] font-bold text-site-secondary hover:text-primary">
                      {sub.name}
                    </Link>
                    {sub.children.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {sub.children.map((leaf) => (
                          <li key={leaf._id}>
                            <Link href={hrefFor(leaf.slug)} className="text-[13px] text-neutral-600 hover:text-primary">
                              {leaf.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              active && (
                <Link href={hrefFor(active.slug)} className="text-[13px] font-medium text-primary hover:underline">
                  View all {active.name} →
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
