import {createClient} from 'next-sanity'

// Falls back to a placeholder id so the client can always be constructed
// (e.g. in local dev before a real Sanity project is connected). Reads
// against the placeholder simply fail over the network and are caught by
// callers, which already render sensible empty states.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Read-only client for public site pages (uses CDN, no token).
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

// Server-only client for the admin console: not cached, and authenticated
// with a write token so it can create/update/delete documents (enquiries,
// products, content, settings). Never import this from client components.
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})
