import {EnquiryCartProvider} from '@/components/site/EnquiryCartContext'
import {SiteHeader} from '@/components/site/Header'
import {Footer} from '@/components/site/Footer'

/**
 * The gradient sits on the wrapper around the header and the page, so the
 * homepage hero continues the same band with no seam. Interior pages put a
 * white (or breadcrumb-grey) background on their own content, which covers
 * the gradient below the header.
 */
export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <EnquiryCartProvider>
      <div className="site-theme flex min-h-screen flex-col bg-white">
        <div className="site-hero-gradient flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </div>
    </EnquiryCartProvider>
  )
}
