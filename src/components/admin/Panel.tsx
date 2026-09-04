import Link from 'next/link'

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: {label: string; href: string}
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
        {action && (
          <Link href={action.href} className="text-xs font-medium text-primary hover:underline">
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
