'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AxiosError } from 'axios'

import { useAuth } from '@/providers/auth-provider'
import { getInvitationPreview, acceptInvitation, type InvitationPreview } from '@/lib/invitation'
import { Button } from '@/shared/UI/Button'
import Logo from '@/features/header/logo'

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [preview, setPreview] = useState<InvitationPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPreview() {
      try {
        const data = await getInvitationPreview(token)
        setPreview(data)
      } catch (err) {
        const message =
          err instanceof AxiosError
            ? (err.response?.data as { message?: string })?.message
            : undefined
        setError(message ?? 'Запрошення недійсне або його термін дії закінчився.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPreview()
  }, [token])

  const handleAccept = async () => {
    setIsAccepting(true)
    setAcceptError(null)

    try {
      const workspace = await acceptInvitation(token)
      router.push(`/workspaces/${workspace.id}`)
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setAcceptError(message ?? 'Не вдалося прийняти запрошення. Спробуйте ще раз.')
    } finally {
      setIsAccepting(false)
    }
  }

  const isEmailMismatch =
    user && preview && user.email.toLowerCase() !== preview.email.toLowerCase()

  return (
    <main className="min-h-screen bg-[#F6F7F4]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">
        <section className="relative hidden overflow-hidden bg-[#14201B] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#24493B]/40 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[#C1611F]/10 blur-3xl" />

          <Link href="/" className="relative flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M3 15L8 9L12.5 13L19 5" stroke="#E7EEE9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="5" r="2.2" fill="#E7EEE9" />
            </svg>
            <span className="text-[17px] font-medium text-white">BoostFlow</span>
          </Link>

          <div className="relative max-w-lg">
            <h2 className="text-[38px] font-medium leading-[1.15] tracking-tight text-white">
              Приєднуйтесь
              <br />
              до робочого простору.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#B7BFB9]">
              Вас запросили приєднатися до команди в CRM BoostFlow.
            </p>
          </div>

          <p className="relative text-[11px] text-[#6C716A]">© {new Date().getFullYear()} BoostFlow</p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            {isLoading || isAuthLoading ? (
              <div className="text-center text-sm text-[#6C716A]">Завантаження запрошення...</div>
            ) : error ? (
              <div className="space-y-4">
                <h1 className="text-[24px] font-medium tracking-tight text-[#171A18]">
                  Запрошення недоступне
                </h1>
                <div className="rounded-md border border-[#F3C6C1] bg-[#FBEDEC] px-3.5 py-3 text-[13px] text-[#B3261E]">
                  {error}
                </div>
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-[#DFE3DC] bg-white text-[13.5px] font-medium text-[#171A18] transition-colors hover:bg-[#F0F2ED]"
                >
                  Перейти до входу
                </Link>
              </div>
            ) : (
              preview && (
                <div>
                  <h1 className="text-[26px] font-medium tracking-tight text-[#171A18]">
                    Запрошення в команду
                  </h1>
                  <p className="mt-1.5 text-[13.5px] text-[#6C716A]">
                    Користувач <span className="font-medium text-[#171A18]">{preview.invitedByEmail}</span> запрошує вас приєднатися.
                  </p>

                  <div className="mt-6 rounded-xl border border-[#DFE3DC] bg-white p-4 space-y-3">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#8B9088]">
                        Робочий простір
                      </span>
                      <p className="text-[15px] font-medium text-[#171A18]">{preview.workspaceName}</p>
                    </div>

                    <div className="h-px bg-[#DFE3DC]" />

                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#8B9088]">
                        Роль
                      </span>
                      <p className="text-[14px] font-medium text-[#24493B]">{preview.roleName}</p>
                    </div>

                    <div className="h-px bg-[#DFE3DC]" />

                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#8B9088]">
                        Отримувач
                      </span>
                      <p className="text-[13.5px] text-[#171A18]">{preview.email}</p>
                    </div>
                  </div>

                  {acceptError && (
                    <div className="mt-4 rounded-md border border-[#F3C6C1] bg-[#FBEDEC] px-3.5 py-2.5 text-[13px] text-[#B3261E]">
                      {acceptError}
                    </div>
                  )}

                  {!user ? (
                    <div className="mt-6 space-y-3">
                      <p className="text-center text-[13px] text-[#6C716A]">
                        Щоб прийняти запрошення, увійдіть в акаунт або зареєструйтесь.
                      </p>
                      <Link
                        href={`/login?redirect=/invitations/${token}`}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-[#24493B] text-[13.5px] font-medium text-white transition-colors hover:bg-[#1D3B30]"
                      >
                        Увійти
                      </Link>
                      <Link
                        href={`/register?redirect=/invitations/${token}`}
                        className="flex h-11 w-full items-center justify-center rounded-lg border border-[#DFE3DC] bg-white text-[13.5px] font-medium text-[#171A18] transition-colors hover:bg-[#F0F2ED]"
                      >
                        Створити акаунт
                      </Link>
                    </div>
                  ) : isEmailMismatch ? (
                    <div className="mt-6 space-y-3">
                      <div className="rounded-md border border-[#F3C6C1] bg-[#FBEDEC] px-3.5 py-2.5 text-[13px] text-[#B3261E]">
                        Ви авторизовані як <span className="font-semibold">{user.email}</span>, але це запрошення призначене для <span className="font-semibold">{preview.email}</span>.
                      </div>
                      <Link
                        href={`/login?redirect=/invitations/${token}`}
                        className="flex h-11 w-full items-center justify-center rounded-lg border border-[#DFE3DC] bg-white text-[13.5px] font-medium text-[#171A18] transition-colors hover:bg-[#F0F2ED]"
                      >
                        Змінити акаунт
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <Button
                        type="button"
                        onClick={handleAccept}
                        loading={isAccepting}
                        loadingText="Прийняття..."
                        className="h-11 w-full"
                      >
                        Прийняти запрошення
                      </Button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  )
}