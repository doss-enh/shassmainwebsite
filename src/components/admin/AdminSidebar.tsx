'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import clsx from 'clsx'
import {adminNav} from '@/lib/adminNav'
import {navIconMap} from './iconMap'

export function AdminSidebar({needsReplyCount, orgName}: {needsReplyCount: number; orgName: string}) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar-bg">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
          SG
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">Shass Console</div>
          <div className="text-xs text-muted">Corporate gifts · Dubai</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminNav.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = navIconMap[item.href]
                const active = pathname === item.href || pathname?.startsWith(item.href + '/')
                const badge = item.badgeKey === 'needsReply' ? needsReplyCount : undefined
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                        active
                          ? 'bg-primary-soft font-medium text-primary-dark'
                          : 'text-foreground/80 hover:bg-black/[0.03]'
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        {Icon && <Icon size={16} strokeWidth={2} className={active ? 'text-primary-dark' : 'text-muted'} />}
                        {item.label}
                      </span>
                      {!!badge && (
                        <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-dark">
          DE
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{orgName}</div>
          <div className="text-xs text-muted">Super Admin</div>
        </div>
      </div>
    </aside>
  )
}
