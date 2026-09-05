import {client} from '@sanity-lib/lib/client'
import {storefrontRootsQuery, topLevelCategoriesQuery} from '@sanity-lib/lib/queries'

export type StorefrontRoot = {
  _id: string
  name: string
  slug?: {current: string}
  image?: unknown
}

/**
 * The nine category roots the storefront shows, curated in siteSettings.
 *
 * The dataset holds more top-level categories than the site displays — an
 * unused parallel taxonomy from an earlier import — so every visitor-facing
 * surface (header flyout, footer, product filters, homepage row) reads this
 * one list. Falls back to every top-level category if nothing is curated.
 */
export async function getStorefrontRoots(): Promise<StorefrontRoot[]> {
  try {
    const curated = await client.fetch<StorefrontRoot[] | null>(storefrontRootsQuery)
    if (curated?.length) return curated
    return (await client.fetch<StorefrontRoot[]>(topLevelCategoriesQuery)) || []
  } catch {
    return []
  }
}
