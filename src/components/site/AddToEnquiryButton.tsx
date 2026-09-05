'use client'

import {useState} from 'react'
import {useEnquiryCart} from './EnquiryCartContext'

export function AddToEnquiryButton({
  productId,
  name,
  slug,
  image,
  note,
}: {
  productId: string
  name: string
  slug: string
  image?: string
  note?: string
}) {
  const {addItem} = useEnquiryCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className="w-20 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        onClick={() => {
          addItem({productId, name, slug, image, note}, quantity)
          setAdded(true)
          setTimeout(() => setAdded(false), 1500)
        }}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {added ? 'Added ✓' : 'Add to Quote'}
      </button>
    </div>
  )
}
