import Link from 'next/link'
import { Footer } from '@/widgets/footer'

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link href="/" className="mb-8 inline-block text-sm text-gray-500 hover:text-gray-950">
          ← На головну
        </Link>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-950">
          Політика конфіденційності
        </h1>
        <div className="space-y-4 text-sm leading-7 text-gray-600">
          <p>
            Ми збираємо лише дані, необхідні для роботи сервісу: email, ім'я,
            дані про використання workspace. Дані не передаються третім
            особам, окрім випадків, передбачених законом.
          </p>
          <p>
            Ти можеш у будь-який момент запросити видалення свого акаунта та
            всіх пов'язаних даних, звернувшись через сторінку контактів.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}