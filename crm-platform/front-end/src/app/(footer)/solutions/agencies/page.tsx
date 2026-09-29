import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Briefcase, Layers, Users } from 'lucide-react'

export default function AgenciesSolutionPage() {
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
            BoostFlow для агентств
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Управляйте проєктами, клієнтами та командами в єдиному середовищі.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Briefcase className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Клієнтські бази</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Зберігайте повну історію проєктів, угод та домовленостей по кожному клієнту.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Layers className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Кастомні модулі</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Створюйте окремі модулі під завдання, послуги та рахунки.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Users className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Розмежування прав</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Налаштовуйте рівні доступу для проектних менеджерів та виконавців.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}