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
      <button className="flex items-center gap-2.5 text-sm font-semibold text-white hover:text-white/80">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Product Categories
      </button>

      {/* Live panel measures 1000x500 with a 212px sidebar; rows are 39px
          and separated by a 1px #eee rule rather than a tinted background. */}
      {open && tree.length > 0 && (
        <div className="absolute left-0 top-full z-30 flex h-[500px] w-[1000px] max-w-[95vw] overflow-hidden border border-neutral-200 bg-white shadow-xl">
          <ul className="w-[212px] shrink-0 overflow-y-auto bg-white">
            {tree.map((cat) => (
              <li key={cat._id} onMouseEnter={() => setActiveId(cat._id)}>
                <Link
                  href={hrefFor(cat.slug)}
                  className={`flex h-[39px] items-center justify-between border-b border-[#eeeeee] px-4 text-sm font-semibold ${
                    activeId === cat._id ? 'bg-primary text-white' : 'text-[#222222] hover:bg-neutral-50'
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
                    {/* Column heading and leaves are both 14px teal on the
                        live menu (#2B9D93 / #269B91), the heading bolder. */}
                    <Link href={hrefFor(sub.slug)} className="text-sm font-bold text-[#2B9D93] hover:text-primary">
                      {sub.name}
                    </Link>
                    {sub.children.length > 0 && (
                      <ul className="mt-2">
                        {sub.children.map((leaf) => (
                          <li key={leaf._id}>
                            <Link
                              href={hrefFor(leaf.slug)}
                              className="flex h-[30px] items-center text-sm text-[#269B91] hover:text-primary"
                            >
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
