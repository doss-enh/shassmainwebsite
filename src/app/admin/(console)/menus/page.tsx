import {revalidatePath} from 'next/cache'
import {listMenus, reorderMenuItems} from '@/lib/menus'
import {getCurrentUser} from '@/lib/auth'
import {logAudit} from '@/lib/db/auditLog'
import {PageHeader} from '@/components/admin/PageHeader'
import {StudioLinkButton} from '@/components/admin/StudioLinkButton'
import {studioCreateUrl, studioEditUrl} from '@/lib/studio'
import {MenuItemList} from '@/components/admin/MenuItemList'

export const dynamic = 'force-dynamic'

async function reorder(id: string, keys: string[]) {
  'use server'
  const result = await reorderMenuItems(id, keys)
  if (result.ok) {
    const actor = await getCurrentUser()
    await logAudit({actor: actor?.email || 'console', action: 'menu.reordered', target: id})
    revalidatePath('/admin/menus')
    // Menus render in the header and footer of every page.
    revalidatePath('/', 'layout')
  }
  return result
}

export default async function MenusPage() {
  const menus = await listMenus().catch(() => [])

  return (
    <div>
      <PageHeader
        title="Menus"
        description={`${menus.length} menus · drag an item to reorder it`}
        action={<StudioLinkButton href={studioCreateUrl('navigationMenu')} label="New menu" />}
      />

      {menus.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted">No menus yet.</div>
      )}

      <div className="space-y-4">
        {menus.map((menu) => (
          <section key={menu._id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{menu.title}</h2>
                <p className="text-xs text-muted">
                  <span className="capitalize">{menu.location}</span> · {menu.items?.length || 0} items
                </p>
              </div>
              <a href={studioEditUrl('navigationMenu', menu._id)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary">
                Edit in Studio
              </a>
            </div>

            {menu.items?.length ? (
              <MenuItemList
                menuId={menu._id}
                items={menu.items.map((item) => ({
                  key: item._key,
                  label: item.label || item.category?.name || 'Untitled',
                  target:
                    item.linkType === 'category' && item.category?.slug?.current
                      ? `/products?category=${item.category.slug.current}`
                      : item.href || '—',
                }))}
                onReorder={reorder}
              />
            ) : (
              <p className="text-xs text-muted">No items in this menu.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
