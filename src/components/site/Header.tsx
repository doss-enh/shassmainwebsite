import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {navigationMenuByLocationQuery, siteSettingsQuery, topLevelCategoriesQuery, categoryTreeFlatQuery} from '@sanity-lib/lib/queries'
import {buildCategoryTree, type CategoryNode, type FlatCategory} from '@/lib/categoryTree'
import {CartBadge} from './CartBadge'
import {MegaMenu} from './MegaMenu'
import {SocialIcons} from './SocialIcons'

type NavItem = {label: string; href?: string; linkType: string; category?: {slug?: {current: string}}}
type SocialLink = {platform: string; url: string}

async function getHeaderData() {
  try {
    const [mainMenu, topLevel, flat, settings] = await Promise.all([
      client.fetch<{items?: NavItem[]} | null>(navigationMenuByLocationQuery, {location: 'main'}),
      client.fetch<{_id: string; name: string; slug?: {current: string}}[]>(topLevelCategoriesQuery),
      client.fetch<FlatCategory[]>(categoryTreeFlatQuery),
      client.fetch(siteSettingsQuery),
    ])
    return {
      items: mainMenu?.items || [],
      categoryTree: buildCategoryTree(topLevel, flat),
      siteName: settings?.siteName || 'Shass Gift',
      contactPhone: settings?.phone,
      socialLinks: (settings?.socialLinks || []) as SocialLink[],
    }
  } catch {
    return {
      items: [] as NavItem[],
      categoryTree: [] as CategoryNode[],
      siteName: 'Shass Gift',
      contactPhone: undefined as string | undefined,
      socialLinks: [] as SocialLink[],
    }
  }
}

function resolveHref(item: NavItem) {
  if (item.linkType === 'category' && item.category?.slug?.current) return `/products?category=${item.category.slug.current}`
  return item.href || '#'
}

export async function Header() {
  const {items, categoryTree, siteName, contactPhone, socialLinks} = await getHeaderData()

  return (
    <header className="sticky top-0 z-30">
      {/* Utility bar */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-white">
              SG
            </div>
            <span className="text-base font-semibold leading-tight text-neutral-900">{siteName}</span>
          </Link>

          <div className="hidden flex-1 max-w-md md:block">
            <form action="/products" className="relative">
              <input
                name="q"
                placeholder="Search products…"
                className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-[13px] outline-none focus:border-primary"
              />
              <button type="submit" className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>

          <div className="flex items-center gap-5">
            {socialLinks.length > 0 && <SocialIcons links={socialLinks} className="hidden lg:flex" />}
            <Link href="/enquiry" className="hidden flex-col items-center text-[11px] text-neutral-500 hover:text-primary lg:flex">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Login
            </Link>
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="hidden text-[13px] text-neutral-600 sm:block">
                <span className="text-[11px] text-neutral-400">Call Us</span>
                <div className="font-semibold text-neutral-900">{contactPhone}</div>
              </a>
            )}
            <CartBadge />
          </div>
        </div>
      </div>

      {/* Category / nav bar — same gradient as the hero, so the two read as one band */}
      <div className="site-hero-gradient">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <MegaMenu tree={categoryTree} />

          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-white md:flex">
            <Link href="/products" className="hover:text-white/80">
              Products
            </Link>
            {items.map((item) => (
              <Link key={item.label} href={resolveHref(item)} className="hover:text-white/80">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-6 lg:flex">
            <Link
              href="/contact"
              className="rounded-sm bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark"
            >
              Download Brochure
            </Link>
            <Link href="/products" className="flex items-center gap-2 text-[13px] font-semibold text-white hover:text-white/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Recently Viewed
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
