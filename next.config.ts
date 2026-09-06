import type {NextConfig} from 'next'
import {createClient} from 'next-sanity'

// Read-only, no token: this runs at build time to fold the CMS's redirect
// documents into the app's own redirect table.
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const trimSlashes = (p: string) => `/${(p || '').trim().replace(/^\/+|\/+$/g, '')}`

const nextConfig: NextConfig = {
  async redirects() {
    // The old Laravel site used /product/<slug> and /product-category/<slug>.
    // Without these, every inbound link and every indexed URL from the
    // previous site lands on a 404 the day this goes live.
    const structural = [
      {source: '/product/:slug', destination: '/products/:slug', permanent: true},
      {source: '/product-category/:slug', destination: '/products?category=:slug', permanent: true},
      // The old category tree nested deeper; only the leaf identifies it.
      {source: '/product-category/:parent/:slug', destination: '/products?category=:slug', permanent: true},
      {source: '/product-category/:grandparent/:parent/:slug', destination: '/products?category=:slug', permanent: true},
      {source: '/blogs', destination: '/blog', permanent: true},
    ]

    try {
      const rows = await sanity.fetch<{source: string; destination: string; statusCode?: number}[]>(
        `*[_type == "redirect" && defined(source) && defined(destination)]{source, destination, statusCode}`,
      )

      // Editor-managed redirects come first so a specific slug change wins
      // over the generic pattern above it.
      const managed = rows
        .map((r) => ({
          source: trimSlashes(r.source),
          destination: r.destination.startsWith('http') ? r.destination : trimSlashes(r.destination),
          permanent: (r.statusCode ?? 301) === 301,
        }))
        .filter((r) => r.source !== r.destination && r.source !== '/')

      return [...managed, ...structural]
    } catch {
      // A CMS outage must not fail the build; the structural rules still apply.
      return structural
    }
  },
}

export default nextConfig
