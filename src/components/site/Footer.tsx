import Link from 'next/link'
import {client} from '@sanity-lib/lib/client'
import {menuByLocationQuery, siteSettingsQuery} from '@sanity-lib/lib/queries'
import {NewsletterForm} from './NewsletterForm'

type MenuItem = {label: string; link: string}

async function getFooterData() {
  try {
    const [menu, settings] = await Promise.all([
      client.fetch<{items?: MenuItem[]} | null>(menuByLocationQuery, {location: 'footer'}),
      client.fetch(siteSettingsQuery),
    ])
    return {items: menu?.items || [], settings}
  } catch {
    return {items: [] as MenuItem[], settings: null}
  }
}

const trustBadges = [
  {icon: '⚡', title: 'Fast Response', desc: 'Quotes within 1 business day'},
  {icon: '🎨', title: 'Custom Branding', desc: 'Your logo, done right'},
  {icon: '🤝', title: 'Dedicated Support', desc: 'A real person, every order'},
  {icon: '📄', title: 'Full Catalogue', desc: 'Download the PDF anytime'},
]

export async function Footer() {
  const {items, settings} = await getFooterData()

  return (
    <footer className="border-t border-neutral-200">
      <div className="site-hero-gradient">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-white sm:grid-cols-4">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-start gap-2.5">
              <span className="text-xl">{b.icon}</span>
              <div>
                <div className="text-sm font-semibold">{b.title}</div>
                <div className="text-xs text-white/80">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-2 text-base font-semibold text-neutral-900">{settings?.siteName || 'Shass Gift'}</div>
            <p className="text-sm text-neutral-600">{settings?.tagline || 'Corporate gifts, Dubai'}</p>
            {settings?.address && <p className="mt-3 text-sm text-neutral-600">{settings.address}</p>}
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-neutral-900">Company</div>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/products" className="hover:text-primary">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="hover:text-primary">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              {items.map((item) => (
                <li key={item.link}>
                  <Link href={item.link} className="hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-neutral-900">Contact</div>
            <ul className="space-y-2 text-sm text-neutral-600">
              {settings?.contactEmail && <li>{settings.contactEmail}</li>}
              {settings?.contactPhone && <li>{settings.contactPhone}</li>}
              {settings?.whatsapp && <li>WhatsApp: {settings.whatsapp}</li>}
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-neutral-900">Newsletter</div>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {settings?.siteName || 'Shass Gift'}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
