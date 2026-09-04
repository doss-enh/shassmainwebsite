'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import clsx from 'clsx'

const tabs = [
  {label: 'Site settings', href: '/admin/settings/site'},
  {label: 'Analytics & tags', href: '/admin/settings/analytics'},
  {label: 'Spam protection', href: '/admin/settings/spam'},
  {label: 'Email / SMTP', href: '/admin/settings/smtp'},
  {label: 'Tax', href: '/admin/settings/tax'},
  {label: 'Payments', href: '/admin/settings/payments'},
  {label: 'Webhooks', href: '/admin/settings/webhooks'},
  {label: 'Technical', href: '/admin/settings/technical'},
  {label: 'Redirects', href: '/admin/settings/redirects'},
]

export default function SettingsLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname() || ''

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Settings</h1>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'border-primary text-primary-dark' : 'border-transparent text-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      <div className="max-w-2xl">{children}</div>
    </div>
  )
}
