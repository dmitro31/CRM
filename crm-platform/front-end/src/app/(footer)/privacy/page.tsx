import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          Політика конфіденційності
        </h1>

        <div className="space-y-6 rounded-xl border border-[#DFE3DC] bg-white p-8 text-[14px] leading-7 text-[#3D423B]">
          <section>
            <h2 className="text-[16px] font-medium text-[#171A18]">1. Збір інформації</h2>
            <p className="mt-2">
              Ми збираємо лише дані, необхідні для функціонування сервісу: ваш email,
              ім'я, назву workspace та дані, які ви безпосередньо вносити у створені модулі.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[#171A18]">2. Використання даних</h2>
            <p className="mt-2">
              Дані використовуються виключно для надання послуг сервісу, автентифікації користувачів
              та роботи AI-асистента у межах вашого робочого простору. Ми не продаємо ваші дані третім особам.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[#171A18]">3. Видалення облікового запису</h2>
            <p className="mt-2">
              Ви можете в будь-який момент надіслати запит на повне видалення вашого акаунта та всіх
              пов'язаних робочих просторів, звернувшись у службу підтримки.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}