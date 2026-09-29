import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, CheckCircle2, Clock, Sparkles } from 'lucide-react'

const ROADMAP = [
  {
    status: 'В розробці',
    title: 'Кастомні звітні канбани та аналітика',
    description: 'Гнучкі віджети та графіки для аналізу конверсій усередині модулів.',
  },
  {
    status: 'В розробці',
    title: 'Двостороння синхронізація з Google Calendar',
    description: 'Автоматичне створення подій на основі дат у записах CRM.',
  },
  {
    status: 'Заплановано',
    title: 'AI Workflow Copilot',
    description: 'Генерація складних ланцюжків автоматизацій текстовим промптом.',
  },
  {
    status: 'Заплановано',
    title: 'Мобільний застосунок (PWA)',
    description: 'Оптимізований мобільний інтерфейс з офлайн-режимом.',
  },
]

export default function RoadmapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F4] text-[#171A18]">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#6C716A] transition-colors hover:text-[#171A18]"
        >
          <ArrowLeft size={14} />
          На головну
        </Link>

        <div className="mb-10">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#24493B]">
            План розвитку
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Product Roadmap
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Дізнайтеся, над якими функціями наша команда працює прямо зараз.
          </p>
        </div>

        <div className="space-y-4">
          {ROADMAP.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-xl border border-[#DFE3DC] bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#24493B]">
                  {item.status}
                </span>
                <h3 className="mt-1 text-[16px] font-medium">{item.title}</h3>
                <p className="mt-1 text-[13px] text-[#6C716A]">
                  {item.description}
                </p>
              </div>
              <Clock size={18} className="shrink-0 text-[#8B9088]" />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}