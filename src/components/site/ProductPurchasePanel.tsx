'use client'

import {useMemo, useState} from 'react'
import {useEnquiryCart} from './EnquiryCartContext'
import {resolveSwatch} from '@/lib/colors'
import {whatsappEnquiryUrl} from '@/lib/whatsapp'

type VariantOption = {name: string; value: string; code?: string}
type Variant = {sku?: string; isDefault?: boolean; stockStatus?: string; options?: VariantOption[]}
type Axis = {name: string; values?: string[]}

/**
 * The live page's buy box: the selected variation's code, a colour swatch
 * row, a quantity stepper and "Add to Quote", in that order. Colour is
 * rendered as swatches (as on the live site) rather than as text pills;
 * any other axis falls back to labelled buttons.
 */
export function ProductPurchasePanel({
  productId,
  title,
  slug,
  image,
  sku,
  colors,
  axes,
  variants,
  minimumOrderQuantity,
  whatsapp,
}: {
  productId: string
  title: string
  slug: string
  image?: string
  sku?: string
  colors: string[]
  axes: Axis[]
  variants: Variant[]
  minimumOrderQuantity?: number
  whatsapp?: string
}) {
  const {addItem} = useEnquiryCart()
  const moq = Math.max(1, minimumOrderQuantity || 1)

  const usableAxes = axes.filter((a) => a.values && a.values.length > 0)
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0]
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const opt of defaultVariant?.options || []) if (opt.name) init[opt.name] = opt.value
    return init
  })
  const [quantity, setQuantity] = useState(moq)
  const [added, setAdded] = useState(false)

  const matched = useMemo(
    () =>
      variants.find((v) => {
        const opts = v.options || []
        if (opts.length !== usableAxes.length) return false
        return opts.every((o) => o.name && selection[o.name] === o.value)
      }),
    [variants, selection, usableAxes.length],
  )

  const variantCode = matched?.sku || defaultVariant?.sku || sku
  const note = usableAxes
    .map((a) => (selection[a.name] ? `${a.name}: ${selection[a.name]}` : null))
    .filter(Boolean)
    .join(', ')

  // Rebuilt on every change so the message carries whatever is selected now.
  const waUrl = whatsappEnquiryUrl(whatsapp, {
    title,
    sku,
    variantCode,
    options: Object.fromEntries(usableAxes.map((a) => [a.name, selection[a.name]]).filter(([, v]) => v)) as Record<string, string>,
    quantity,
    path: `/products/${slug}`,
  })

  return (
    <div className="mt-6">
      {variantCode && <div className="mb-4 text-sm text-neutral-500">{variantCode}</div>}

      {usableAxes.map((axis) => {
        const isColor = /colou?r/i.test(axis.name)
        return (
          <div key={axis.name} className="mb-4">
            <div className="mb-2 text-sm font-semibold text-neutral-900">{axis.name}:</div>
            <div className="flex flex-wrap gap-2">
              {axis.values!.map((value) => {
                const selected = selection[axis.name] === value
                if (isColor) {
                  const {background: hex, needsEdge} = resolveSwatch(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      aria-label={value}
                      aria-pressed={selected}
                      onClick={() => setSelection((p) => ({...p, [axis.name]: value}))}
                      className={`h-7 w-7 rounded-full border transition ${
                        selected ? 'border-primary ring-2 ring-primary/30' : needsEdge ? 'border-neutral-300' : 'border-transparent'
                      }`}
                      style={hex ? {background: hex} : undefined}
                    >
                      {!hex && <span className="px-1 text-[10px] text-neutral-600">{value}</span>}
                    </button>
                  )
                }
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelection((p) => ({...p, [axis.name]: value}))}
                    className={
                      selected
                        ? 'rounded border border-primary bg-primary-soft px-3 py-1.5 text-[13px] font-medium text-primary'
                        : 'rounded border border-neutral-300 px-3 py-1.5 text-[13px] text-neutral-700 hover:border-neutral-400'
                    }
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="mb-2 text-sm font-semibold text-neutral-900">Quantity:</div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={moq}
          value={quantity}
          aria-label="Quantity"
          onChange={(e) => setQuantity(Math.max(moq, Number(e.target.value) || moq))}
          className="h-11 w-24 rounded-[3px] border border-neutral-300 px-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            addItem({productId, name: title, slug, image, note: note || undefined}, quantity)
            setAdded(true)
            setTimeout(() => setAdded(false), 1500)
          }}
          className="h-11 rounded-[3px] bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {added ? 'Added ✓' : 'Add to Quote'}
        </button>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center gap-2 rounded-[3px] border border-[#25D366] px-5 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5 5 0 0 0 2.3.5 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z" />
            </svg>
            Enquire on WhatsApp
          </a>
        )}
      </div>

      {minimumOrderQuantity && minimumOrderQuantity > 1 && (
        <p className="mt-2 text-[13px] text-neutral-500">Minimum order quantity: {minimumOrderQuantity}</p>
      )}
    </div>
  )
}
