import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery, topLevelCategoriesQuery, navigationMenuByLocationQuery} from '@sanity-lib/lib/queries'
import {NewsletterForm} from './NewsletterForm'
import {SocialIcons} from './SocialIcons'

async function getData() {
  try {
    const [settings, categories, mainMenu] = await Promise.all([
      client.fetch(siteSettingsQuery),
      client.fetch<{_id: string; name: string; slug?: {current: string}}[]>(topLevelCategoriesQuery),
      client.fetch<{items?: {label: string; href?: string}[]} | null>(navigationMenuByLocationQuery, {location: 'main'}),
    ])
    return {settings, categories, mainItems: mainMenu?.items || []}
  } catch {
    return {settings: null, categories: [] as {_id: string; name: string; slug?: {current: string}}[], mainItems: [] as {label: string; href?: string}[]}
  }
}

const trustBadges = [
  {icon: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z', title: 'Fast Turnaround', desc: 'Quick quotes and production'},
  {icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6', title: 'Catalogue', desc: 'Download the full PDF'},
  {icon: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z', title: 'Secure Enquiries', desc: 'Your details stay private'},
  {icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20', title: 'Dedicated Support', desc: 'A real person, every order'},
  {icon: 'M20.6 3.4a2 2 0 0 0-2.83 0L4 17.17V20h2.83L20.6 6.23a2 2 0 0 0 0-2.83z', title: 'Full Range', desc: 'Thousands of products'},
]

export async function Footer() {
  const {settings, categories, mainItems} = await getData()
  const address = settings?.address as {streetAddress?: string; locality?: string; region?: string; country?: string} | undefined
  const addressLine = address ? [address.streetAddress, address.locality, address.region, address.country].filter(Boolean).join(', ') : undefined
  const socialLinks = settings?.socialLinks || []
  const half = Math.ceil(categories.length / 2)

  return (
    <footer className="border-t border-neutral-200">
      <div className="bg-neutral-900">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-6 text-white sm:grid-cols-5">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-start gap-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 shrink-0 text-primary-soft">
                <path d={b.icon} />
              </svg>
              <div>
                <div className="text-[13px] font-semibold">{b.title}</div>
                <div className="text-[11px] text-white/60">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-5">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-2 text-base font-semibold text-neutral-900">{settings?.siteName || 'Shass Gift'}</div>
            <p className="text-sm text-neutral-600">{settings?.tagline || 'Corporate gifts, Dubai'}</p>
            {addressLine && <p className="mt-3 text-sm text-neutral-600">{addressLine}</p>}
            {settings?.phone && <p className="mt-2 text-sm text-neutral-600">{settings.phone}</p>}
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-neutral-900">Quick Links</div>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary">
                  Products
                </Link>
              </li>
              {mainItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href || '#'} className="hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {categories.length > 0 && (
            <>
              <div>
                <div className="mb-3 text-sm font-semibold text-neutral-900">Categories</div>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {categories.slice(0, half).map((c) => (
                    <li key={c._id}>
                      <Link href={`/products?category=${c.slug?.current}`} className="hover:text-primary">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-3 text-sm font-semibold text-neutral-900 sm:invisible">Categories</div>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {categories.slice(half).map((c) => (
                    <li key={c._id}>
                      <Link href={`/products?category=${c.slug?.current}`} className="hover:text-primary">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div>
            <div className="mb-3 text-sm font-semibold text-neutral-900">Newsletter</div>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-neutral-200 py-4">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} {settings?.legalName || settings?.siteName || 'Shass Gift'}. All rights reserved.
            </p>
            {socialLinks.length > 0 && <SocialIcons links={socialLinks} className="flex" />}
          </div>
        </div>
      </div>
    </footer>
  )
}
