import Link from 'next/link'
import Footer from '@/features/footer/Footer'
import { ArrowLeft, Briefcase, MapPin } from 'lucide-react'

const JOBS = [
  {
    title: 'Senior Full-Stack Developer (NestJS + Next.js)',
    location: 'Remote / Київ',
    type: 'Full-time',
  },
  {
    title: 'Product Designer (Design Systems)',
    location: 'Remote',
    type: 'Full-time',
  },
]

export default function CareersPage() {
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
            Команда
          </span>
          <h1 className="mt-2 text-[32px] font-medium tracking-tight sm:text-[40px]">
            Кар'єра в BoostFlow
          </h1>
          <p className="mt-2 text-[15px] text-[#6C716A]">
            Будуємо майбутнє no-code систем разом. Приєднуйтесь до нашої команди.
          </p>
        </div>

        <div className="space-y-4">
          {JOBS.map((job) => (
            <div
              key={job.title}
              className="flex flex-col gap-4 rounded-xl border border-[#DFE3DC] bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-[16px] font-medium">{job.title}</h3>
                <div className="mt-2 flex items-center gap-4 text-[12.5px] text-[#8B9088]">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {job.type}
                  </span>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 justify-center rounded-md bg-[#E7EEE9] px-4 py-2 text-[12.5px] font-medium text-[#24493B] transition-colors hover:bg-[#24493B] hover:text-white"
              >
                Подати заявку
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}