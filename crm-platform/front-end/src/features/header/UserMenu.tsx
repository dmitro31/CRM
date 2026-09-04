'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'

export default function UserMenu() {
  const [isActive, setIsActive] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsActive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsActive(v => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24493B] text-[11px] font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none"
      >
        {initials || <UserIcon size={14} />}
      </button>

      {isActive && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 origin-top-right overflow-hidden rounded-md border border-[#DFE3DC] bg-white p-1">
          <div className="px-2.5 py-2">
            <p className="truncate text-[13px] font-medium text-[#171A18]">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-[11px] text-[#6C716A]">{user.email}</p>
          </div>

          <div className="border-t border-[#EEF0EB] pt-1">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-[12.5px] text-[#B3261E] transition-colors hover:bg-[#FBEDEC]"
            >
              <LogOut size={14} />
              <span>Вийти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}