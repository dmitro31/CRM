import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const POSTS = [
  {
    slug: 'no-code-crm-architecture',
    date: '15 Вересня, 2026',
    title: 'Як побудувати адаптивну CRM без коду за допомогою динамичної схеми даних',
    excerpt: 'Розбір підходу Modular Monolith та проектування гнучких сутностей в PostgreSQL.',
  },
  {
    slug: 'ai-in-business-automation',
    date: '02 Вересня, 2026',
    title: 'Чому AI-асистент у CRM має працювати виключно з закритим контекстом',
    excerpt: 'Як запобігти галюцинаціям штучного інтелекту при роботі з корпоративними даними.',
  },
]

export default function BlogPage() {
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
            Блог
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Статті та матеріали
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Практичні посібники з автоматизації бізнесу та архітектури систем.
          </p>
        </div>

        <div className="grid gap-6">
          {POSTS.map((post) => (
            <div
              key={post.slug}
              className="group rounded-xl border border-[#DFE3DC] bg-white p-6 transition-all hover:border-[#C7CDC2]"
            >
              <span className="font-mono text-[11px] text-[#8B9088]">{post.date}</span>
              <h2 className="mt-2 text-[18px] font-medium text-[#171A18] group-hover:text-[#24493B]">
                {post.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#6C716A]">
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}