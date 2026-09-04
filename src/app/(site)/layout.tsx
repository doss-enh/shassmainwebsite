import {EnquiryCartProvider} from '@/components/site/EnquiryCartContext'
import {Header} from '@/components/site/Header'
import {Footer} from '@/components/site/Footer'

export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <EnquiryCartProvider>
      <div className="site-theme flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </EnquiryCartProvider>
  )
}
