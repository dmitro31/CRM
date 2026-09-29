import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Tag } from 'lucide-react'

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F4] text-[#171A18]">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#6C716A] transition-colors hover:text-[#171A18]"
        >
          <ArrowLeft size={14} />
          На головну
        </Link>

        <div className="mb-12">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#24493B]">
            Історія оновлень
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Changelog
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Останні покращення, нові функції та виправлення в BoostFlow.
          </p>
        </div>

        <div className="space-y-8 border-l border-[#DFE3DC] pl-6 sm:pl-8">
          <ChangelogItem
            version="v1.2.0"
            date="24 Вересня, 2026"
            title="Оновлений AI-асистент та підтримка файлів у модулях"
            changes={[
              'Додано можливість завантажувати файли та зображення безпосередньо у записи модулів.',
              'AI-асистент отримав можливість аналізувати привʼязані файли.',
              'Оптимізовано швидкість завантаження списків записів.',
            ]}
          />

          <ChangelogItem
            version="v1.1.0"
            date="10 Серпня, 2026"
            title="Візуальний конструктор автоматизацій"
            changes={[
              'Запущено реліз конструктора Workflow: тригери на створення та оновлення записів.',
              'Додано надсилання сповіщень у Telegram при спрацюванні умов.',
            ]}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

function ChangelogItem({
  version,
  date,
  title,
  changes,
}: {
  version: string
  date: string
  title: string
  changes: string[]
}) {
  return (
    <div className="relative">
      <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#24493B]" />
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B9088]">
        <span className="inline-flex items-center gap-1 rounded bg-[#E7EEE9] px-2 py-0.5 font-medium text-[#24493B]">
          <Tag size={10} />
          {version}
        </span>
        <span>•</span>
        <span>{date}</span>
      </div>
      <h3 className="mt-2 text-[17px] font-medium text-[#171A18]">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-[13.5px] leading-relaxed text-[#6C716A]">
        {changes.map((item, idx) => (
          <li key={idx}>— {item}</li>
        ))}
      </ul>
    </div>
  )
}