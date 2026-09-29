'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

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
          <h1 className="text-[32px] font-medium tracking-tight sm:text-[40px]">
            Зв'яжіться з нами
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Маєте питання щодо платформи або потрібна допомога з налаштуванням?
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-lg border border-[#DFE3DC] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-[#8B9088]">Email</h3>
                  <a
                    href="mailto:support@boostflow.com"
                    className="text-[14px] font-medium text-[#24493B] hover:underline"
                  >
                    support@boostflow.com
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#DFE3DC] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-[13px] font-medium text-[#8B9088]">Telegram Support</h3>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-medium text-[#24493B] hover:underline"
                  >
                    @boostflow_support
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#DFE3DC] bg-white p-6 sm:p-8 lg:col-span-7">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EEE9] text-[#24493B]">
                  <Send size={20} />
                </div>
                <h3 className="mt-4 text-[18px] font-medium">Повідомлення надіслано!</h3>
                <p className="mt-2 text-[13px] text-[#6C716A]">
                  Дякуємо за звернення. Ми відповімо протягом кількох годин.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-[13px] font-medium text-[#24493B] hover:underline"
                >
                  Надіслати ще одне
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#171A18]">
                    Ваше ім'я
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Олександр"
                    className="mt-1.5 w-full rounded-md border border-[#DFE3DC] bg-[#FAFBF9] px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-[#24493B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#171A18]">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    className="mt-1.5 w-full rounded-md border border-[#DFE3DC] bg-[#FAFBF9] px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-[#24493B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#171A18]">
                    Повідомлення
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Опишіть ваше питання або задачу..."
                    className="mt-1.5 w-full rounded-md border border-[#DFE3DC] bg-[#FAFBF9] px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-[#24493B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-[#24493B] py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1C392E]"
                >
                  Надіслати повідомлення
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}