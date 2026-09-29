import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Filter, Megaphone, TrendingUp } from 'lucide-react'

export default function MarketingSolutionPage() {
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
            Рішення
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            BoostFlow для маркетингу
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Збирайте заявки з усіх каналів та сегментуйте базу без залучення програмістів.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Megaphone className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Збір лідів</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Автоматично отримуйте заявки з сайтів, вебхуків та реєстраційних форм.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Filter className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Сегментація</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Фільтруйте клієнтську базу за будь-якими параметрами та кастомними полями.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <TrendingUp className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Аналіз джерел</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Аналізуйте, які канали маркетингу приносять найбільш якісні ліди.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}