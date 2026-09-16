'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Layers,
  Workflow,
  Sparkles,
  ShieldCheck,
  Database,
  Users,
  BarChart3,
  Check,
  MessageSquare,
  Zap,
  Settings2,
} from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

export default function LandingPage() {
  const { isAuth } = useAuth()

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-[#171A18]">
      <main>
        <section className="mx-auto max-w-5xl px-8 pb-28 pt-24 text-center lg:pt-32">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D9DFD8] bg-white px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#24493B]" />
            <span className="text-[11px] font-medium text-[#6C716A]">
              CRM нового покоління
            </span>
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-[46px] font-medium leading-[1.04] tracking-tight sm:text-[54px] lg:text-[64px]">
            CRM, яку ти будуєш під свій бізнес,
            <br />
            <span className="text-[#24493B]">
              а не підлаштовуєш бізнес під неї
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[16px] leading-relaxed text-[#6C716A] sm:text-[17px]">
            Створюй власні модулі, поля, зв&apos;язки та автоматизації без
            складного налаштування. BoostFlow підлаштовується під процеси твоєї
            команди, а не навпаки.
          </p>

          {!isAuth && (
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#24493B] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1B392E] sm:w-auto"
              >
                Почати безкоштовно
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-md border border-[#DFE3DC] bg-white px-5 py-3 text-[14px] font-medium text-[#171A18] transition-colors hover:border-[#C7CDC2] sm:w-auto"
              >
                Уже є акаунт
              </Link>
            </div>
          )}

          {isAuth && (
            <div className="mt-9 flex justify-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md bg-[#24493B] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1B392E]"
              >
                Перейти до workspace
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="mx-auto mt-16 max-w-4xl rounded-xl border border-[#DCE1DA] bg-white p-3 shadow-[0_18px_50px_rgba(23,26,24,0.06)]">
            <div className="rounded-lg border border-[#E8EBE6] bg-[#F9FAF8]">
              <div className="flex items-center justify-between border-b border-[#E4E8E2] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#B7C0B8]" />
                  <div className="h-2 w-2 rounded-full bg-[#CBD1CB]" />
                  <div className="h-2 w-2 rounded-full bg-[#DDE1DC]" />
                </div>

                <div className="hidden h-7 w-48 rounded-md border border-[#E0E4DE] bg-white sm:block" />
              </div>

              <div className="grid min-h-[270px] grid-cols-1 lg:grid-cols-[180px_1fr]">
                <div className="hidden border-r border-[#E4E8E2] p-4 lg:block">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md bg-[#E8EEE9] px-3 py-2">
                      <Database size={13} className="text-[#24493B]" />
                      <span className="text-[11px] font-medium text-[#24493B]">
                        Клієнти
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2">
                      <Users size={13} className="text-[#92978F]" />
                      <span className="text-[11px] text-[#7E847C]">
                        Команда
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2">
                      <BarChart3 size={13} className="text-[#92978F]" />
                      <span className="text-[11px] text-[#7E847C]">
                        Аналітика
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-left text-[12px] text-[#8A9088]">
                        Workspace
                      </p>
                      <h3 className="mt-1 text-left text-[17px] font-medium">
                        Клієнти
                      </h3>
                    </div>

                    <button className="flex w-fit items-center gap-2 rounded-md border border-[#DCE1DA] bg-white px-3 py-2 text-[11px] font-medium">
                      <Settings2 size={13} />
                      Налаштувати
                    </button>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-lg border border-[#E4E8E2] bg-white">
                    <div className="grid grid-cols-4 border-b border-[#E4E8E2] bg-[#FAFBF9] px-4 py-3">
                      <span className="text-left text-[10px] font-medium text-[#7B8179]">
                        Клієнт
                      </span>
                      <span className="hidden text-left text-[10px] font-medium text-[#7B8179] sm:block">
                        Статус
                      </span>
                      <span className="hidden text-left text-[10px] font-medium text-[#7B8179] sm:block">
                        Менеджер
                      </span>
                      <span className="text-right text-[10px] font-medium text-[#7B8179]">
                        Оновлено
                      </span>
                    </div>

                    <MockRow
                      name="Олег Коваль"
                      status="Активний"
                      manager="Анна"
                      date="2 хв"
                    />
                    <MockRow
                      name="Марія Бойко"
                      status="Новий"
                      manager="Дмитро"
                      date="15 хв"
                    />
                    <MockRow
                      name="Іван Петренко"
                      status="В роботі"
                      manager="Олексій"
                      date="1 год"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y border-[#DFE3DC] bg-white"
        >
          <div className="mx-auto max-w-6xl px-8 py-20">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] text-[#8B9088]">
                МОЖЛИВОСТІ
              </span>

              <h2 className="mt-3 text-[30px] font-medium tracking-tight">
                Твоя CRM, твоя структура
              </h2>

              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-[#6C716A]">
                Не потрібно змінювати свої процеси через обмеження готової
                системи. Створюй робочий простір так, як він потрібен саме
                твоїй команді.
              </p>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden border border-[#DFE3DC] bg-[#DFE3DC] md:grid-cols-2 lg:grid-cols-3">
              <Feature
                icon={<Layers size={18} />}
                title="Власні модулі"
                description="Створюй клієнтів, замовлення, автомобілі, заявки або будь-які інші сутності."
              />

              <Feature
                icon={<Workflow size={18} />}
                title="Автоматизація"
                description="Поєднуй тригери, умови та дії, щоб процеси виконувалися автоматично."
              />

              <Feature
                icon={<Sparkles size={18} />}
                title="AI-асистент"
                description="Став питання природною мовою та отримуй відповіді на основі даних workspace."
              />

              <Feature
                icon={<Database size={18} />}
                title="Гнучкі поля"
                description="Текст, числа, статуси, дати, зв'язки та інші типи даних під твої задачі."
              />

              <Feature
                icon={<Users size={18} />}
                title="Командна робота"
                description="Запрошуй учасників, розподіляй доступ та працюй над даними разом."
              />

              <Feature
                icon={<BarChart3 size={18} />}
                title="Аналітика"
                description="Перетворюй дані на зрозумілі показники та бач, що відбувається у бізнесі."
              />
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="mx-auto max-w-6xl px-8 py-24"
        >
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="font-mono text-[11px] text-[#8B9088]">
                ЯК ЦЕ ПРАЦЮЄ
              </span>

              <h2 className="mt-3 max-w-md text-[30px] font-medium tracking-tight">
                Від опису до робочого інструменту за хвилини
              </h2>

              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[#6C716A]">
                BoostFlow не змушує тебе вивчати складну CRM. Просто опиши,
                як працює твій бізнес, і побудуй систему навколо своїх
                процесів.
              </p>
            </div>

            <div className="space-y-3">
              <Step
                number="01"
                title="Опиши, що тобі треба"
                description={
                  <>
                    &quot;Облік автомобілів клієнтів автосервісу: марка,
                    модель, номер, статус ремонту&quot; — структура створюється
                    на основі твого опису.
                  </>
                }
                icon={<Layers size={16} />}
              />

              <Step
                number="02"
                title="Додай автоматизацію словами"
                description={
                  <>
                    &quot;Коли статус стає Завершено — надішли клієнту
                    сповіщення&quot;. Логіку можна описувати природною мовою.
                  </>
                }
                icon={<Workflow size={16} />}
              />

              <Step
                number="03"
                title="Підключи команду"
                description="Запроси учасників workspace та розподіли доступ до потрібних даних і процесів."
                icon={<Users size={16} />}
              />

              <Step
                number="04"
                title="Питай AI про свої дані"
                description="Отримуй відповіді на питання щодо реальних записів, а не абстрактні поради."
                icon={<MessageSquare size={16} />}
              />
            </div>
          </div>
        </section>

        <section
          id="use-cases"
          className="border-y border-[#DFE3DC] bg-white"
        >
          <div className="mx-auto max-w-6xl px-8 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-[11px] text-[#8B9088]">
                СЦЕНАРІЇ
              </span>

              <h2 className="mt-3 text-[30px] font-medium tracking-tight">
                Одна платформа — різні бізнеси
              </h2>

              <p className="mt-4 text-[14px] leading-relaxed text-[#6C716A]">
                Ти не отримуєш фіксований набір таблиць. Структура CRM
                змінюється відповідно до твоєї задачі.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <UseCase
                title="Автосервіс"
                items={[
                  'Автомобілі клієнтів',
                  'Статуси ремонту',
                  'Запчастини та заявки',
                ]}
              />

              <UseCase
                title="Агентство"
                items={[
                  'Ліди та клієнти',
                  'Проєкти',
                  'Задачі та дедлайни',
                ]}
              />

              <UseCase
                title="Продажі"
                items={[
                  'Воронка продажів',
                  'Контакти',
                  'Угоди та активності',
                ]}
              />

              <UseCase
                title="Сервісний бізнес"
                items={[
                  'Запити клієнтів',
                  'Виконавці',
                  'Історія обслуговування',
                ]}
              />

              <UseCase
                title="Освітні проєкти"
                items={[
                  'Учні та групи',
                  'Події',
                  'Завдання та прогрес',
                ]}
              />

              <UseCase
                title="Власний процес"
                items={[
                  'Власні модулі',
                  'Власні поля',
                  'Власні автоматизації',
                ]}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-8 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="font-mono text-[11px] text-[#8B9088]">
                AI
              </span>

              <h2 className="mt-3 max-w-lg text-[30px] font-medium tracking-tight">
                Не просто chatbot. AI, який працює з твоїм workspace.
              </h2>

              <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-[#6C716A]">
                Питай про клієнтів, заявки, продажі та інші записи природною
                мовою. AI використовує дані твоєї CRM як джерело для відповіді.
              </p>

              <div className="mt-8 space-y-3">
                <CheckItem text="Запитуй дані природною мовою" />
                <CheckItem text="Аналізуй записи workspace" />
                <CheckItem text="Швидше знаходь потрібну інформацію" />
              </div>
            </div>

            <div className="rounded-xl border border-[#DCE1DA] bg-white p-5 shadow-[0_14px_40px_rgba(23,26,24,0.05)]">
              <div className="flex items-center gap-3 border-b border-[#E6EAE4] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <Sparkles size={15} />
                </div>

                <div>
                  <p className="text-[12px] font-medium">AI Assistant</p>
                  <p className="text-[10px] text-[#8B9088]">
                    Workspace data
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="ml-auto max-w-[80%] rounded-lg border border-[#E0E4DE] bg-[#F8F9F7] px-4 py-3">
                  <p className="text-[12px] leading-relaxed text-[#555B54]">
                    Скільки активних клієнтів зараз у системі?
                  </p>
                </div>

                <div className="max-w-[88%] rounded-lg bg-[#E8EEE9] px-4 py-3">
                  <p className="text-[12px] leading-relaxed text-[#405148]">
                    У workspace зараз 128 активних клієнтів. За останні 7 днів
                    додано 14 нових записів.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-md border border-[#E0E4DE] bg-white px-3 py-2.5">
                <MessageSquare size={14} className="text-[#8B9088]" />
                <span className="text-[11px] text-[#9A9F98]">
                  Запитай щось про свої дані...
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="border-y border-[#DFE3DC] bg-white"
        >
          <div className="mx-auto max-w-6xl px-8 py-24">
            <div className="grid gap-12 md:grid-cols-3">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <ShieldCheck size={18} />
                </div>

                <h3 className="mt-4 text-[15px] font-medium">
                  Контроль доступу
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-[#6C716A]">
                  Керуй учасниками workspace та визначай, хто має доступ до
                  потрібних даних.
                </p>
              </div>

              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <Zap size={18} />
                </div>

                <h3 className="mt-4 text-[15px] font-medium">
                  Автоматизуй рутину
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-[#6C716A]">
                  Менше ручної роботи завдяки тригерам, умовам та
                  автоматичним діям.
                </p>
              </div>

              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <Settings2 size={18} />
                </div>

                <h3 className="mt-4 text-[15px] font-medium">
                  Змінюй систему разом із бізнесом
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-[#6C716A]">
                  Додавай нові поля, модулі та процеси без необхідності
                  перебудовувати всю систему.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-8 py-28 text-center">
          <h2 className="text-[34px] font-medium tracking-tight sm:text-[40px]">
            Побудуй CRM під свій спосіб роботи
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[#6C716A]">
            Почни з базового workspace та поступово побудуй систему під
            реальні процеси своєї команди.
          </p>

          {!isAuth && (
            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-md bg-[#24493B] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1B392E]"
              >
                Створити workspace
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {isAuth && (
            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md bg-[#24493B] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1B392E]"
              >
                Відкрити workspace
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function MockRow({
  name,
  status,
  manager,
  date,
}: {
  name: string
  status: string
  manager: string
  date: string
}) {
  return (
    <div className="grid grid-cols-4 border-b border-[#EEF0EB] px-4 py-3 last:border-0">
      <span className="text-left text-[11px] font-medium text-[#3E453F]">
        {name}
      </span>

      <span className="hidden text-left text-[11px] text-[#70776F] sm:block">
        {status}
      </span>

      <span className="hidden text-left text-[11px] text-[#70776F] sm:block">
        {manager}
      </span>

      <span className="text-right text-[10px] text-[#949991]">{date}</span>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white px-6 py-7">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
        {icon}
      </div>

      <h3 className="mt-4 text-[14px] font-medium text-[#171A18]">
        {title}
      </h3>

      <p className="mt-1.5 text-[13px] leading-relaxed text-[#6C716A]">
        {description}
      </p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <div className="flex gap-5 rounded-lg border border-[#E1E5DF] bg-white p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#8B9088]">
            {number}
          </span>

          <h3 className="text-[14px] font-medium text-[#171A18]">
            {title}
          </h3>
        </div>

        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#6C716A]">
          {description}
        </p>
      </div>
    </div>
  )
}

function UseCase({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-lg border border-[#DFE3DC] bg-[#FBFCFA] p-5 transition-colors hover:bg-white">
      <h3 className="text-[14px] font-medium text-[#171A18]">{title}</h3>

      <div className="mt-4 space-y-2.5">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Check size={13} className="text-[#24493B]" />
            <span className="text-[12px] text-[#6C716A]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7EEE9] text-[#24493B]">
        <Check size={12} />
      </div>

      <span className="text-[13px] text-[#596059]">{text}</span>
    </div>
  )
}