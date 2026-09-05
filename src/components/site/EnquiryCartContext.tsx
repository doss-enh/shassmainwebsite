'use client'

import {createContext, useCallback, useContext, useEffect, useState} from 'react'

export type EnquiryCartItem = {
  productId: string
  name: string
  slug: string
  image?: string
  note?: string
  quantity: number
}

type CartContextValue = {
  items: EnquiryCartItem[]
  addItem: (item: Omit<EnquiryCartItem, 'quantity'>, quantity?: number) => void
  removeItem: (lineKey: string) => void
  updateQuantity: (lineKey: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'shass_enquiry_cart'

// Lines are keyed by product + variant note, not product alone — otherwise
// two colours of the same product silently merge into one line.
export function lineKey(item: {productId: string; note?: string}) {
  return item.note ? `${item.productId}::${item.note}` : item.productId
}

export function EnquiryCartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<EnquiryCartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<EnquiryCartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const key = lineKey(item)
      const existing = prev.find((i) => lineKey(i) === key)
      if (existing) {
        return prev.map((i) => (lineKey(i) === key ? {...i, quantity: i.quantity + quantity} : i))
      }
      return [...prev, {...item, quantity}]
    })
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== key))
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => prev.map((i) => (lineKey(i) === key ? {...i, quantity: Math.max(1, quantity)} : i)))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  return (
    <CartContext.Provider value={{items, addItem, removeItem, updateQuantity, clear}}>{children}</CartContext.Provider>
  )
}

export function useEnquiryCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useEnquiryCart must be used within EnquiryCartProvider')
  return ctx
}
