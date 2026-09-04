import clsx from 'clsx'

const styles: Record<string, string> = {
  new: 'bg-primary-soft text-primary-dark',
  contacted: 'bg-warning/10 text-warning',
  quoted: 'bg-warning/10 text-warning',
  negotiation: 'bg-warning/10 text-warning',
  won: 'bg-success-soft text-success',
  lost: 'bg-danger-soft text-danger',
  new_form: 'bg-primary-soft text-primary-dark',
  reviewed: 'bg-success-soft text-success',
  archived: 'bg-black/5 text-muted',
  subscribed: 'bg-success-soft text-success',
  unsubscribed: 'bg-black/5 text-muted',
  live: 'bg-success-soft text-success',
  draft: 'bg-black/5 text-muted',
}

export function StatusBadge({status}: {status: string}) {
  return (
    <span
      className={clsx(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        styles[status] || 'bg-black/5 text-muted'
      )}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
