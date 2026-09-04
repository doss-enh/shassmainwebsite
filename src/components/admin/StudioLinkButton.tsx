export function StudioLinkButton({href, label = 'New'}: {href: string; label?: string}) {
  return (
    <a
      href={href}
      className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
    >
      {label}
    </a>
  )
}
