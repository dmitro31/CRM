'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useWorkspace } from '@/providers/workspace-provider'

export default function WorkspaceDropMenu() {
  const [isActive, setIsActive] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { workspaces, setCurrentWorkspaceId, currentWorkspace } = useWorkspace()

  const toggleMenu = () => setIsActive(prev => !prev)

  const handleSelectWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId)
    setIsActive(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsActive(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsActive(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const initial = currentWorkspace?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div ref={menuRef} className="relative w-full max-w-[240px]">
      <button
        type="button"
        onClick={toggleMenu}
        className="group flex w-full items-center gap-2.5 rounded-md border border-[#DFE3DC] bg-white px-2.5 py-2 text-left transition-colors hover:border-[#C7CDC2] focus:outline-none focus:ring-2 focus:ring-[#24493B]/15"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#E7EEE9] text-[11px] font-semibold text-[#24493B]">
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-[#171A18]">
            {currentWorkspace?.name ?? 'Вибрати workspace'}
          </p>
          <p className="truncate font-mono text-[10px] text-[#6C716A]">
            {currentWorkspace ? `/${currentWorkspace.slug}` : 'не обрано'}
          </p>
        </div>

        <ChevronDown
          size={14}
          className={`shrink-0 text-[#6C716A] transition-transform duration-150 ${
            isActive ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isActive && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full origin-top overflow-hidden rounded-md border border-[#DFE3DC] bg-white p-1">
          <div className="px-2.5 py-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wide text-[#6C716A]">
              Робочі простори
            </span>
          </div>

          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {workspaces.length > 0 ? (
              workspaces.map(workspace => {
                const isSelected = currentWorkspace?.id === workspace.id

                return (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(workspace.id)}
                    className={`flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left transition-colors ${
                      isSelected ? 'bg-[#E7EEE9]' : 'hover:bg-[#F6F7F4]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isSelected ? 'bg-[#24493B]' : 'bg-[#DFE3DC]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-[13px] leading-none ${
                          isSelected
                            ? 'font-medium text-[#171A18]'
                            : 'text-[#3D423B]'
                        }`}
                      >
                        {workspace.name}
                      </p>
                      <p className="mt-1 truncate font-mono text-[10px] text-[#6C716A]">
                        /{workspace.slug}
                      </p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="py-4 text-center">
                <p className="text-[12px] text-[#6C716A]">Немає робочих просторів</p>
              </div>
            )}
          </div>

          <div className="mt-1 border-t border-[#EEF0EB] pt-1">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-[12px] font-medium text-[#3D423B] transition-colors hover:bg-[#F6F7F4]"
            >
              <Plus size={14} className="text-[#6C716A]" />
              <span>Створити workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}