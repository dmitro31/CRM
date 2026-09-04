'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Layers, Workflow, Sparkles } from 'lucide-react'

import Logo from '@/features/header/logo'
import { useAuth } from '@/providers/auth-provider'

export default function LandingPage() {

  const { isAuth } = useAuth()

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-[#171A18]">
      <section className="mx-auto max-w-3xl px-8 pb-20 pt-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFE3DC] bg-white px-3 py-1 font-mono text-[11px] text-[#6C716A]">
          <Sparkles size={12} className="text-[#24493B]" />
          Тепер з AI-конструктором форм
        </span>

        <h1 className="mt-6 text-[42px] font-medium leading-[1.1] tracking-tight">
          CRM, яку ти будуєш під свій бізнес,
          <br />
          <span className="text-[#24493B]">а не підлаштовуєшся під неї</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#6C716A]">
          Створюй власні модулі, поля й автоматизацію без коду. BoostFlow
          підлаштовується під те, як реально працює твоя команда.
        </p>
      {isAuth ? (<div></div>) : (<div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-md bg-[#24493B] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1B392E]"
          >
            Почати безкоштовно
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-[#DFE3DC] bg-white px-5 py-2.5 text-[14px] font-medium text-[#171A18] transition-colors hover:border-[#C7CDC2]"
          >
            Увійти в акаунт
          </Link>
        </div>)}
        
      </section>

      <section className="border-t border-[#DFE3DC] bg-white">
        <div className="mx-auto grid max-w-4xl gap-px bg-[#DFE3DC] px-8 py-16 sm:grid-cols-3">
          <Feature
            icon={<Layers size={18} />}
            title="Власні модулі"
            description="Опиши, що тобі треба — і структура даних збудується сама, з полями й типами."
          />
          <Feature
            icon={<Workflow size={18} />}
            title="Автоматизація"
            description="Тригери, умови й дії без жодного рядка коду. Або опиши їх словами — AI зробить решту."
          />
          <Feature
            icon={<Sparkles size={18} />}
            title="AI-асистент"
            description="Питай про свої дані природною мовою — відповідь ґрунтується на реальних записах."
          />
        </div>
      </section>
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
    <div className="bg-white px-6 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
        {icon}
      </div>
      <h3 className="mt-4 text-[14px] font-medium text-[#171A18]">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#6C716A]">
        {description}
      </p>
    </div>
  )
}