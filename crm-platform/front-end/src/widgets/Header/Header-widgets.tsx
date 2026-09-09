'use client'

import { useState, useEffect } from 'react'

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
      <div className="flex h-16 items-center justify-between border-b border-[#DFE3DC] bg-[#F6F7F4]">
        <div className="flex items-center">
          <div className="pl-8 pr-6">
            <Logo />
          </div>
          <WorkspaceDropMenu />
          <HeaderInput onOpen={() => setIsSearchOpen(true)} />
          {isSearchOpen && <GlobalSearch onClose={() => setIsSearchOpen(false)} />}
        </div>

        <div className="flex items-center gap-2 pr-8">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>

      {isSearchOpen && <GlobalSearch />}
    </>
  )
}