import Link from 'next/link'
import { Footer } from '@/widgets/footer'

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link href="/" className="mb-8 inline-block text-sm text-gray-500 hover:text-gray-950">
          ← На головну
        </Link>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-950">Контакти</h1>
        <div className="space-y-3 text-sm leading-7 text-gray-600">
          <p>Маєш питання чи пропозицію? Напиши нам:</p>
          <p>
            Email:{' '}
            <a href="mailto:support@crm-platform.example" className="text-blue-600 hover:underline">
              support@crm-platform.example
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}