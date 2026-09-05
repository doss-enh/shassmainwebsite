'use client'

import {useMemo, useState} from 'react'
import {useEnquiryCart} from './EnquiryCartContext'
import {resolveSwatch} from '@/lib/colors'

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
      </div>

      {minimumOrderQuantity && minimumOrderQuantity > 1 && (
        <p className="mt-2 text-[13px] text-neutral-500">Minimum order quantity: {minimumOrderQuantity}</p>
      )}
    </div>
  )
}
