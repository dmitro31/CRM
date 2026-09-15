'use client'

import { useState } from 'react'
import { Layers, Workflow, Sparkles, Database, Users, Filter } from 'lucide-react'

import { ProtectedRoute } from '@/components/protected-route'
import { Card } from '@/shared/UI/Card'

type Section = 'modules' | 'records' | 'automation' | 'ai' | 'filters' | 'team'

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'modules', label: 'Модулі та поля', icon: <Layers size={15} /> },
  { id: 'records', label: 'Записи', icon: <Database size={15} /> },
  { id: 'filters', label: 'Фільтри та views', icon: <Filter size={15} /> },
  { id: 'automation', label: 'Автоматизація', icon: <Workflow size={15} /> },
  { id: 'ai', label: 'AI-функції', icon: <Sparkles size={15} /> },
  { id: 'team', label: 'Команда', icon: <Users size={15} /> },
]

export default function DocsPage() {
  return (
    <ProtectedRoute>
      <DocsContent />
    </ProtectedRoute>
  )
}

function DocsContent() {
  const [active, setActive] = useState<Section>('modules')

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-[22px] font-medium text-[#171A18]">Документація</h1>
      <p className="mt-1 text-[13px] text-[#6C716A]">
        Як користуватись BoostFlow — від створення модуля до AI-автоматизації
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-[200px_1fr]">
        <nav className="space-y-0.5">
          {SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                active === section.id
                  ? 'bg-[#E7EEE9] font-medium text-[#24493B]'
                  : 'text-[#3D423B] hover:bg-[#F6F7F4]'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>

        <Card>
          {active === 'modules' && <ModulesDoc />}
          {active === 'records' && <RecordsDoc />}
          {active === 'filters' && <FiltersDoc />}
          {active === 'automation' && <AutomationDoc />}
          {active === 'ai' && <AiDoc />}
          {active === 'team' && <TeamDoc />}
        </Card>
      </div>
    </div>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-[16px] font-medium text-[#171A18]">{title}</h2>
      <div className="space-y-3 text-[13.5px] leading-relaxed text-[#3D423B]">{children}</div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7EEE9] font-mono text-[10px] font-medium text-[#24493B]">
        {n}
      </span>
      <p>{children}</p>
    </div>
  )
}

function ModulesDoc() {
  return (
    <DocSection title="Модулі та поля">
      <p>
        Модуль — це тип даних у твоїй CRM: &quot;Клієнти&quot;, &quot;Угоди&quot;,
        &quot;Автомобілі&quot; тощо. Кожен модуль має свій набір полів з обраними
        типами.
      </p>
      <Step n={1}>Відкрий workspace → Модулі → &quot;Створити модуль&quot;.</Step>
      <Step n={2}>Задай назву й опис.</Step>
      <Step n={3}>
        Всередині модуля додай поля — обери тип (текст, число, дата, вибір зі
        списку, файл тощо), познач обов&apos;язкові й унікальні.
      </Step>
      <p>
        Для полів типу &quot;Вибір&quot; (SELECT/MULTI_SELECT) вкажи варіанти
        через кому — вони стануть доступні у формі запису й у фільтрах.
      </p>
    </DocSection>
  )
}

function RecordsDoc() {
  return (
    <DocSection title="Записи">
      <p>
        Записи — це реальні дані всередині модуля (конкретний клієнт,
        конкретна угода). Форма створення запису автоматично підлаштовується
        під поля модуля.
      </p>
      <Step n={1}>Відкрий модуль → Переглянути записи.</Step>
      <Step n={2}>&quot;+ Новий запис&quot; — заповни поля, збережи.</Step>
      <Step n={3}>
        Відкрий запис, щоб побачити таймлайн змін, коментарі (з можливістю
        згадати колегу через <code className="rounded bg-[#F6F7F4] px-1">@</code>)
        і прикріплені файли.
      </Step>
    </DocSection>
  )
}

function FiltersDoc() {
  return (
    <DocSection title="Фільтри та збережені views">
      <p>
        На сторінці записів можна побудувати кілька умов фільтрації (текст
        містить, число більше/менше, точний збіг) і обрати, чи всі умови
        мають виконуватись одночасно (AND), чи достатньо будь-якої (OR).
      </p>
      <p>
        Зручну комбінацію фільтрів можна зберегти як &quot;вигляд&quot;
        (view) — вона з&apos;явиться окремою вкладкою над таблицею й
        застосовується одним кліком.
      </p>
    </DocSection>
  )
}

function AutomationDoc() {
  return (
    <DocSection title="Автоматизація">
      <p>Автоматизація складається з трьох частин:</p>
      <Step n={1}>
        <strong>Коли</strong> — подія-тригер: запис створено, оновлено, або
        конкретне поле змінило значення.
      </Step>
      <Step n={2}>
        <strong>Якщо</strong> — необов&apos;язкові умови (наприклад, статус
        дорівнює &quot;Завершено&quot;).
      </Step>
      <Step n={3}>
        <strong>Тоді</strong> — дія: надіслати сповіщення, лист, або оновити
        інше поле запису.
      </Step>
      <p>
        Автоматизацію можна зібрати вручну через конструктор або описати
        словами й дати AI згенерувати чернетку для редагування.
      </p>
    </DocSection>
  )
}

function AiDoc() {
  return (
    <DocSection title="AI-функції">
      <p>
        <strong>Генератор форм</strong> — опиши модуль природною мовою на
        сторінці Модулі, AI підбере поля й типи. Перевір і відредагуй
        результат перед створенням.
      </p>
      <p>
        <strong>Генератор автоматизації</strong> — те саме для workflow, на
        сторінці Автоматизація.
      </p>
      <p>
        <strong>AI Асистент</strong> — питай про реальні дані workspace
        природною мовою (&quot;скільки клієнтів у статусі Новий&quot;). AI
        відповідає лише на основі того, що реально є в базі — ніколи не
        вигадує цифри.
      </p>
    </DocSection>
  )
}

function TeamDoc() {
  return (
    <DocSection title="Команда">
      <p>
        Запроси колег на сторінці Учасники — вкажи email і роль. Ролі
        визначають, до чого учасник матиме доступ (permissions).
      </p>
      <p>
        Власник workspace може передати власність іншому учаснику або
        видалити workspace повністю в Налаштуваннях.
      </p>
    </DocSection>
  )
}