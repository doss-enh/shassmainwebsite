'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'
import {DiamondGrid} from './DiamondGrid'

export type HeroSlide = {
  id: string
  heading: string
  subheading?: string
  ctaLabel: string
  ctaHref: string
}

export function HeroCarousel({slides, gridImages}: {slides: HeroSlide[]; gridImages: string[]}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000)
    return () => clearInterval(id)
  }, [slides.length])

  if (slides.length === 0) return null
  const slide = slides[active]

  return (
    <section className="site-hero-gradient relative overflow-hidden">
      <div className="relative site-container grid grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div className="text-white">
          <h1 className="text-4xl font-extrabold uppercase leading-tight sm:text-5xl">
            {slide.heading.split('\n').map((line, i) => (
              <span key={i} className={i === 0 ? 'inline-block border-b-4 border-white pb-1' : 'block'}>
                {line}
              </span>
            ))}
          </h1>
          {slide.subheading && <p className="mt-4 max-w-md text-white/85">{slide.subheading}</p>}
          <Link href={slide.ctaHref} className="mt-7 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90">
            {slide.ctaLabel}
          </Link>
        </div>
        {gridImages.length > 0 && (
          <div className="hidden md:block">
            <DiamondGrid images={gridImages} />
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="relative z-10 flex justify-center gap-2 pb-6">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
