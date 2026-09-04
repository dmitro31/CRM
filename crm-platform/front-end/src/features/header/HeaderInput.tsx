'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function HeaderInput() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-md pl-10">
      <div
        className={`flex items-center gap-2.5 rounded-full border bg-white px-3.5 py-1.5 transition-colors ${
          isFocused ? 'border-[#24493B]/40' : 'border-[#DFE3DC] hover:border-[#C7CDC2]'
        }`}
      >
        <Search
          size={16}
          className={`shrink-0 ${isFocused ? 'text-[#24493B]' : 'text-[#8B9088]'}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Пошук угод, контактів або завдань"
          className="h-5 w-full bg-transparent text-[13px] text-[#171A18] placeholder:text-[#8B9088] focus:outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-sm p-0.5 text-[#8B9088] hover:bg-[#F6F7F4] hover:text-[#3D423B] focus:outline-none"
          >
            <X size={13} />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-[#DFE3DC] bg-[#F6F7F4] px-1.5 py-0.5 font-mono text-[10px] text-[#8B9088] sm:block">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  )
}   