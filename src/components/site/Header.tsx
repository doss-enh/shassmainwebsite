import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {navigationMenuByLocationQuery, siteSettingsQuery, categoryTreeFlatQuery} from '@sanity-lib/lib/queries'
import {urlFor} from '@sanity-lib/lib/image'
import {buildCategoryTree, type CategoryNode, type FlatCategory} from '@/lib/categoryTree'
import {getStorefrontRoots} from '@/lib/storefrontRoots'
import {CartBadge} from './CartBadge'
import {MegaMenu} from './MegaMenu'
import {MobileNav} from './MobileNav'
import {SearchBar} from './SearchBar'
import {SocialIcons} from './SocialIcons'

type NavItem = {label: string; href?: string; linkType: string; category?: {slug?: {current: string}}}
type SocialLink = {platform: string; url: string}

async function getHeaderData() {
  try {
    const [mainMenu, roots, flat, settings] = await Promise.all([
      client.fetch<{items?: NavItem[]} | null>(navigationMenuByLocationQuery, {location: 'main'}),
      getStorefrontRoots(),
      client.fetch<FlatCategory[]>(categoryTreeFlatQuery),
      client.fetch(siteSettingsQuery),
    ])

    return {
      items: mainMenu?.items || [],
      categoryTree: buildCategoryTree(roots, flat),
      siteName: settings?.siteName || 'Shass Gift',
      contactPhone: settings?.phone,
      logoUrl: urlFor(settings?.logo)?.height(80).url(),
      socialLinks: (settings?.socialLinks || []) as SocialLink[],
    }
  } catch {
    return {
      items: [] as NavItem[],
      categoryTree: [] as CategoryNode[],
      siteName: 'Shass Gift',
      contactPhone: undefined as string | undefined,
      logoUrl: undefined as string | undefined,
      socialLinks: [] as SocialLink[],
    }
  }
}

function resolveHref(item: NavItem) {
  if (item.linkType === 'category' && item.category?.slug?.current) return `/products?category=${item.category.slug.current}`
  return item.href || '#'
}

/**
 * Sits directly on the hero gradient — there's no white utility bar. Both
 * rows are white-on-gradient, so the header and hero read as one band.
 * The parent section supplies the gradient background.
 */
export function Header({items, categoryTree, siteName, contactPhone, logoUrl, socialLinks}: Awaited<ReturnType<typeof getHeaderData>>) {
  return (
    <div className="relative z-30">
      {/* Row 1 — logo, search, social, account, phone, cart. 80px tall to
          match the live header, with the logo at its rendered 71px. */}
      <div className="site-container flex h-[71px] items-center justify-between gap-3 sm:gap-6">
        <MobileNav tree={categoryTree} items={items.map((i) => ({label: i.label, href: resolveHref(i)}))} phone={contactPhone} />

        <Link href="/" className="flex shrink-0 items-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain sm:h-[52px]" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-white">{siteName}</span>
          )}
        </Link>

        <div className="ml-auto hidden w-full max-w-md md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-5">
          {socialLinks.length > 0 && <SocialIcons links={socialLinks} variant="light" className="hidden lg:flex" />}

          <Link href="/enquiry" className="hidden flex-col items-center text-[11px] text-white hover:text-white/80 lg:flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Login
          </Link>

          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="hidden text-[13px] text-white sm:block">
              <span className="block text-[11px] text-white/70">Call Us</span>
              <span className="font-bold">{contactPhone}</span>
            </a>
          )}

          <CartBadge variant="light" />
        </div>
      </div>

      {/* Below md there is no room beside the logo, so search gets its own row
          rather than disappearing as it used to. */}
      <div className="site-container pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Row 2 — categories, nav, brochure, recently viewed. 90px on the live site. */}
      <div className="site-container hidden h-[72px] items-center gap-8 lg:flex">
        <MegaMenu tree={categoryTree} />

        {/* Home is fixed; the rest come from the "main" navigation menu. */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-white md:flex">
          <Link href="/" className="hover:text-white/75">
            Home
          </Link>
          {items.map((item) => (
            <Link key={item.label} href={resolveHref(item)} className="hover:text-white/75">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-7 lg:flex">
          <Link
            href="/contact"
            className="rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark"
          >
            Download Brochure
          </Link>
          <Link href="/products" className="flex items-center gap-2 text-[14px] font-semibold text-white hover:text-white/75">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Recently Viewed
          </Link>
        </div>
      </div>
    </div>
  )
}

export async function SiteHeader() {
  const data = await getHeaderData()
  return <Header {...data} />
}
