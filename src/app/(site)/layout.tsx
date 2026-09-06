import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {EnquiryCartProvider} from '@/components/site/EnquiryCartContext'
import {SiteHeader} from '@/components/site/Header'
import {Footer} from '@/components/site/Footer'
import {FloatingWhatsApp} from '@/components/site/FloatingWhatsApp'
import {JsonLd} from '@/components/site/JsonLd'
import {urlFor} from '@sanity-lib/lib/image'
import {organizationJsonLd, websiteJsonLd} from '@/lib/seo'

/**
 * The gradient sits on the wrapper around the header and the page, so the
 * homepage hero continues the same band with no seam. Interior pages put a
 * white (or breadcrumb-grey) background on their own content, which covers
 * the gradient below the header.
 */
export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const settings = await client.fetch<any>(siteSettingsQuery).catch(() => null)
  const org = organizationJsonLd({
    siteName: settings?.siteName,
    legalName: settings?.legalName,
    tagline: settings?.tagline,
    email: settings?.email,
    phone: settings?.phone,
    address: settings?.address,
    socialLinks: settings?.socialLinks,
    logoUrl: urlFor(settings?.logo)?.width(600).url(),
  })

  return (
    <EnquiryCartProvider>
      <div className="site-theme flex min-h-screen flex-col bg-white">
        <div className="site-hero-gradient flex flex-1 flex-col">
          {/* Sticky, and carrying the gradient itself so it stays legible
              once it detaches from the hero band behind it. */}
          <div className="site-hero-gradient sticky top-0 z-50 shadow-sm">
            <SiteHeader />
          </div>
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
        <FloatingWhatsApp number={settings?.whatsapp} siteName={settings?.siteName} />
        <JsonLd data={org} />
        <JsonLd data={websiteJsonLd(settings?.siteName)} />
      </div>
    </EnquiryCartProvider>
  )
}
