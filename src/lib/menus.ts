import 'server-only'
import {serverClient} from '@sanity-lib/lib/client'

export type MenuItemRow = {
  _key: string
  label?: string
  linkType?: string
  href?: string
  category?: {name?: string; slug?: {current: string}}
}

export type MenuRow = {
  _id: string
  title: string
  location?: string
  items?: MenuItemRow[]
}

export async function listMenus(): Promise<MenuRow[]> {
  return serverClient.fetch(
    `*[_type == "navigationMenu"] | order(location asc) {
      _id, title, location,
      items[]{_key, label, linkType, href, category->{name, slug}}
    }`,
  )
}

/**
 * Writes a new item order for one menu.
 *
 * The incoming keys are validated against what the document actually holds
 * before anything is written: a stale tab reordering a menu someone else has
 * since edited would otherwise drop or duplicate items. If the sets do not
 * match exactly, the reorder is refused rather than applied partially.
 */
export async function reorderMenuItems(id: string, keys: string[]): Promise<{ok: boolean; reason?: string}> {
  const items = await serverClient.fetch<MenuItemRow[] | null>(`*[_id == $id][0].items`, {id})
  if (!items?.length) return {ok: false, reason: 'Menu has no items.'}

  const current = items.map((i) => i._key)
  const sameSet = current.length === keys.length && current.every((k) => keys.includes(k))
  if (!sameSet) return {ok: false, reason: 'This menu changed since the page loaded. Refresh and try again.'}

  const byKey = new Map(items.map((i) => [i._key, i]))
  await serverClient
    .patch(id)
    .set({items: keys.map((k) => byKey.get(k)!)})
    .commit()

  return {ok: true}
}
