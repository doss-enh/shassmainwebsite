import Link from 'next/link'

export function Breadcrumb({trail}: {trail: {label: string; href?: string}[]}) {
  return (
    <div className="border-b border-neutral-100 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-3 text-[13px] text-neutral-500">
        <Link href="/" className="text-primary hover:underline">
          Home
        </Link>
        {trail.map((item) => (
          <span key={item.label}>
            {' / '}
            {item.href ? (
              <Link href={item.href} className="text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
