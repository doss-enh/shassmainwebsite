import type {Metadata} from 'next'
import {SITE_URL} from '@/lib/seo'
import {Inter, Montserrat} from 'next/font/google'
import './globals.css'

// The live site pairs Montserrat (400/600/700) for headings with the system
// UI stack for body copy; Inter stays available for the admin console.
const montserrat = Montserrat({subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-montserrat'})
const inter = Inter({subsets: ['latin'], variable: '--font-inter'})

// metadataBase makes every relative OG/canonical URL in child routes absolute.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Shass Gift | Corporate Gifts & Promotional Items Supplier in Dubai, UAE',
    template: '%s | Shass Gift',
  },
  description:
    'Corporate gift and promotional item supplier in Dubai, UAE. Branded technology, drinkware, bags, stationery and premium gifts, customised with your logo. Enquire for a quote.',
  applicationName: 'Shass Gift',
  keywords: [
    'corporate gifts Dubai',
    'promotional gifts UAE',
    'branded merchandise Dubai',
    'custom corporate gifts',
    'promotional items supplier UAE',
  ],
  alternates: {canonical: '/'},
  openGraph: {
    type: 'website',
    siteName: 'Shass Gift',
    locale: 'en_AE',
    url: SITE_URL,
  },
  twitter: {card: 'summary_large_image'},
  robots: {
    index: true,
    follow: true,
    googleBot: {index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1},
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
