'use client'

import {useRef, useState, useTransition} from 'react'
import clsx from 'clsx'

export type MediaItem = {
  _id: string
  url: string
  originalFilename?: string
  size?: number
  width?: number
  height?: number
  uses: number
}

function kb(bytes?: number) {
  if (!bytes) return ''
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

export function MediaGrid({
  assets,
  onUpload,
  onDelete,
}: {
  assets: MediaItem[]
  onUpload: (formData: FormData) => Promise<{uploaded: number; failed: string[]}>
  onDelete: (ids: string[]) => Promise<{deleted: number; blocked: string[]}>
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{tone: 'ok' | 'warn'; text: string} | null>(null)
  const [pending, startTransition] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allSelected = assets.length > 0 && assets.every((a) => selected.has(a._id))
  const selectAll = () => setSelected(allSelected ? new Set() : new Set(assets.map((a) => a._id)))

  function upload(files: FileList | null) {
    if (!files?.length) return
    const data = new FormData()
    for (const f of Array.from(files)) data.append('files', f)
    startTransition(async () => {
      const res = await onUpload(data)
      setMessage(
        res.failed.length
          ? {tone: 'warn', text: `Uploaded ${res.uploaded}. Skipped: ${res.failed.join('; ')}`}
          : {tone: 'ok', text: `Uploaded ${res.uploaded} image${res.uploaded === 1 ? '' : 's'}.`},
      )
      if (fileInput.current) fileInput.current.value = ''
    })
  }

  function remove() {
    const ids = [...selected]
    if (!ids.length) return
    const inUse = assets.filter((a) => selected.has(a._id) && a.uses > 0).length
    const warning = inUse
      ? `\n\n${inUse} of these are still used by other documents and will be kept.`
      : ''
    if (!confirm(`Delete ${ids.length} image${ids.length === 1 ? '' : 's'}? This cannot be undone.${warning}`)) return

    startTransition(async () => {
      const res = await onDelete(ids)
      setSelected(new Set())
      setMessage(
        res.blocked.length
          ? {tone: 'warn', text: `Deleted ${res.deleted}. Kept: ${res.blocked.join('; ')}`}
          : {tone: 'ok', text: `Deleted ${res.deleted} image${res.deleted === 1 ? '' : 's'}.`},
      )
    })
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          Upload images
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />

        <button
          type="button"
          onClick={selectAll}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          {allSelected ? 'Clear selection' : 'Select all on page'}
        </button>

        {selected.size > 0 && (
          <>
            <span className="text-sm text-muted">{selected.size} selected</span>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete selected
            </button>
          </>
        )}

        {pending && <span className="text-sm text-muted">Working…</span>}
      </div>

      {message && (
        <p
          className={clsx(
            'mb-4 rounded-lg border px-3 py-2 text-sm',
            message.tone === 'ok' ? 'border-green-300 bg-green-50 text-green-800' : 'border-amber-300 bg-amber-50 text-amber-900',
          )}
        >
          {message.text}
        </p>
      )}

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted">
          No media uploaded yet.
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
          {assets.map((a) => {
            const isSelected = selected.has(a._id)
            return (
              <li key={a._id}>
                <button
                  type="button"
                  onClick={() => toggle(a._id)}
                  aria-pressed={isSelected}
                  title={`${a.originalFilename || ''}${a.width ? ` · ${a.width}×${a.height}` : ''}${a.size ? ` · ${kb(a.size)}` : ''}${a.uses ? ` · used ${a.uses}×` : ' · unused'}`}
                  className={clsx(
                    'relative block aspect-square w-full overflow-hidden rounded-lg border bg-card transition',
                    isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-primary/60',
                  )}
                >
                  <img src={`${a.url}?w=200&h=200&fit=crop`} alt={a.originalFilename || ''} loading="lazy" className="h-full w-full object-cover" />

                  <span
                    className={clsx(
                      'absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded border text-white',
                      isSelected ? 'border-primary bg-primary' : 'border-white/80 bg-black/25',
                    )}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </span>

                  {/* Unused assets are the safe ones to clear out, so flag them. */}
                  {a.uses === 0 && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1 text-[9px] font-medium uppercase tracking-wide text-white">
                      unused
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
