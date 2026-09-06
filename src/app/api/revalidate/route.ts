import {NextRequest, NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'
import {isValidSignature, SIGNATURE_HEADER_NAME} from '@sanity/webhook'

// Sanity calls this when a document changes so edits appear immediately
// instead of waiting out the route's revalidate window (60s for the shop,
// 300s for pages and the blog).
//
// Configure in Sanity: API > Webhooks > Create webhook
//   URL      <site>/api/revalidate
//   Trigger  Create, Update, Delete
//   Filter   _type in ["product","category","page","post","faq","banner",
//                      "navigationMenu","siteSettings","homepage","redirect"]
//   Projection  {_type, "slug": slug.current}
//   Secret   the same value as SANITY_REVALIDATE_SECRET
//
// The route must run on Node: signature verification needs the raw body.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {_type?: string; slug?: string}

/** Which routes a change to this document type can affect. */
function pathsFor({_type, slug}: Payload): string[] {
  switch (_type) {
    case 'product':
      // A product shows on its own page, in listings, and in the homepage rows.
      return ['/', '/products', ...(slug ? [`/products/${slug}`] : [])]
    case 'category':
      return ['/', '/products']
    case 'post':
      return ['/blog', ...(slug ? [`/blog/${slug}`] : [])]
    case 'page':
      return slug ? [`/${slug}`] : []
    case 'faq':
      return ['/faqs', '/clients']
    case 'homepage':
    case 'banner':
      return ['/']
    // Header, footer and menus render on every page, so nothing narrower
    // would be correct here.
    case 'siteSettings':
    case 'navigationMenu':
    case 'redirect':
      return ['/', '/products', '/blog', '/faqs', '/contact', '/about-us', '/clients']
    default:
      return ['/']
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({error: 'SANITY_REVALIDATE_SECRET is not configured.'}, {status: 500})
  }

  const signature = req.headers.get(SIGNATURE_HEADER_NAME)
  const raw = await req.text()

  if (!signature || !(await isValidSignature(raw, signature, secret))) {
    return NextResponse.json({error: 'Invalid signature.'}, {status: 401})
  }

  let payload: Payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({error: 'Body is not JSON.'}, {status: 400})
  }

  const paths = [...new Set(pathsFor(payload))]
  for (const path of paths) revalidatePath(path)

  return NextResponse.json({revalidated: true, type: payload._type, paths})
}
