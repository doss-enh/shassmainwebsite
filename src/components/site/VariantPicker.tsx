'use client'

import {useMemo, useState} from 'react'
import {AddToEnquiryButton} from './AddToEnquiryButton'

type VariantOption = {name: string; value: string; code?: string}
type Variant = {sku?: string; isDefault?: boolean; stockStatus?: string; options?: VariantOption[]}
type Axis = {name: string; values?: string[]}

export function VariantPicker({
  productId,
  title,
  slug,
  image,
  axes,
  variants,
}: {
  productId: string
  title: string
  slug: string
  image?: string
  axes: Axis[]
  variants: Variant[]
}) {
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0]
  const initialSelection: Record<string, string> = {}
  for (const opt of defaultVariant?.options || []) {
    if (opt.name) initialSelection[opt.name] = opt.value
  }

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection)

  const matchedVariant = useMemo(() => {
    return variants.find((v) => {
      const opts = v.options || []
      if (opts.length !== axes.filter((a) => a.values && a.values.length > 0).length) return false
      return opts.every((o) => o.name && selection[o.name] === o.value)
    })
  }, [variants, selection, axes])

  const usableAxes = axes.filter((a) => a.values && a.values.length > 0)

  return (
    <div className="space-y-4">
      {usableAxes.map((axis) => (
        <div key={axis.name}>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">{axis.name}</label>
          <div className="flex flex-wrap gap-2">
            {axis.values!.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelection((prev) => ({...prev, [axis.name]: value}))}
                className={
                  selection[axis.name] === value
                    ? 'rounded-md border border-primary bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary'
                    : 'rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400'
                }
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        {matchedVariant ? (
          <>
            <p className="mb-1 text-xs text-neutral-500">SKU: {matchedVariant.sku}</p>
            <p className="mb-3 text-sm font-medium text-neutral-900">Add this variant to your enquiry</p>
            <AddToEnquiryButton
              productId={productId}
              name={title}
              slug={slug}
              image={image}
              note={Object.entries(selection)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
            />
          </>
        ) : (
          <p className="text-sm text-neutral-600">This combination isn't available — try a different selection.</p>
        )}
      </div>
    </div>
  )
}
