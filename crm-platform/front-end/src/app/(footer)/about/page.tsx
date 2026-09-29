import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, CheckCircle2, Cpu, ShieldCheck, Zap } from 'lucide-react'

export default function AboutPage() {
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

        <section className="mb-12">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#24493B]">
            Про платформу
          </span>
          <h1 className="mt-2 text-[32px] font-medium leading-tight tracking-tight sm:text-[40px]">
            Ми будуємо CRM, яка адаптується під ваш бізнес, а не навпаки
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-[#6C716A]">
            BoostFlow створена для команд, яким затісні класичні CRM з жорсткими
            полями, і занадто складні громіздкі корпоративні системи.
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          <div className="rounded-lg border border-[#DFE3DC] bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Zap size={18} />
            </div>
            <h3 className="mt-4 text-[15px] font-medium">Без коду</h3>
            <p className="mt-1 text-[13px] text-[#6C716A]">
              Створюйте нові сутності, поля та зв’язки за кілька кліків без залучення розробників.
            </p>
          </div>

          <div className="rounded-lg border border-[#DFE3DC] bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Cpu size={18} />
            </div>
            <h3 className="mt-4 text-[15px] font-medium">AI в основі</h3>
            <p className="mt-1 text-[13px] text-[#6C716A]">
              Вбудований AI-асистент працює строго з вашими даними без ризику галюцинацій та витоків.
            </p>
          </div>

          <div className="rounded-lg border border-[#DFE3DC] bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <ShieldCheck size={18} />
            </div>
            <h3 className="mt-4 text-[15px] font-medium">Ізоляція даних</h3>
            <p className="mt-1 text-[13px] text-[#6C716A]">
              Багатотенантна архітектура гарантує повну безпеку та приватність робочих просторів.
            </p>
          </div>
        </div>

        <section className="space-y-6 rounded-xl border border-[#DFE3DC] bg-white p-8 text-[14px] leading-relaxed text-[#3D423B]">
          <h2 className="text-[20px] font-medium text-[#171A18]">
            Архітектура та технологічний стек
          </h2>
          <p>
            Платформа побудована за принципами Modular Monolith з фокусом на високу
            продуктивність, масштабованість та відмовостійкість.
          </p>

          <ul className="space-y-3 pt-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#24493B]" />
              <span>
                <strong>Backend:</strong> NestJS (Node.js), TypeScript, PostgreSQL, Prisma ORM, Redis для кЕшування та черг задач.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#24493B]" />
              <span>
                <strong>Frontend:</strong> Next.js (App Router), React, Tailwind CSS, TanStack Query.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#24493B]" />
              <span>
                <strong>Сховище файлів:</strong> S3-сумісне сховище із захищеними тимчасовими посиланнями (Signed URLs).
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}