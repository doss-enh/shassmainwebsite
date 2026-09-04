'use client'

import {useState} from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold text-neutral-900">Contact us</h1>
      <p className="mb-8 text-neutral-600">Have a question that's not about a specific product? Send us a message.</p>

      {status === 'done' ? (
        <p className="rounded-lg bg-success-soft p-4 text-sm text-success">Thanks — we'll get back to you shortly.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Name</label>
            <input name="name" required className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
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
            <textarea name="message" required rows={5} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {status === 'loading' ? 'Sending…' : 'Send message'}
          </button>
          {status === 'error' && <p className="text-sm text-danger">Something went wrong. Please try again.</p>}
        </form>
      )}
    </div>
  )
}
