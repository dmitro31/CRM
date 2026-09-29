import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import {
  Layers, Workflow, Sparkles, Database, Filter,
  Paperclip, MessageSquare, Search, ArrowRight, ArrowLeft
} from 'lucide-react'

const FEATURES = [
  {
    icon: <Layers size={20} />,
    title: 'Динамічні модулі',
    description:
      'Створюй власні типи даних із будь-яким набором полів — текст, число, дата, вибір зі списку, файл, зв\'язок. Жодної фіксованої схеми "Ліди/Угоди" — тільки те, що реально потрібно твоєму бізнесу.',
  },
  {
    icon: <Database size={20} />,
    title: 'Записи з валідацією',
    description:
      'Кожен запис перевіряється проти схеми полів модуля — обов\'язкові поля, унікальні значення, правильні типи. Форма створення автоматично підлаштовується під структуру модуля.',
  },
  {
    icon: <Filter size={20} />,
    title: 'Розширені фільтри та views',
    description:
      'Комбінуй умови через AND/OR, використовуй оператори "містить", "більше", "менше". Збережи улюблену комбінацію фільтрів як окремий вигляд і перемикайся між ними одним кліком.',
  },
  {
    icon: <Workflow size={20} />,
    title: 'Автоматизація без коду',
    description:
      'Візуальний конструктор workflow: коли (тригер) → якщо (умови) → тоді (дії). Сповіщення, листи, автоматичне оновлення полів — усе без єдиного рядка коду.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'AI, який не вигадує',
    description:
      'AI-асистент відповідає лише на основі реальних даних твого workspace — ніколи не фантазує цифри. Генератори форм і автоматизації створюють чернетку, яку ти перевіряєш перед підтвердженням.',
  },
  {
    icon: <Paperclip size={20} />,
    title: 'Файли й зображення',
    description:
      'Прикріплюй файли та фото прямо до записів. Зберігання через S3-сумісне сховище з безпечними тимчасовими посиланнями на завантаження.',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'Коментарі та згадки',
    description:
      'Обговорюй записи з командою прямо в CRM. Згадай колегу через @ — він отримає сповіщення миттєво.',
  },
  {
    icon: <Search size={20} />,
    title: 'Миттєвий пошук',
    description:
      'Глобальний пошук (⌘K) по всіх модулях і записах workspace з будь-якого місця в застосунку.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F4] text-[#171A18]">
      <div className="mx-auto w-full max-w-5xl px-6 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6C716A] transition-colors hover:text-[#171A18]"
        >
          <ArrowLeft size={14} />
          На головну
        </Link>
      </div>

      <section className="mx-auto max-w-2xl px-8 pb-14 pt-10 text-center">
        <h1 className="text-[36px] font-medium leading-[1.15] tracking-tight sm:text-[42px]">
          Усе, що потрібно, щоб CRM працювала так, як твій бізнес
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#6C716A]">
          Від динамічної структури даних до AI, який відповідає лише правдою.
        </p>
      </section>

      <section className="border-t border-[#DFE3DC] bg-white">
        <div className="mx-auto grid max-w-5xl gap-px bg-[#DFE3DC] px-8 py-px sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-white px-8 py-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-[16px] font-medium text-[#171A18]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#6C716A]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#DFE3DC] bg-[#FAFBF9] py-16 text-center">
        <div className="mx-auto max-w-md px-6">
          <h2 className="text-[22px] font-medium text-[#171A18]">Готові спробувати?</h2>
          <p className="mt-2 text-[13px] text-[#6C716A]">
            Створіть свій перший workspace за 1 хвилину.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-[#24493B] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1C392E]"
            >
              Спробувати безкоштовно
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}