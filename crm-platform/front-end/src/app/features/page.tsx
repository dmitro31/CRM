import Link from 'next/link'
import {
  Layers, Workflow, Sparkles, Database, Filter,
  Paperclip, MessageSquare, Search, ArrowRight,
} from 'lucide-react'

import Logo from '@/features/header/logo'
import Footer from '@/features/footer/Footer'

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
    <div className="min-h-screen bg-[#F6F7F4] text-[#171A18]">
      <section className="mx-auto max-w-2xl px-8 pb-14 pt-20 text-center">
        <h1 className="text-[36px] font-medium leading-[1.15] tracking-tight">
          Усе, що потрібно, щоб CRM працювала так, як твій бізнес
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#6C716A]">
          Від динамічної структури даних до AI, який відповідає лише правдою.
        </p>
      </section>

      <section className="border-t border-[#DFE3DC] bg-white">
        <div className="mx-auto grid max-w-5xl gap-px bg-[#DFE3DC] px-8 py-px sm:grid-cols-2">
          {FEATURES.map(feature => (
            <div key={feature.title} className="bg-white px-8 py-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-[16px] font-medium text-[#171A18]">{feature.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#6C716A]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}