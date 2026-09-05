export type FlatCategory = {_id: string; name: string; slug?: {current: string}; parentId?: string}

export type CategoryNode = {
  _id: string
  name: string
  slug?: string
  children: CategoryNode[]
}

export function buildCategoryTree(topLevel: {_id: string; name: string; slug?: {current: string}}[], flat: FlatCategory[]): CategoryNode[] {
  const byParent = new Map<string, FlatCategory[]>()
  for (const cat of flat) {
    if (!cat.parentId) continue
    const list = byParent.get(cat.parentId) || []
    list.push(cat)
    byParent.set(cat.parentId, list)
  }

  function toNode(cat: {_id: string; name: string; slug?: {current: string}}): CategoryNode {
    const children = (byParent.get(cat._id) || []).map(toNode)
    return {_id: cat._id, name: cat.name, slug: cat.slug?.current, children}
  }

  return topLevel.map(toNode)
}
