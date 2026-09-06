/**
 * Emits a JSON-LD block. Kept as one component so every structured-data
 * script on the site is escaped the same way.
 *
 * `<` is escaped because a product title or FAQ answer containing "</script>"
 * would otherwise close the tag early and inject markup into the page.
 */
export function JsonLd({data}: {data: unknown}) {
  if (!data) return null
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: json}} />
}
