import Link from 'next/link'
import Logo from '@/features/header/logo'
import { ArrowRight, Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#DFE3DC] bg-white text-[#171A18]">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <Logo />
            <p className="max-w-sm text-[13px] leading-relaxed text-[#6C716A]">
              CRM без коду — модулі, автоматизація й AI-асистент, зібрані під
              потреби вашого бізнесу.
            </p>

            <div className="pt-2">
              <p className="text-[12px] font-medium text-[#171A18]">
                Підпишіться на оновлення продукту
              </p>
              <form className="mt-2 flex max-w-sm items-center gap-2">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="w-full rounded-md border border-[#DFE3DC] bg-[#FAFBF9] px-3 py-2 text-[13px] text-[#171A18] placeholder-[#8B9088] outline-none transition-colors focus:border-[#24493B]"
                />
                <button
                  type="submit"
                  className="flex h-9 shrink-0 items-center justify-center rounded-md bg-[#24493B] px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-[#1C392E]"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <FooterColumn
              title="Продукт"
              links={[
                { label: 'Можливості', href: '/features' },
                { label: 'Тарифи', href: '/pricing' },
                { label: 'Інтеграції', href: '/integrations' },
                { label: 'Оновлення', href: '/changelog' },
                { label: 'Roadmap', href: '/roadmap' },
              ]}
            />
            <FooterColumn
              title="Рішення"
              links={[
                { label: 'Для продажів', href: '/solutions/sales' },
                { label: 'Для маркетингу', href: '/solutions/marketing' },
                { label: 'Для стартапів', href: '/solutions/startups' },
                { label: 'Для агентств', href: '/solutions/agencies' },
              ]}
            />
            <FooterColumn
              title="Ресурси"
              links={[
                { label: 'Документація', href: '/docs' },
                { label: 'API Reference', href: '/docs/api' },
                { label: 'Блог', href: '/blog' },
                { label: 'Статус системи', href: 'https://status.boostflow.com', external: true },
                { label: 'Спільнота', href: '/community' },
              ]}
            />
            <FooterColumn
              title="Компанія"
              links={[
                { label: 'Про нас', href: '/about' },
                { label: 'Кар\'єра', href: '/careers' },
                { label: 'Контакти', href: '/contact' },
                { label: 'Партнери', href: '/partners' },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#EEF0EB] pt-8 text-[12px] text-[#8B9088] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <p>© {new Date().getFullYear()} BoostFlow. Усі права захищені.</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] text-[#6C716A]">Всі системи працюють</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex gap-4">
              <Link href="/terms" className="transition-colors hover:text-[#171A18]">
                Умови використання
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-[#171A18]">
                Конфіденційність
              </Link>
              <Link href="/security" className="transition-colors hover:text-[#171A18]">
                Безпека
              </Link>
            </div>

            <div className="flex items-center gap-3 border-[#DFE3DC] text-[#6C716A] sm:border-l sm:pl-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#171A18]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.06c-3.1.67-3.75-1.32-3.75-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.62 5.23-5.11 5.51.4.35.75 1.03.75 2.08V22c0 .29.2.63.77.52A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#171A18]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.4l7.3-8.4L1.8 2h6.4l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#171A18]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.78C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.78 24h20.44c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
                </svg>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#171A18]"
              >
                <Send size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wide text-[#8B9088]">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[#3D423B] transition-colors hover:text-[#171A18]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[13px] text-[#3D423B] transition-colors hover:text-[#171A18]"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}