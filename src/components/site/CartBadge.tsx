'use client'

import Link from 'next/link'
import {useEnquiryCart} from './EnquiryCartContext'

export function CartBadge() {
  const {items} = useEnquiryCart()
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <Link href="/enquiry" className="relative flex items-center gap-2 text-neutral-700 hover:text-primary">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
        {count}
      </span>
    </Link>
  )
}
