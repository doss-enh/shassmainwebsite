import type {Metadata} from 'next'
import {Inter, Montserrat} from 'next/font/google'
import './globals.css'

// The live site pairs Montserrat (400/600/700) for headings with the system
// UI stack for body copy; Inter stays available for the admin console.
const montserrat = Montserrat({subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-montserrat'})
const inter = Inter({subsets: ['latin'], variable: '--font-inter'})

export const metadata: Metadata = {
  title: 'Shass Gift',
  description: 'Corporate gifts, Dubai',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
