import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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

        <h1 className="mb-6 text-[32px] font-medium tracking-tight">
          Умови використання
        </h1>

        <div className="space-y-6 rounded-xl border border-[#DFE3DC] bg-white p-8 text-[14px] leading-7 text-[#3D423B]">
          <section>
            <h2 className="text-[16px] font-medium text-[#171A18]">1. Загальні положення</h2>
            <p className="mt-2">
              Використовуючи BoostFlow, ви погоджуєтеся дотримуватися цих Умов. Якщо ви не погоджуєтеся з умовами,
              будь ласка, утримайтеся від використання платформи.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[#171A18]">2. Правила використання</h2>
            <p className="mt-2">
              Заборонено використовувати сервіс для поширення шкідливого ПЗ, спаму, несанкціонованого доступу
              чи будь-якої діяльності, що порушує чинне законодавство.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[#171A18]">3. Припинення доступу</h2>
            <p className="mt-2">
              Ми залишаємо за собою право тимчасово або остаточно блокувати доступ до акаунта у разі
              виявлення систематичних порушень правил використання.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}