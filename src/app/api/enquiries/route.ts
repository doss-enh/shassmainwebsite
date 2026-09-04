import {NextRequest, NextResponse} from 'next/server'
import {serverClient} from '@sanity-lib/lib/client'

async function nextEnquiryNumber() {
  const year = new Date().getFullYear()
  const count = await serverClient.fetch<number>(
    `count(*[_type == "enquiry" && enquiryNumber match $prefix])`,
    {prefix: `ENQ-${year}-*`}
  )
  return `ENQ-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {customerName, company, email, phone, message, items} = body || {}

  if (!customerName || !email) {
    return NextResponse.json({error: 'Name and email are required.'}, {status: 400})
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({error: 'At least one product is required.'}, {status: 400})
  }

  const enquiryNumber = await nextEnquiryNumber()

  const doc = await serverClient.create({
    _type: 'enquiry',
    enquiryNumber,
    status: 'new',
    customerName,
    company: company || undefined,
    email,
    phone: phone || undefined,
    message: message || undefined,
    source: 'website',
    createdAt: new Date().toISOString(),
    items: items.map((item: {productId: string; quantity?: number}) => ({
      _key: crypto.randomUUID(),
      product: {_type: 'reference', _ref: item.productId},
      quantity: item.quantity || 1,
    })),
  })

  return NextResponse.json({id: doc._id, enquiryNumber})
}
