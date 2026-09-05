'use client'

import Link from 'next/link'
import {useEnquiryCart} from './EnquiryCartContext'

export function CartBadge({variant = 'dark'}: {variant?: 'dark' | 'light'}) {
  const {items} = useEnquiryCart()
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const tone = variant === 'light' ? 'text-white hover:text-white/75' : 'text-neutral-700 hover:text-primary'

  return (
    <Link href="/enquiry" aria-label="Quote list" className={`relative flex items-center ${tone}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
        {count}
      </span>
    </Link>
  )
}
