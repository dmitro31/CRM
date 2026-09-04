'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getAccessToken } from '@/lib/api-client'
import * as notificationApi from '@/lib/notification-api'

const TYPE_DOT: Record<string, string> = {
  INFO: 'bg-[#24493B]',
  SUCCESS: 'bg-[#24493B]',
  WARNING: 'bg-[#C1611F]',
  ERROR: 'bg-[#B3261E]',
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'щойно'
  if (minutes < 60) return `${minutes} хв тому`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} год тому`
  return `${Math.floor(hours / 24)} дн тому`
}

export default function NotificationBell() {
  const [isActive, setIsActive] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const isAuthenticated = !!getAccessToken()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30_000 : false,
    retry: false,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    enabled: isActive && isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsActive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead()
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    void queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
  }

  const handleItemClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await notificationApi.markAsRead(id)
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsActive(v => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-[#6C716A] transition-colors hover:bg-[#EEF0EB] hover:text-[#171A18] focus:outline-none"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#C1611F] px-1 text-[9px] font-medium leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isActive && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-80 origin-top-right overflow-hidden rounded-md border border-[#DFE3DC] bg-white">
          <div className="flex items-center justify-between border-b border-[#EEF0EB] px-3 py-2.5">
            <span className="text-[13px] font-medium text-[#171A18]">
              Сповіщення
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="text-[11px] text-[#24493B] hover:underline"
              >
                Позначити всі прочитаними
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[12px] text-[#8B9088]">Немає сповіщень</p>
              </div>
            )}

            {notifications.map(notification => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void handleItemClick(notification.id, notification.isRead)}
                className={`flex w-full gap-2.5 border-b border-[#F1F2EF] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-[#F6F7F4] ${
                  notification.isRead ? '' : 'bg-[#F6F7F4]/60'
                }`}
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    notification.isRead ? 'bg-transparent' : TYPE_DOT[notification.type]
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-[#171A18]">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-[#6C716A]">
                    {notification.message}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[#8B9088]">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}