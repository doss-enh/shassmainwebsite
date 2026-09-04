export function TextField({label, name, defaultValue, placeholder}: {label: string; name: string; defaultValue?: string; placeholder?: string}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
      />
    </label>
  )
}

export function NumberField({label, name, defaultValue}: {label: string; name: string; defaultValue?: number}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
      />
    </label>
  )
}

export function TextAreaField({label, name, defaultValue}: {label: string; name: string; defaultValue?: string}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
      />
    </label>
  )
}

export function ToggleField({label, name, defaultChecked, hint}: {label: string; name: string; defaultChecked?: boolean; hint?: string}) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-primary" />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  )
}

export function SaveButton() {
  return (
    <button
      type="submit"
      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
    >
      Save changes
    </button>
  )
}
