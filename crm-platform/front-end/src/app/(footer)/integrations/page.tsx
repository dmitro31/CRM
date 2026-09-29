import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Globe, Puzzle, Webhook, Zap } from 'lucide-react'

const INTEGRATIONS = [
  {
    name: 'Webhooks & REST API',
    category: 'Розробка',
    description: 'Отримуйте та надсилайте дані через вебхуки в реальному часі.',
  },
  {
    name: 'Telegram Bot',
    category: 'Комунікація',
    description: 'Сповіщення про нові записи та зміну статусів прямо в месенджер.',
  },
  {
    name: 'S3 Storage',
    category: 'Сховище',
    description: 'Зберігання файлів та зображень із захищеними тимчасовими посиланнями.',
  },
  {
    name: 'Make / Zapier',
    category: 'Автоматизація',
    description: 'Зʼєднуйте BoostFlow із 5000+ іншими сервісами без написання коду.',
  },
]

export default function IntegrationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F4] text-[#171A18]">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#6C716A] transition-colors hover:text-[#171A18]"
        >
          <ArrowLeft size={14} />
          На головну
        </Link>

        <div className="mb-10">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#24493B]">
            Екосистема
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Інтеграції
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Підключайте свої улюблені інструменти та автоматизуйте обмін даними.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-[#DFE3DC] bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <Puzzle size={18} />
                </div>
                <span className="font-mono text-[10px] uppercase text-[#8B9088]">
                  {item.category}
                </span>
              </div>
              <h3 className="mt-4 text-[16px] font-medium">{item.name}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#6C716A]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}