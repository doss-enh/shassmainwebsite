import {NextRequest, NextResponse} from 'next/server'
import {client} from '@sanity-lib/lib/client'
import {productsByIdsQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {createEnquiry} from '@/lib/db/enquiries'
import {fireWebhooks} from '@/lib/db/webhooks'

type SanityProduct = {_id: string; title: string; sku?: string; slug?: {current: string}; featuredImage?: any}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {customerName, company, email, phone, message, items} = body || {}

  if (!customerName || !email) {
    return NextResponse.json({error: 'Name and email are required.'}, {status: 400})
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({error: 'At least one product is required.'}, {status: 400})
  }

  const productIds: string[] = items.map((i: {productId: string}) => i.productId)
  let products: SanityProduct[] = []
  try {
    products = await client.fetch<SanityProduct[]>(productsByIdsQuery, {ids: productIds})
  } catch {
    products = []
  }
  const productById = new Map(products.map((p) => [p._id, p]))

  const enquiryItems = items.map((item: {productId: string; quantity?: number; note?: string}) => {
    const product = productById.get(item.productId)
    return {
      productId: item.productId,
      productName: product?.title || 'Unknown product',
      productSku: product?.sku,
      productUrl: product?.slug?.current ? `/products/${product.slug.current}` : undefined,
      imageUrl: urlFor(product?.featuredImage)?.width(200).height(200).url(),
      quantity: item.quantity || 1,
      note: item.note,
    }
  })

  const {id, enquiryNumber} = await createEnquiry({
    customerName,
    company,
    email,
    phone,
    message,
    source: 'website',
    items: enquiryItems,
  })

  await fireWebhooks('enquiry.created', {id, enquiryNumber, customerName, email})

  return NextResponse.json({id, enquiryNumber})
}
