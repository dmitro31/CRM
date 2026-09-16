import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link href="/" className="mb-8 inline-block text-sm text-gray-500 hover:text-gray-950">
          ← На головну
        </Link>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-950">
          Умови використання
        </h1>
        <div className="space-y-4 text-sm leading-7 text-gray-600">
          <p>
            Використовуючи CRM Platform, ти погоджуєшся не завантажувати
            заборонений законом контент і не використовувати сервіс для
            шкідливої чи шахрайської діяльності.
          </p>
          <p>
            Ми залишаємо за собою право призупинити акаунт у разі порушення
            цих умов.
          </p>
        </div>
      </div>
    </div>
  )
}