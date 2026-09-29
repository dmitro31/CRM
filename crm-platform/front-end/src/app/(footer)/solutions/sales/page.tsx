import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, BarChart3, Target, Users } from 'lucide-react'

export default function SalesSolutionPage() {
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
            BoostFlow для відділу продажів
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Закривайте угоди швидше завдяки налаштовуваним воронкам та автоматичним нагадуванням.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Target className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Гнучкі воронки</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Створюйте будь-які етапи продажів під специфіку ваших товарів або послуг.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <BarChart3 className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Контроль процесів</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Відстежуйте історію взаємодії з клієнтом та ключові суми угод.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Users className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Командна робота</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Передавайте лідів між менеджерами та залишайте внутрішні коментарі.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}