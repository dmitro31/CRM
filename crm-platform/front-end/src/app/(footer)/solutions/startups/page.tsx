import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Rocket, ShieldCheck, Zap } from 'lucide-react'

export default function StartupsSolutionPage() {
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
            BoostFlow для стартапів
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Запускайте CRM за лічені хвилини та адаптуйте процеси на льоту під час масштабування.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Rocket className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Швидкий старт</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Ніяких місяців налаштування — готова робоча система в день реєстрації.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <Zap className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Гнучкість Pivot</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Змінюйте структуру даних та модулі без переписування коду чи міграцій БД.
            </p>
          </div>
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <ShieldCheck className="text-[#24493B]" size={20} />
            <h3 className="mt-4 text-[15px] font-medium">Економія ресурсів</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Забудьте про витрати на власну backend-розробку CRM для внутрішніх потреб.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}