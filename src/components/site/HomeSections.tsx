import Link from 'next/link'
import {urlFor} from '@sanity-lib/lib/image'
import {PortableText} from './PortableText'

export type RichSection = {heading?: string; body?: any[]}

/** Centred heading + copy, the shape most of the homepage bands take. */
export function CopyBand({
  section,
  tone = 'light',
  className = '',
  children,
}: {
  section?: RichSection
  tone?: 'light' | 'dark'
  className?: string
  children?: React.ReactNode
}) {
  if (!section?.heading && !section?.body && !children) return null
  const headingTone = tone === 'dark' ? 'text-white' : 'text-site-secondary'
  const bodyTone = tone === 'dark' ? 'text-white/80' : 'text-neutral-600'

  return (
    <section className={`site-container py-14 text-center ${className}`}>
      {section?.heading && <h2 className={`text-2xl font-bold ${headingTone}`}>{section.heading}</h2>}
      {section?.body && (
        <div className={`prose prose-sm mx-auto mt-4 max-w-3xl text-center ${bodyTone} prose-p:my-2`}>
          <PortableText value={section.body} />
        </div>
      )}
      {children}
    </section>
  )
}

type BrandTile = {label?: string; image?: any; link?: string}

export function FeaturedBrands({heading, tiles}: {heading?: string; tiles?: BrandTile[]}) {
  if (!tiles?.length) return null
  return (
    <section className="site-container py-10">
      {heading && <h2 className="mb-5 text-base font-bold text-neutral-900">{heading}</h2>}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {tiles.map((tile, i) => {
          const img = urlFor(tile.image)?.width(500).height(360).url()
          const inner = (
            <>
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                {img && <img src={img} alt={tile.image?.alt || tile.label || ''} className="h-full w-full object-cover" />}
              </div>
              {tile.label && <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{tile.label}</div>}
            </>
          )
          return tile.link ? (
            <Link key={i} href={tile.link} className="group block">
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>
    </section>
  )
}

/** Gradient band: copy on the left, a single large rotated image on the right. */
export function HighlightBand({section, image}: {section?: RichSection; image?: any}) {
  if (!section?.heading && !section?.body) return null
  const img = urlFor(image)?.width(560).height(560).url()

  return (
    <section className="site-hero-gradient">
      <div className="site-container grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2">
        <div className="text-white">
          {section.heading && <h2 className="text-2xl font-bold">{section.heading}</h2>}
          {section.body && (
            <div className="prose prose-sm mt-4 max-w-none text-white/85 prose-p:my-3">
              <PortableText value={section.body} />
            </div>
          )}
        </div>
        {img && (
          <div className="flex justify-center md:justify-end">
            <div className="h-64 w-64 rotate-45 overflow-hidden rounded-[22%] bg-white shadow-xl">
              <img src={img} alt={image?.alt || ''} className="h-full w-full -rotate-45 scale-[1.42] object-contain p-[14%]" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

type Card = {icon?: string; title?: string; text?: string}

export function IconCards({cards, tone = 'light', columns = 3}: {cards?: Card[]; tone?: 'light' | 'dark'; columns?: number}) {
  if (!cards?.length) return null
  const cardTone =
    tone === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
  const textTone = tone === 'dark' ? 'text-white/70' : 'text-neutral-600'

  return (
    <div className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {cards.map((card, i) => (
        <div key={i} className={`rounded-sm border p-5 text-left ${cardTone}`}>
          {card.icon && <div className="text-2xl">{card.icon}</div>}
          {card.title && <div className="mt-2 text-sm font-bold">{card.title}</div>}
          {card.text && <p className={`mt-1 text-[13px] ${textTone}`}>{card.text}</p>}
        </div>
      ))}
    </div>
  )
}

export function TagPills({tags}: {tags?: string[]}) {
  if (!tags?.length) return null
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {tags.map((tag) => (
        <span key={tag} className="rounded-sm border border-white/25 px-4 py-1.5 text-[13px] font-medium text-white">
          {tag}
        </span>
      ))}
    </div>
  )
}

type CtaButton = {label?: string; href?: string; style?: string}

export function CtaButtons({buttons}: {buttons?: CtaButton[]}) {
  if (!buttons?.length) return null
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {buttons.map((b, i) => (
        <Link
          key={i}
          href={b.href || '#'}
          className={
            b.style === 'outline'
              ? 'rounded-sm border border-primary px-6 py-2.5 text-[13px] font-semibold text-primary hover:bg-primary-soft'
              : 'rounded-sm bg-primary px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark'
          }
        >
          {b.label}
        </Link>
      ))}
    </div>
  )
}

export function ClientLogos({logos}: {logos?: any[]}) {
  if (!logos?.length) return null
  return (
    <div className="mt-8 grid grid-cols-2 border-l border-t border-neutral-200 sm:grid-cols-3 lg:grid-cols-6">
      {logos.map((logo, i) => {
        const img = urlFor(logo)?.width(240).height(140).url()
        return (
          <div key={i} className="flex aspect-[12/7] items-center justify-center border-b border-r border-neutral-200 p-5">
            {img && <img src={img} alt={logo?.alt || ''} className="max-h-full max-w-full object-contain" />}
          </div>
        )
      })}
    </div>
  )
}
