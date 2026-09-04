import clsx from 'clsx'

export function StatCard({
  label,
  value,
  sublabel,
  change,
  accent = false,
}: {
  label: string
  value: React.ReactNode
  sublabel?: string
  change?: {value: number; direction: 'up' | 'down'}
  accent?: boolean
}) {
  return (
    <div className={clsx('rounded-xl border border-t-2 border-border bg-card p-4', accent ? 'border-t-danger' : 'border-t-primary')}>
      <div className="flex items-start justify-between">
        <div className={clsx('text-2xl font-semibold', accent ? 'text-danger' : 'text-foreground')}>{value}</div>
        {change && (
          <span
            className={clsx(
              'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold',
              change.direction === 'up' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
            )}
          >
            {change.direction === 'up' ? '▲' : '▼'}
            {change.value}%
          </span>
        )}
      </div>
      <div className={clsx('mt-1 text-sm font-medium', accent ? 'text-danger' : 'text-foreground')}>{label}</div>
      {sublabel && <div className="text-xs text-muted">{sublabel}</div>}
    </div>
  )
}
