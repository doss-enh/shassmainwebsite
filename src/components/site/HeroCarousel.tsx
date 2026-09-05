'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'

export type HeroSlide = {
  id: string
  heading: string
  subheading?: string
  ctaLabel: string
  ctaHref: string
}

/** Rotated-square tile. The inner image counter-rotates so it stays upright. */
function Diamond({src, size, className = ''}: {src: string; size: number; className?: string}) {
  return (
    <div
      className={`shrink-0 rotate-45 overflow-hidden rounded-[22%] bg-white shadow-lg ${className}`}
      style={{width: size, height: size}}
    >
      <img src={src} alt="" className="h-full w-full -rotate-45 scale-[1.42] object-contain p-[14%]" />
    </div>
  )
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

  // First word stays bold; the rest drops to a lighter weight, as on the
  // live site's category banners ("Technology Gifts").
  const words = slide.heading.trim().split(/\s+/)
  const lead = words[0]
  const rest = words.slice(1).join(' ')

  const feature = gridImages[0]
  const row = gridImages.slice(1, 6)

  return (
    <div className="site-container relative pb-16 pt-6">
      <h1 className="max-w-3xl text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
        <span className="font-bold">{lead}</span>
        {rest && <span className="font-light"> {rest}</span>}
      </h1>

      {slide.subheading && <p className="mt-4 max-w-lg text-white/85">{slide.subheading}</p>}

      <Link
        href={slide.ctaHref}
        className="mt-7 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90"
      >
        {slide.ctaLabel}
      </Link>

      <div className="pointer-events-none mt-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-12 pl-4 sm:gap-16">
          {row.map((src, i) => (
            <Diamond key={i} src={src} size={104} className="ring-4 ring-white/15" />
          ))}
        </div>
        {feature && <Diamond src={feature} size={230} className="hidden xl:block ring-8 ring-white/10" />}
      </div>

      {slides.length > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-7 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
