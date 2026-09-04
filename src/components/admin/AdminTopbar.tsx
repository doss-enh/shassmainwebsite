'use client'

import {usePathname} from 'next/navigation'
import {adminNav} from '@/lib/adminNav'

function currentTitle(pathname: string) {
  for (const section of adminNav) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) return item.label
    }
  }
  return 'Shass Console'
}

export function AdminTopbar() {
  const pathname = usePathname() || ''
  const title = currentTitle(pathname)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Database
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> CMS
        </span>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/[0.03]"
        >
          View site
        </a>
        <form action="/api/auth/logout" method="post">
          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/[0.03]">
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
