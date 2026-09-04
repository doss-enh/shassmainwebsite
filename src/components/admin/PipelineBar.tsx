export function PipelineBar({label, value, max}: {label: string; value: number; max: number}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full rounded-full bg-primary" style={{width: `${pct}%`}} />
      </div>
    </div>
  )
}
