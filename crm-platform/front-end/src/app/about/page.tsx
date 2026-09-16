import Link from 'next/link'


export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link href="/" className="mb-8 inline-block text-sm text-gray-500 hover:text-gray-950">
          ← На головну
        </Link>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-950">Про нас</h1>
        <div className="space-y-4 text-sm leading-7 text-gray-600">
          <p>
            CRM Platform — це SaaS-платформа, яка дозволяє компаніям створювати
            власну CRM без написання коду: гнучкі модулі, поля, автоматизація
            та AI-асистент в одному робочому просторі.
          </p>
          <p>
            Проєкт побудований на NestJS та Next.js за принципом Modular
            Monolith, з фокусом на прозору архітектуру та багатотенантну
            ізоляцію даних.
          </p>
        </div>
      </div>
    </div>
  )
}