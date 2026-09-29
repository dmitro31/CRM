import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Eye, FileCheck, Lock, Shield } from 'lucide-react'

export default function SecurityPage() {
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
            Захист даних
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Безпека та конфіденційність
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Захист вашої інформації є нашим головним пріоритетом.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Lock size={20} />
            </div>
            <h3 className="mt-4 text-[16px] font-medium">Шифрування даних</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Усі дані шифруються за допомогою TLS 1.3 під час передачі та AES-256 у стані спокою.
            </p>
          </div>

          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Shield size={20} />
            </div>
            <h3 className="mt-4 text-[16px] font-medium">Резервне копіювання</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Автоматичне щоденне створення резервних копій із можливістю швидкого відновлення.
            </p>
          </div>

          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Eye size={20} />
            </div>
            <h3 className="mt-4 text-[16px] font-medium">Контроль доступу</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Гнучке налаштування ролей (RBAC) та двохфакторна аутентифікація для акаунтів.
            </p>
          </div>

          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <FileCheck size={20} />
            </div>
            <h3 className="mt-4 text-[16px] font-medium">Моніторинг та аудит</h3>
            <p className="mt-2 text-[13px] text-[#6C716A]">
              Аудит дій у реальному часі та моніторинг підозрілої активності.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}