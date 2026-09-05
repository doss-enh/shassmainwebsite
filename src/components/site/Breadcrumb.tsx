import Link from 'next/link'

/**
 * 14px, no background bar, #0099cc links and a #212529 current item —
 * measured off the live page, which renders the crumbs straight onto the
 * page rather than in a tinted strip.
 */
export function Breadcrumb({trail}: {trail: {label: string; href?: string}[]}) {
  return (
    <nav aria-label="Breadcrumb" className="site-container py-4 text-sm text-[#212529]">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        <li>
          <Link href="/" className="text-[#0099cc] hover:underline">
            Home
          </Link>
        </li>
        {trail.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-x-1.5">
            <span aria-hidden="true" className="text-neutral-400">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="text-[#0099cc] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
