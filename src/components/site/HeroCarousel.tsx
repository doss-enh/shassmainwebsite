'use client'

import Link from 'next/link'
import {useCallback, useEffect, useState} from 'react'

export type HeroSlide = {
  id: string
  image?: string
  alt?: string
  href?: string
  /** Only used for slides that have no artwork of their own. */
  heading?: string
  subheading?: string
  ctaLabel?: string
}

/**
 * The slide artwork carries its own headline and product collage, so a slide
 * is the image — full-bleed, edge to edge. Text is only composed for a slide
 * that has no image, which keeps the component usable before artwork exists.
 */
export function HeroCarousel({slides}: {slides: HeroSlide[]}) {
  const [active, setActive] = useState(0)
  const count = slides.length

  const go = useCallback((i: number) => setActive(((i % count) + count) % count), [count])

  useEffect(() => {
    if (count < 2) return
    const id = setInterval(() => setActive((i) => (i + 1) % count), 6000)
    return () => clearInterval(id)
  }, [count])

  if (count === 0) return null
  const slide = slides[active]

  return (
    <section className="relative">
      <div className="relative overflow-hidden">
        {slide.image ? (
          <Link href={slide.href || '/products'} aria-label={slide.alt || 'Featured'}>
            {/* Ratio matches the source artwork so nothing is cropped. */}
            <div className="relative aspect-[8001/3397] w-full">
              {slides.map((s, i) =>
                s.image ? (
                  <img
                    key={s.id}
                    src={s.image}
                    alt={s.alt || ''}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                      i === active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ) : null
              )}
            </div>
          </Link>
        ) : (
          <div className="site-container py-20 text-white">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{slide.heading}</h1>
            {slide.subheading && <p className="mt-4 max-w-lg text-white/85">{slide.subheading}</p>}
            <Link
              href={slide.href || '/products'}
              className="mt-7 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90"
            >
              {slide.ctaLabel || 'Browse products'}
            </Link>
          </div>
        )}

        {count > 1 && (
          <>
            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === active}
                  className={`h-2.5 w-2.5 transition-colors ${i === active ? 'bg-primary' : 'bg-white/70 hover:bg-white'}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(active - 1)}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/40 md:flex"
            >
              ‹
            </button>
            <button
              onClick={() => go(active + 1)}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/40 md:flex"
            >
              ›
            </button>
          </>
        )}
      </div>
    </section>
  )
}
