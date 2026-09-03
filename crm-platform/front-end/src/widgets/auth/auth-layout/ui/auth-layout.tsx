import Link from 'next/link'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="relative hidden overflow-hidden bg-gray-950 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
                C
              </div>

              <span className="text-lg font-bold tracking-tight">
                CRM Platform
              </span>
            </Link>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Простір для вашого бізнесу
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Керуйте бізнесом.
              <br />
              Не хаосом.
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-400">
              Організовуйте клієнтів, записи, файли, процеси та команди
              в одному робочому просторі.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                'Гнучкі модулі',
                'Автоматизація',
                'Командна робота',
                'AI Assistant',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-300"
                >
                  <div className="mb-2 h-2 w-2 rounded-full bg-blue-500" />

                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-gray-600">
            © 2026 CRM Platform
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full">
            <div className="mx-auto mb-8 w-full max-w-md lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-lg font-bold text-white">
                  C
                </div>

                <span className="font-bold text-gray-950">
                  CRM Platform
                </span>
              </Link>
            </div>

            <div className="flex justify-center">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}