import Link from 'next/link'
import Logo from '@/features/header/logo'

export default function Footer() {
  return (
    <footer className="border-t border-[#DFE3DC] bg-white">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-[13px] leading-relaxed text-[#6C716A]">
              CRM без коду — модулі, автоматизація й AI-асистент, зібрані під
              твій бізнес.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterColumn
              title="Продукт"
              links={[
                { label: 'Можливості', href: '#features' },
                { label: 'Увійти', href: '/login' },
                { label: 'Реєстрація', href: '/register' },
              ]}
            />
            <FooterColumn
              title="Ресурси"
              links={[
                { label: 'Документація', href: '#' },
                { label: 'Підтримка', href: '#' },
              ]}
            />
            <FooterColumn
              title="Компанія"
              links={[
                { label: 'Про нас', href: '#' },
                { label: 'Контакти', href: '#' },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#EEF0EB] pt-6 text-[12px] text-[#8B9088] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BoostFlow. Усі права захищені.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-[#3D423B]">Умови використання</Link>
            <Link href="#" className="hover:text-[#3D423B]">Конфіденційність</Link>
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
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wide text-[#8B9088]">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link.label}>
            <Link href={link.href} className="text-[13px] text-[#3D423B] hover:text-[#171A18]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}