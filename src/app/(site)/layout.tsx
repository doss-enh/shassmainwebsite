import {client} from '@sanity-lib/lib/client'
import {siteSettingsQuery} from '@sanity-lib/lib/queries'
import {EnquiryCartProvider} from '@/components/site/EnquiryCartContext'
import {SiteHeader} from '@/components/site/Header'
import {Footer} from '@/components/site/Footer'
import {FloatingWhatsApp} from '@/components/site/FloatingWhatsApp'

/**
 * The gradient sits on the wrapper around the header and the page, so the
 * homepage hero continues the same band with no seam. Interior pages put a
 * white (or breadcrumb-grey) background on their own content, which covers
 * the gradient below the header.
 */
export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const settings = await client
    .fetch<{whatsapp?: string; siteName?: string}>(siteSettingsQuery)
    .catch(() => null)

  return (
    <EnquiryCartProvider>
      <div className="site-theme flex min-h-screen flex-col bg-white">
        <div className="site-hero-gradient flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
        <FloatingWhatsApp number={settings?.whatsapp} siteName={settings?.siteName} />
      </div>
    </EnquiryCartProvider>
  )
}
