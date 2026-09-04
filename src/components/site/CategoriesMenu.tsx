'use client'

import {useState} from 'react'
import Link from 'next/link'

type Category = {_id: string; name: string; slug?: {current: string}}

export function CategoriesMenu({categories}: {categories: Category[]}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-2 rounded-md bg-neutral-100 px-3.5 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Product Categories
      </button>
      {open && categories.length > 0 && (
        <div className="absolute left-0 top-full z-20 w-64 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${c.slug?.current}`}
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
