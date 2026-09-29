import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Handshake, Percent, ShieldCheck } from 'lucide-react'

export default function PartnersPage() {
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
            Співпраця
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Партнерська програма
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Заробляйте разом з BoostFlow, впроваджуючи систему для ваших клієнтів.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Percent className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Реферальні комісії</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Отримуйте % від кожної оплати залученого клієнта на постійній основі.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Handshake className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Для інтеграторів</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Налаштовуйте модулі під ключ для своїх замовників та отримуйте повний дохід за послуги.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <ShieldCheck className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Пріоритетна підтримка</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Персональний менеджер та виділений канал зв'язку з нашою командою.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#DFE3DC] bg-white p-8 text-center">
          <h2 className="text-[18px] font-medium">Бажаєте стати партнером?</h2>
          <p className="mt-1 text-[13px] text-[#6C716A]">
            Зв'яжіться з нами для обговорення умов партнерства.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-md bg-[#24493B] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1C392E]"
          >
            Написати нам
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}