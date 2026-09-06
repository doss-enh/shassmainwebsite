import type {MetadataRoute} from 'next'
import {client} from '@sanity-lib/lib/client'
import {SITE_URL} from '@/lib/seo'

export const revalidate = 3600

type Row = {slug?: string; updated?: string}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1},
    {url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9},
    {url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7},
    {url: `${SITE_URL}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7},
    {url: `${SITE_URL}/clients`, lastModified: now, changeFrequency: 'monthly', priority: 0.6},
    {url: `${SITE_URL}/faqs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6},
    {url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6},
  ]

  try {
    const {products, categories, posts} = await client.fetch<{
      products: Row[]
      categories: Row[]
      posts: Row[]
    }>(`{
      "products": *[_type == "product" && status != "draft" && defined(slug.current)]{"slug": slug.current, "updated": _updatedAt},
      "categories": *[_type == "category" && defined(slug.current)]{"slug": slug.current, "updated": _updatedAt},
      "posts": *[_type == "post" && defined(slug.current)]{"slug": slug.current, "updated": coalesce(publishedAt, _updatedAt)}
    }`)

    return [
      ...staticPages,
      // Category listings are filter URLs on /products rather than their own
      // routes, so they are emitted in that form.
      ...categories.map((c) => ({
        url: `${SITE_URL}/products?category=${c.slug}`,
        lastModified: c.updated ? new Date(c.updated) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updated ? new Date(p.updated) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updated ? new Date(p.updated) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch {
    // A CMS outage should still leave a valid sitemap rather than a 500.
    return staticPages
  }
}
