export type FacetProduct = {
  colors?: string[]
  stockStatus?: string
  axes?: {name: string; values?: string[]}[]
}

export type FacetValue = {value: string; count: number; selected: boolean}
export type FacetGroup = {name: string; values: FacetValue[]}

/** Every "Attribute -> value" a product carries, colours included. */
export function attributesOf(p: FacetProduct): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  const add = (name: string, value: string) => {
    if (!value) return
    if (!out.has(name)) out.set(name, new Set())
    out.get(name)!.add(value)
  }
  for (const axis of p.axes || []) {
    for (const v of axis.values || []) add(axis.name, v)
  }
  // `colors` is the flattened list the cards draw from; a product can carry it
  // without a Color axis, so fold it in rather than relying on the axis alone.
  for (const c of p.colors || []) add('Color', c)
  return out
}

export function matchesSelection(p: FacetProduct, selection: Record<string, string[]>): boolean {
  const attrs = attributesOf(p)
  // Values within one facet are OR'd, separate facets are AND'd — the usual
  // shape, so ticking Black and White widens rather than eliminating.
  return Object.entries(selection).every(([name, values]) => {
    if (!values.length) return true
    const have = attrs.get(name)
    return !!have && values.some((v) => have.has(v))
  })
}

export function inStock(p: FacetProduct) {
  return (p.stockStatus || 'instock') !== 'outofstock'
}

/**
 * Counts for each facet value.
 *
 * A facet's own selection is excluded when counting it, so ticking "Black"
 * still shows how many White items you could add rather than collapsing every
 * other colour to zero.
 */
export function buildFacets(
  products: FacetProduct[],
  definitions: {name: string; values: string[]}[],
  selection: Record<string, string[]>,
  stockOnly: boolean,
): FacetGroup[] {
  const groups: FacetGroup[] = []

  for (const def of definitions) {
    const others = Object.fromEntries(Object.entries(selection).filter(([n]) => n !== def.name))
    const pool = products.filter((p) => (!stockOnly || inStock(p)) && matchesSelection(p, others))

    const counts = new Map<string, number>()
    for (const p of pool) {
      const have = attributesOf(p).get(def.name)
      if (!have) continue
      for (const v of have) counts.set(v, (counts.get(v) || 0) + 1)
    }

    const chosen = selection[def.name] || []
    const values = def.values
      .map((value) => ({value, count: counts.get(value) || 0, selected: chosen.includes(value)}))
      // A value nothing in this category carries is noise; a selected one
      // stays visible so it can be unticked.
      .filter((v) => v.count > 0 || v.selected)
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))

    if (values.length) groups.push({name: def.name, values})
  }

  return groups
}

/** Reads facet selections out of the query string (`?Color=Black&Color=White`). */
export function selectionFromParams(
  params: Record<string, string | string[] | undefined>,
  names: string[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const name of names) {
    const raw = params[name]
    if (!raw) continue
    out[name] = Array.isArray(raw) ? raw : [raw]
  }
  return out
}
