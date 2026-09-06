export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shassgift.com').replace(/\/$/, '')

export const absolute = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

type Address = {streetAddress?: string; locality?: string; region?: string; country?: string}

export type OrgSettings = {
  siteName?: string
  legalName?: string
  tagline?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: Address
  socialLinks?: {platform?: string; url?: string}[]
  logoUrl?: string
}

/**
 * Organization + LocalBusiness for the site root.
 *
 * LocalBusiness (rather than plain Organization) is what carries the address
 * and service area, which is the part that matters for "corporate gifts near
 * me" style queries and for assistants answering location questions.
 */
export function organizationJsonLd(s: OrgSettings) {
  const address = s.address || {}
  const hasAddress = address.streetAddress || address.locality

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: s.siteName || 'Shass Gift',
    legalName: s.legalName || undefined,
    description: s.tagline || undefined,
    url: SITE_URL,
    logo: s.logoUrl || undefined,
    image: s.logoUrl || undefined,
    email: s.email || undefined,
    telephone: s.phone || undefined,
    ...(hasAddress && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress || undefined,
        addressLocality: address.locality || undefined,
        addressRegion: address.region || undefined,
        addressCountry: address.country || 'AE',
      },
    }),
    areaServed: {'@type': 'Country', name: address.country || 'United Arab Emirates'},
    sameAs: (s.socialLinks || []).map((l) => l.url).filter(Boolean),
  }
}

export function websiteJsonLd(siteName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteName || 'Shass Gift',
    publisher: {'@id': `${SITE_URL}/#organization`},
    // Lets search engines offer a search box straight into the listing.
    potentialAction: {
      '@type': 'SearchAction',
      target: {'@type': 'EntryPoint', urlTemplate: `${SITE_URL}/products?q={search_term_string}`},
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(trail: {name: string; path: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absolute(c.path),
    })),
  }
}

export function productJsonLd(p: {
  title: string
  slug: string
  sku?: string
  description?: string
  images: string[]
  category?: string
  colors?: string[]
  inStock?: boolean
  brand?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    sku: p.sku || undefined,
    description: p.description || undefined,
    image: p.images.filter(Boolean),
    category: p.category || undefined,
    color: p.colors?.length ? p.colors.join(', ') : undefined,
    brand: {'@type': 'Brand', name: p.brand || 'Shass Gift'},
    url: absolute(`/products/${p.slug}`),
    // Nothing on this site is sold online — it is quote-only — so the offer
    // carries no price. Omitting `price` with this availability is the
    // documented way to say "contact for pricing" rather than faking a 0.00.
    offers: {
      '@type': 'Offer',
      url: absolute(`/products/${p.slug}`),
      availability: p.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      priceCurrency: 'AED',
      availabilityStarts: undefined,
      seller: {'@id': `${SITE_URL}/#organization`},
    },
  }
}

/** FAQPage is the block answer engines quote from most directly. */
export function faqJsonLd(faqs: {question: string; answer: string}[]) {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {'@type': 'Answer', text: f.answer},
    })),
  }
}

export function articleJsonLd(post: {
  title: string
  slug: string
  excerpt?: string
  image?: string
  publishedAt?: string
  author?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.image || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.publishedAt || undefined,
    author: {'@type': 'Organization', name: post.author || 'Shass Gift'},
    publisher: {'@id': `${SITE_URL}/#organization`},
    mainEntityOfPage: absolute(`/blog/${post.slug}`),
  }
}

export function itemListJsonLd(name: string, items: {title: string; slug: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absolute(`/products/${p.slug}`),
      name: p.title,
    })),
  }
}
