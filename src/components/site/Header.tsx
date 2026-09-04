import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {menuByLocationQuery, siteSettingsQuery, allCategoriesQuery} from '@sanity-lib/lib/queries'
import {CartBadge} from './CartBadge'
import {CategoriesMenu} from './CategoriesMenu'

type MenuItem = {label: string; link: string}
type Category = {_id: string; name: string; slug?: {current: string}}

async function getHeaderData() {
  try {
    const [menu, settings, categories] = await Promise.all([
      client.fetch<{items?: MenuItem[]} | null>(menuByLocationQuery, {location: 'header'}),
      client.fetch(siteSettingsQuery),
      client.fetch<Category[]>(allCategoriesQuery),
    ])
    return {items: menu?.items || [], siteName: settings?.siteName || 'Shass Gift', contactPhone: settings?.contactPhone, categories}
  } catch {
    return {items: [] as MenuItem[], siteName: 'Shass Gift', contactPhone: undefined as string | undefined, categories: [] as Category[]}
  }
}

const mainLinks = [
  {label: 'Home', href: '/'},
  {label: 'Products', href: '/products'},
  {label: 'Blog', href: '/blog'},
  {label: 'FAQs', href: '/faqs'},
  {label: 'Contact', href: '/contact'},
]

export async function Header() {
  const {items, siteName, contactPhone, categories} = await getHeaderData()

  return (
    <header className="border-b border-neutral-200 bg-white">
      {/* Utility bar */}
      <div className="border-b border-neutral-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
              SG
            </div>
            <span className="text-base font-semibold text-neutral-900">{siteName}</span>
          </Link>

          <div className="hidden flex-1 max-w-md md:block">
            <form action="/products" className="relative">
              <input
                name="q"
                placeholder="Search products…"
                className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </form>
          </div>

          <div className="flex items-center gap-5">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="hidden text-sm text-neutral-600 sm:block">
                <span className="text-xs text-neutral-400">Call Us</span>
                <div className="font-semibold text-neutral-900">{contactPhone}</div>
              </a>
            )}
            <CartBadge />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <CategoriesMenu categories={categories} />

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
          {items.map((item) => (
            <Link key={item.link} href={item.link} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/catalogue"
          className="ml-auto rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
        >
          Download Brochure
        </Link>
      </div>
    </header>
  )
}
