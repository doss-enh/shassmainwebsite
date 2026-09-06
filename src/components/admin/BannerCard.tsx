'use client'

import {useRef, useState, useTransition} from 'react'

type Banner = {
  id: string
  title: string
  heading?: string
  placement: string
  active: boolean
  image: string | null
  studioUrl: string
}

/**
 * One editable banner. Everything an operator changes day to day — artwork,
 * on/off, where it shows, its name and its order — happens here; Studio is
 * still the place for headings, links and theme.
 */
export function BannerCard({
  banner,
  placements,
  isFirst,
  isLast,
  onToggleActive,
  onChangePlacement,
  onRename,
  onChangeImage,
  onMove,
  onDelete,
}: {
  banner: Banner
  placements: string[]
  isFirst: boolean
  isLast: boolean
  onToggleActive: (id: string, active: boolean) => Promise<void>
  onChangePlacement: (id: string, placement: string) => Promise<void>
  onRename: (id: string, title: string) => Promise<void>
  onChangeImage: (id: string, formData: FormData) => Promise<void>
  onMove: (id: string, direction: 'up' | 'down') => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState(banner.title)
  const fileInput = useRef<HTMLInputElement>(null)

  const run = (fn: () => Promise<void>) => startTransition(() => void fn())

  function pickImage(files: FileList | null) {
    if (!files?.length) return
    const data = new FormData()
    data.append('image', files[0])
    run(() => onChangeImage(banner.id, data))
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${pending ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          title="Replace artwork"
          className="group relative h-[70px] w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-primary-soft"
        >
          {banner.image ? (
            <img src={banner.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">No image</span>
          )}
          <span className="absolute inset-0 hidden items-center justify-center bg-black/45 text-[11px] font-semibold text-white group-hover:flex">
            Replace
          </span>
        </button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files)} />

        <div className="min-w-0 flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== banner.title && run(() => onRename(banner.id, title))}
            aria-label="Banner title"
            className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-foreground hover:border-border focus:border-primary focus:outline-none"
          />
          {banner.heading && <p className="truncate px-2 text-xs text-muted">{banner.heading}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={banner.placement}
              onChange={(e) => run(() => onChangePlacement(banner.id, e.target.value))}
              aria-label="Placement"
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground"
            >
              {!placements.includes(banner.placement) && <option value={banner.placement}>{banner.placement || 'No placement'}</option>}
              {placements.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => run(() => onToggleActive(banner.id, !banner.active))}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                banner.active ? 'border-green-300 bg-green-50 text-green-800' : 'border-border text-muted'
              }`}
            >
              {banner.active ? 'Active' : 'Inactive'}
            </button>

            <button type="button" disabled={isFirst} onClick={() => run(() => onMove(banner.id, 'up'))} aria-label="Move up" className="rounded-lg border border-border px-2 py-1.5 text-xs text-muted disabled:opacity-30">
              ↑
            </button>
            <button type="button" disabled={isLast} onClick={() => run(() => onMove(banner.id, 'down'))} aria-label="Move down" className="rounded-lg border border-border px-2 py-1.5 text-xs text-muted disabled:opacity-30">
              ↓
            </button>

            <a href={banner.studioUrl} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary">
              Edit in Studio
            </a>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete “${banner.title}”? This cannot be undone.`)) run(() => onDelete(banner.id))
              }}
              className="ml-auto rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
