'use client'

import {useState} from 'react'
import {useEnquiryCart} from './EnquiryCartContext'

export function AddToEnquiryButton({
  productId,
  name,
  slug,
  image,
  note,
  variant = 'default',
}: {
  productId: string
  name: string
  slug: string
  image?: string
  note?: string
  /** 'outline' is the archive card's full-width button, with no quantity box. */
  variant?: 'default' | 'outline'
}) {
  const {addItem} = useEnquiryCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  function add(qty: number) {
    addItem({productId, name, slug, image, note}, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (variant === 'outline') {
    return (
      <button
        type="button"
        onClick={() => add(1)}
        className="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-[13px] font-medium text-primary transition-colors hover:border-primary hover:bg-primary-soft"
      >
        {added ? 'Added ✓' : 'Add to Enquiry'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={quantity}
        aria-label="Quantity"
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className="w-20 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={() => add(quantity)}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {added ? 'Added ✓' : 'Add to Quote'}
      </button>
    </div>
  )
}
