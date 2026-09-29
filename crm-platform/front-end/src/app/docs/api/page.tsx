import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Code2, Database, Key, Terminal } from 'lucide-react'

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F4] text-[#171A18]">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Link
          href="/docs"
          className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#6C716A] transition-colors hover:text-[#171A18]"
        >
          <ArrowLeft size={14} />
          Назад до документації
        </Link>

        <div className="mb-10">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#24493B]">
            Розробникам
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            API Reference
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            REST API дозволяє програмно керувати записами, модулями та файлами.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <div className="flex items-center gap-2 font-mono text-[13px] text-[#24493B]">
              <Key size={16} />
              <span>Аутентифікація</span>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#6C716A]">
              Усі API-запити повинні містити заголовок <code className="rounded bg-[#FAFBF9] px-1.5 py-0.5 border border-[#DFE3DC] font-mono text-[12px]">Authorization: Bearer YOUR_API_KEY</code>. Створити ключ можна в налаштуваннях workspace.
            </p>
          </div>

          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <div className="flex items-center gap-2 font-mono text-[13px] text-[#24493B]">
              <Terminal size={16} />
              <span>Базовий URL</span>
            </div>
            <div className="mt-3 rounded-md bg-[#FAFBF9] border border-[#DFE3DC] p-3 font-mono text-[12px] text-[#171A18]">
              https://api.boostflow.com/v1
            </div>
          </div>

          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <h3 className="text-[16px] font-medium">Основні Ендпоінти</h3>
            <div className="mt-4 space-y-3 font-mono text-[12.5px]">
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">GET</span>
                <span>/modules — Отримати список усіх модулів</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">GET</span>
                <span>/modules/:id/records — Отримати записи модуля</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">POST</span>
                <span>/modules/:id/records — Створити новий запис</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}