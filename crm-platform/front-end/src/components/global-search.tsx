'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Layers, CornerDownLeft } from 'lucide-react'

import { useWorkspace } from '@/providers/workspace-provider'
import * as searchApi from '@/lib/search-api'
import type { SearchResult } from '@/lib/search-api'

export function GlobalSearch({ onClose }: { onClose?: () => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { currentWorkspace } = useWorkspace()
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose?.()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])


    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 50)
    }, [])

    const runSearch = useCallback(
        (value: string) => {
            if (!currentWorkspace) return

            if (debounceRef.current) clearTimeout(debounceRef.current)

            debounceRef.current = setTimeout(async () => {
                if (value.trim().length < 2) {
                    setResults([])
                    return
                }
                setIsSearching(true)
                try {
                    const data = await searchApi.globalSearch(currentWorkspace.id, value)
                    setResults(data)
                    setActiveIndex(0)
                } finally {
                    setIsSearching(false)
                }
            }, 250)
        },
        [currentWorkspace],
    )

    const handleChange = (value: string) => {
        setQuery(value)
        runSearch(value)
    }

    const handleSelect = (result: SearchResult) => {
        router.push(result.href)
        onClose?.()
    }

    const handleKeyNav = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, results.length - 1))
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        }
        if (e.key === 'Enter' && results[activeIndex]) {
            handleSelect(results[activeIndex])
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-[#171A18]/30 pt-[15vh]"
            onClick={() => onClose?.()}
        >
            <div
                className="w-full max-w-lg overflow-hidden rounded-lg border border-[#DFE3DC] bg-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-2.5 border-b border-[#EEF0EB] px-4 py-3">
                    <Search size={16} className="shrink-0 text-[#8B9088]" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => handleChange(e.target.value)}
                        onKeyDown={handleKeyNav}
                        placeholder="Пошук модулів і записів..."
                        className="w-full bg-transparent text-[14px] text-[#171A18] placeholder:text-[#8B9088] focus:outline-none"
                    />
                    <kbd className="shrink-0 rounded border border-[#DFE3DC] bg-[#F6F7F4] px-1.5 py-0.5 font-mono text-[10px] text-[#8B9088]">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {isSearching && (
                        <p className="px-4 py-6 text-center text-[13px] text-[#8B9088]">Пошук...</p>
                    )}

                    {!isSearching && query.trim().length >= 2 && results.length === 0 && (
                        <p className="px-4 py-6 text-center text-[13px] text-[#8B9088]">Нічого не знайдено</p>
                    )}

                    {!isSearching &&
                        results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${index === activeIndex ? 'bg-[#F6F7F4]' : ''
                                    }`}
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
                                    {result.type === 'module' ? <Layers size={13} /> : <FileText size={13} />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-[#171A18]">{result.title}</p>
                                    <p className="truncate text-[11px] text-[#8B9088]">{result.subtitle}</p>
                                </div>
                                {index === activeIndex && <CornerDownLeft size={13} className="shrink-0 text-[#8B9088]" />}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    )
}