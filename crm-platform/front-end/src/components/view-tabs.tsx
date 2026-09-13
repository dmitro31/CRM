'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Star } from 'lucide-react'

import * as viewApi from '@/lib/view-api'
import type { FilterRule } from '@/components/filter-builder'
import type { Field } from '@/types/metadata'

interface ViewTabsProps {
  moduleId: string
  activeViewId: string | null
  onSelectView: (viewId: string | null) => void
  currentState: {
    rules: FilterRule[]
    matchMode: 'all' | 'any'
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  displayFields: Field[]
}

export function ViewTabs({
  moduleId,
  activeViewId,
  onSelectView,
  currentState,
  displayFields,
}: ViewTabsProps) {
  const queryClient = useQueryClient()
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [viewName, setViewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { data: views = [] } = useQuery({
    queryKey: ['views', moduleId],
    queryFn: () => viewApi.getViews(moduleId),
  })

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['views', moduleId] })

  const handleSave = async () => {
    if (!viewName.trim()) return
    setIsSaving(true)
    try {
      const created = await viewApi.createView(moduleId, {
        name: viewName,
        filters: { rules: currentState.rules, matchMode: currentState.matchMode },
        sorting: { sortBy: currentState.sortBy, sortOrder: currentState.sortOrder },
        columns: displayFields.map(f => f.key),
      })
      invalidate()
      onSelectView(created.id)
      setViewName('')
      setShowSaveForm(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Видалити цей вигляд?')) return
    await viewApi.deleteView(viewId)
    if (activeViewId === viewId) onSelectView(null)
    invalidate()
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5">
      <button
        onClick={() => onSelectView(null)}
        className={`rounded-full px-3 py-1 text-[12.5px] transition-colors ${
          activeViewId === null
            ? 'bg-[#24493B] text-white'
            : 'border border-[#DFE3DC] text-[#3D423B] hover:bg-[#F6F7F4]'
        }`}
      >
        Усі записи
      </button>

      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onSelectView(view.id)}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] transition-colors ${
            activeViewId === view.id
              ? 'bg-[#24493B] text-white'
              : 'border border-[#DFE3DC] text-[#3D423B] hover:bg-[#F6F7F4]'
          }`}
        >
          {view.isDefault && <Star size={11} className="shrink-0" />}
          {view.name}
          <X
            size={12}
            className={`shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${
              activeViewId === view.id ? 'hover:text-white/70' : 'hover:text-[#B3261E]'
            }`}
            onClick={e => void handleDelete(view.id, e)}
          />
        </button>
      ))}

      {showSaveForm ? (
        <div className="flex items-center gap-1.5">
          <input
            value={viewName}
            onChange={e => setViewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleSave() }}
            placeholder="Назва вигляду"
            autoFocus
            className="w-32 rounded-full border border-[#DFE3DC] px-3 py-1 text-[12.5px] focus:border-[#24493B]/40 focus:outline-none"
          />
          <button
            onClick={() => void handleSave()}
            disabled={isSaving || !viewName.trim()}
            className="text-[12px] font-medium text-[#24493B] disabled:opacity-50"
          >
            OK
          </button>
          <button onClick={() => setShowSaveForm(false)} className="text-[#8B9088]">
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveForm(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-[#DFE3DC] px-3 py-1 text-[12.5px] text-[#6C716A] hover:border-[#C7CDC2]"
        >
          <Plus size={12} /> Зберегти вигляд
        </button>
      )}
    </div>
  )
}