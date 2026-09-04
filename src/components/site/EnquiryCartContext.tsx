'use client'

import {createContext, useCallback, useContext, useEffect, useState} from 'react'

export type EnquiryCartItem = {
  productId: string
  name: string
  slug: string
  image?: string
  quantity: number
}

type CartContextValue = {
  items: EnquiryCartItem[]
  addItem: (item: Omit<EnquiryCartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'shass_enquiry_cart'

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
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        return prev.map((i) => (i.productId === item.productId ? {...i, quantity: i.quantity + quantity} : i))
      }
      return [...prev, {...item, quantity}]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? {...i, quantity: Math.max(1, quantity)} : i)))
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
