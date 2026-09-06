'use client'

import {useState, useTransition} from 'react'

type Item = {key: string; label: string; target: string}

/**
 * Drag-to-reorder menu items.
 *
 * Uses the native HTML drag-and-drop API rather than a library, and pairs it
 * with keyboard arrow buttons — drag alone is unusable with a keyboard or a
 * screen reader, and this is the only way to order a menu outside Studio.
 */
export function MenuItemList({
  menuId,
  items: initial,
  onReorder,
}: {
  menuId: string
  items: Item[]
  onReorder: (id: string, keys: string[]) => Promise<{ok: boolean; reason?: string}>
}) {
  const [items, setItems] = useState(initial)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function commit(next: Item[]) {
    const previous = items
    setItems(next)
    setError(null)
    startTransition(async () => {
      const res = await onReorder(menuId, next.map((i) => i.key))
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } else {
        // Put the list back so what is on screen matches what is stored.
        setItems(previous)
        setError(res.reason || 'Could not save the new order.')
      }
    })
  }

  function moveTo(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    commit(next)
  }

  return (
    <div>
      {error && <p className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">{error}</p>}
      {saved && <p className="mb-2 text-xs text-green-700">Order saved.</p>}

      <ul className={pending ? 'opacity-60' : ''}>
        {items.map((item, i) => (
          <li
            key={item.key}
            draggable
            onDragStart={() => setDragging(item.key)}
            onDragEnd={() => {
              setDragging(null)
              setOver(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(item.key)
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (!dragging || dragging === item.key) return
              moveTo(
                items.findIndex((x) => x.key === dragging),
                i,
              )
              setDragging(null)
              setOver(null)
            }}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
              over === item.key && dragging !== item.key ? 'border-primary bg-primary-soft' : 'border-transparent'
            } ${dragging === item.key ? 'opacity-40' : ''}`}
          >
            <span className="cursor-grab text-muted active:cursor-grabbing" aria-hidden="true" title="Drag to reorder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.6" />
                <circle cx="15" cy="6" r="1.6" />
                <circle cx="9" cy="12" r="1.6" />
                <circle cx="15" cy="12" r="1.6" />
                <circle cx="9" cy="18" r="1.6" />
                <circle cx="15" cy="18" r="1.6" />
              </svg>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-foreground">{item.label}</span>
              <span className="block truncate text-xs text-muted">{item.target}</span>
            </span>

            <span className="flex items-center gap-1">
              <button type="button" onClick={() => moveTo(i, i - 1)} disabled={i === 0} aria-label={`Move ${item.label} up`} className="rounded border border-border px-2 py-1 text-xs text-muted disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => moveTo(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${item.label} down`} className="rounded border border-border px-2 py-1 text-xs text-muted disabled:opacity-30">
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
