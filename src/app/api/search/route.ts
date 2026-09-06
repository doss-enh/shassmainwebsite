import {NextRequest, NextResponse} from 'next/server'
import {client} from '@sanity-lib/lib/client'
import {urlFor} from '@sanity-lib/lib/image'

export const revalidate = 60

type Row = {
  _id: string
  title: string
  sku?: string
  slug?: {current: string}
  featuredImage?: Parameters<typeof urlFor>[0]
  category?: {name?: string}
}

/**
 * Typeahead for the header search. Matches title or SKU and returns just
 * enough to draw a suggestion row; the full listing handles real browsing.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (q.length < 2) return NextResponse.json({results: []})

  try {
    const rows = await client.fetch<Row[]>(
      `*[_type == "product" && status != "draft" && (title match $term || sku match $term)]
        | score(title match $term, sku match $term)
        | order(_score desc)[0...8]{
          _id, title, sku, slug, featuredImage, category->{name}
        }`,
      // Trailing * so "powerb" finds "Powerbank"; GROQ match is word-prefix based.
      {term: `${q}*`},
    )

    return NextResponse.json({
      results: rows.map((r) => ({
        id: r._id,
        title: r.title,
        sku: r.sku,
        category: r.category?.name,
        href: r.slug?.current ? `/products/${r.slug.current}` : '/products',
        image: urlFor(r.featuredImage)?.width(80).height(80).url() || null,
      })),
    })
  } catch {
    // A search that errors should quietly return nothing rather than break
    // the header it is embedded in.
    return NextResponse.json({results: []})
  }
}
