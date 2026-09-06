const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shassgift.com'

export type WhatsAppEnquiry = {
  title: string
  sku?: string
  /** The specific variation code, when one is selected. */
  variantCode?: string
  /** Chosen axis values, e.g. {Color: 'Black', GB: '32'}. */
  options?: Record<string, string>
  quantity?: number
  path: string
}

/**
 * Builds a wa.me link carrying everything the salesperson needs to answer
 * without a follow-up question: what it is, its code, the exact variation
 * chosen, how many, and a link back to the page.
 *
 * Returns null when no number is configured, so callers can drop the button
 * rather than render a dead link.
 */
export function whatsappEnquiryUrl(number: string | undefined, enquiry: WhatsAppEnquiry): string | null {
  // wa.me wants digits only — no +, spaces or dashes.
  const digits = (number || '').replace(/\D/g, '')
  if (!digits) return null

  const lines = [`Hi, I'd like a quote for:`, '', enquiry.title]

  if (enquiry.sku) lines.push(`SKU: ${enquiry.sku}`)
  if (enquiry.variantCode && enquiry.variantCode !== enquiry.sku) lines.push(`Variation: ${enquiry.variantCode}`)

  for (const [name, value] of Object.entries(enquiry.options || {})) {
    if (value) lines.push(`${name}: ${value}`)
  }

  if (enquiry.quantity && enquiry.quantity > 1) lines.push(`Quantity: ${enquiry.quantity}`)
  lines.push('', `${SITE}${enquiry.path}`)

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`
}
