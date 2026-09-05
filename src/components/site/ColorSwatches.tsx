import {resolveSwatch} from '@/lib/colors'

export function ColorSwatches({colors, max = 6}: {colors: string[]; max?: number}) {
  if (!colors || colors.length === 0) return null
  const shown = colors.slice(0, max)
  const extra = colors.length - shown.length

  return (
    <div className="flex items-center gap-1.5">
      {shown.map((name) => {
        const swatch = resolveSwatch(name)
        // No mapping for this name — show the name, never a grey dot that
        // would stand in for a colour it might not be.
        if (!swatch.background) {
          return (
            <span key={name} className="text-[10px] text-neutral-500">
              {swatch.label}
            </span>
          )
        }
        return (
          <span
            key={name}
            title={swatch.label}
            className={`h-3 w-3 rounded-full ${swatch.needsEdge ? 'ring-1 ring-neutral-300' : ''}`}
            style={{background: swatch.background}}
          />
        )
      })}
      {extra > 0 && <span className="text-[10px] text-neutral-400">+{extra}</span>}
    </div>
  )
}
