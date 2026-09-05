'use client'

import {useEffect, useRef, useState} from 'react'

/**
 * Continuously scrolling client logos. The track holds two copies of the
 * list and translates by exactly half its width, so the seam never shows
 * and the loop needs no JS per frame. Pauses on hover, and respects
 * prefers-reduced-motion by falling back to a static, scrollable row.
 */
export function ClientLogosCarousel({logos}: {logos: {src: string; alt: string}[]}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  if (!logos.length) return null

  // Duplicate for the seamless wrap. Slower when there are more logos, so
  // the apparent speed stays constant regardless of how many are set.
  const doubled = [...logos, ...logos]
  const duration = Math.max(18, logos.length * 3.5)

  return (
    <div
      className="group relative mt-10 overflow-hidden"
      style={{maskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)'}}
    >
      <div
        ref={trackRef}
        className={reduced ? 'flex gap-14 overflow-x-auto pb-2' : 'flex w-max gap-14 group-hover:[animation-play-state:paused]'}
        style={reduced ? undefined : {animation: `shass-marquee ${duration}s linear infinite`}}
      >
        {doubled.map((logo, i) => (
          <div key={i} className="flex h-[70px] w-[150px] shrink-0 items-center justify-center">
            <img
              src={logo.src}
              alt={logo.alt}
              // Only the first copy is announced; the rest is decorative.
              aria-hidden={i >= logos.length}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
