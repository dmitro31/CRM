'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

import HeaderInput from '@/features/header/HeaderInput'
import Logo from '@/features/header/logo'
import WorkspaceDropMenu from '@/features/header/workspace-dropMenu'
import NotificationBell from '@/features/header/NotificationBell'
import UserMenu from '@/features/header/UserMenu'
import { GlobalSearch } from '@/components/global-search'

export default function HeaderWidgets() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-[#DFE3DC] bg-[#F6F7F4] px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="shrink-0">
            <Logo />
          </div>

          <div className="shrink-0 max-w-[130px] sm:max-w-none">
            <WorkspaceDropMenu />
          </div>

          <div className="hidden lg:block">
            <HeaderInput onOpen={() => setIsSearchOpen(true)} />
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFE3DC] bg-white text-gray-600 transition hover:bg-gray-50 lg:hidden shrink-0"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      {isSearchOpen && (
        <GlobalSearch onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  )
}