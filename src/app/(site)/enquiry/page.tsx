'use client'

import {useState} from 'react'
import Link from 'next/link'
import {useEnquiryCart, lineKey} from '@/components/site/EnquiryCartContext'

export default function EnquiryPage() {
  const {items, removeItem, updateQuantity, clear} = useEnquiryCart()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [enquiryNumber, setEnquiryNumber] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setStatus('loading')
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          customerName: form.get('name'),
          company: form.get('company'),
          email: form.get('email'),
          phone: form.get('phone'),
          message: form.get('message'),
          items: items.map((i) => ({productId: i.productId, quantity: i.quantity, note: i.note})),
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEnquiryNumber(data.enquiryNumber)
      setStatus('done')
      clear()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Enquiry sent</h1>
        <p className="mt-2 text-neutral-600">
          Thanks — we've received your enquiry{enquiryNumber ? ` (${enquiryNumber})` : ''}. Our team will get back to
          you with a quote shortly.
        </p>
        <Link href="/products" className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Continue browsing
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Your enquiry</h1>
      <p className="mb-8 text-neutral-600">Review the products below and tell us how to reach you — we'll send a quote.</p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-24 text-center text-neutral-500">
          Your enquiry list is empty.{' '}
          <Link href="/products" className="text-primary hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
              {items.map((item) => {
                const key = lineKey(item)
                return (
                  <li key={key} className="flex items-center gap-3 p-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-neutral-900">{item.name}</div>
                      {item.note && <div className="truncate text-xs text-neutral-500">{item.note}</div>}
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(key, Number(e.target.value) || 1)}
                      className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                    />
                    <button onClick={() => removeItem(key)} className="text-xs text-danger hover:underline">
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Name</label>
              <input name="name" required className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Company</label>
              <input name="company" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Email</label>
              <input type="email" name="email" required className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Phone</label>
              <input name="phone" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Message</label>
              <textarea name="message" rows={3} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {status === 'loading' ? 'Sending…' : 'Send enquiry'}
            </button>
            {status === 'error' && <p className="text-sm text-danger">Something went wrong. Please try again.</p>}
          </form>
        </div>
      )}
    </div>
  )
}
