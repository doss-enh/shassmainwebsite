'use client'

import {useState} from 'react'
import {urlFor} from '@sanity-lib/lib/image'

/**
 * Main image with a vertical thumbnail rail to its left, matching the live
 * product page. Falls back to a single image when there's nothing to pick
 * between.
 */
export function ProductGallery({images, title}: {images: any[]; title: string}) {
  const [active, setActive] = useState(0)
  if (!images.length) {
    return <div className="aspect-square w-full rounded-md bg-neutral-100" />
  }

  const main = urlFor(images[active])?.width(700).height(700).url()

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex max-h-[520px] w-[62px] shrink-0 flex-col gap-2 overflow-y-auto">
          {images.map((img, i) => {
            const thumb = urlFor(img)?.width(120).height(120).url()
            if (!thumb) return null
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={`aspect-square overflow-hidden rounded border p-1 ${
                  i === active ? 'border-primary' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <img src={thumb} alt="" className="h-full w-full object-contain" />
              </button>
            )
          })}
        </div>
      )}

      <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md bg-white">
        {main && <img src={main} alt={images[active]?.alt || title} className="max-h-[520px] w-full object-contain" />}
      </div>
    </div>
  )
}
