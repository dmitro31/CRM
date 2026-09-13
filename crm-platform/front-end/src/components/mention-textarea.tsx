'use client'

import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import * as workspaceApi from '@/lib/workspace-api'
import { useWorkspace } from '@/providers/workspace-provider'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}: MentionTextareaProps) {
  const { currentWorkspace } = useWorkspace()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(0)

  const { data: workspace } = useQuery({
    queryKey: ['workspace', currentWorkspace?.id],
    queryFn: () => workspaceApi.getWorkspace(currentWorkspace!.id),
    enabled: !!currentWorkspace,
  })

  const members = workspace?.members ?? []

  const filteredMembers =
    mentionQuery !== null
      ? members.filter(m =>
          `${m.user.firstName} ${m.user.lastName ?? ''}`
            .toLowerCase()
            .includes(mentionQuery.toLowerCase()),
        )
      : []

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart
    onChange(newValue)

    const textBeforeCursor = newValue.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@([^\s@]*)$/)

    if (atMatch) {
      setMentionQuery(atMatch[1])
      setMentionStart(cursorPos - atMatch[0].length)
    } else {
      setMentionQuery(null)
    }
  }

  const insertMention = (userId: string, name: string) => {
    if (!textareaRef.current) return

    const cursorPos = textareaRef.current.selectionStart
    const before = value.slice(0, mentionStart)
    const after = value.slice(cursorPos)
    const mentionText = `@[${name}](${userId}) `

    const newValue = `${before}${mentionText}${after}`
    onChange(newValue)
    setMentionQuery(null)

    setTimeout(() => {
      const newPos = before.length + mentionText.length
      textareaRef.current?.setSelectionRange(newPos, newPos)
      textareaRef.current?.focus()
    }, 0)
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />

      {mentionQuery !== null && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 z-20 mb-1 w-56 overflow-hidden rounded-md border border-[#DFE3DC] bg-white">
          {filteredMembers.slice(0, 5).map(member => (
            <button
              key={member.userId}
              type="button"
              onClick={() =>
                insertMention(
                  member.userId,
                  `${member.user.firstName} ${member.user.lastName ?? ''}`.trim(),
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F6F7F4]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#24493B] text-[9px] font-semibold text-white">
                {member.user.firstName.charAt(0).toUpperCase()}
              </span>
              {member.user.firstName} {member.user.lastName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}