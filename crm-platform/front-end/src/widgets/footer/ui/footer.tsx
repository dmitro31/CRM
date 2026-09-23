import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/about', label: 'Про нас' },
  { href: '/contact', label: 'Контакти' },
  { href: '/privacy', label: 'Політика конфіденційності' },
  { href: '/terms', label: 'Умови використання' },
]

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-950 text-xs font-bold text-white">
            C
          </div>
          <span className="text-sm font-semibold text-gray-950">CRM Platform</span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
          {FOOTER_LINKS.map(link => (
            <Link key={link.href} href={link.href} prefetch={false} className="transition hover:text-gray-950">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-gray-400">© 2026 CRM Platform</p>
      </div>
    </footer>
  )
}