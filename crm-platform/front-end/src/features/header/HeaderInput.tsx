'use client'

import { Search } from 'lucide-react'

export default function HeaderInput({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="w-full max-w-md pl-10">
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-2.5 rounded-full border border-[#DFE3DC] bg-white px-3.5 py-1.5 text-left transition-colors hover:border-[#C7CDC2]"
      >
        <Search size={16} className="shrink-0 text-[#8B9088]" />
        <span className="flex-1 text-[13px] text-[#8B9088]">
          Пошук угод, контактів або завдань
        </span>
        <kbd className="hidden shrink-0 rounded border border-[#DFE3DC] bg-[#F6F7F4] px-1.5 py-0.5 font-mono text-[10px] text-[#8B9088] sm:block">
          ⌘K
        </kbd>
      </button>
    </div>
  )
}