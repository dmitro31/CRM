import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, MessageCircle, Send, Users } from 'lucide-react'

export default function CommunityPage() {
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
            Спільнота
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Приєднуйтесь до BoostFlow Community
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Діліться шаблонами модулів, запитуйте поради та спілкуйтеся з іншими користувачами.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-xl border border-[#DFE3DC] bg-white p-6 transition-colors hover:border-[#24493B]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-medium">Telegram Чат</h3>
              <p className="mt-1 text-[12.5px] text-[#6C716A]">
                Живе обговорення функцій та швидка допомога від ком'юніті.
              </p>
            </div>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-xl border border-[#DFE3DC] bg-white p-6 transition-colors hover:border-[#24493B]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-medium">GitHub Discussions</h3>
              <p className="mt-1 text-[12.5px] text-[#6C716A]">
                Пропозиції нових фіч та фідбек розробникам.
              </p>
            </div>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}