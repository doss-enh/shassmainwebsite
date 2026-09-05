const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shassgift.com'

const ICONS: Record<string, string> = {
  Facebook: 'M14 9h3V6h-3c-2 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z',
  Twitter: 'M4 4l7 8.5L4.5 20H7l5-5.5L16 20h4l-7.3-8.9L19.5 4H17l-4.6 5L8.5 4H4z',
  Pinterest: 'M12 2a10 10 0 0 0-3.7 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3-2.3 3-5 0-2-1.4-3.6-3.9-3.6-2.9 0-4.6 2.1-4.6 4.4 0 .8.2 1.4.6 1.9.2.2.2.3.1.5l-.2.8c0 .3-.2.4-.5.2-1.3-.5-1.9-2-1.9-3.6 0-2.7 2.3-6 6.8-6 3.6 0 6 2.6 6 5.4 0 3.7-2 6.4-5 6.4-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.8-.7 1.8-1.1 2.4A10 10 0 1 0 12 2z',
  Linkedin: 'M6.9 8H4v12h2.9V8zM5.4 3.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20 13.4c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3.1 1.7V8H10v12h2.9v-6.7c0-1.4.9-2.1 1.8-2.1s1.5.6 1.5 2V20H20v-6.6z',
}

/**
 * Share row from the live product page. Server-rendered — these are plain
 * links to each network's share endpoint, so no client JS is needed.
 */
export function ShareLinks({path, title}: {path: string; title: string}) {
  const url = encodeURIComponent(`${SITE}${path}`)
  const text = encodeURIComponent(title)

  const links = [
    {label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}`},
    {label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`},
    {label: 'Pinterest', href: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`},
    {label: 'Linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`},
  ]

  return (
    <ul className="mt-7 flex flex-wrap items-center gap-5">
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={ICONS[l.label]} />
            </svg>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
