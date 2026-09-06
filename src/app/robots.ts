import type {MetadataRoute} from 'next'
import {SITE_URL} from '@/lib/seo'

export const revalidate = 3600

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The console and Studio hold no public content, and the enquiry
        // basket is per-visitor state. The API is machine-only.
        disallow: ['/admin', '/studio', '/enquiry', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
