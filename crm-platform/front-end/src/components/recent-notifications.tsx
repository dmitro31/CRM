'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'

import { Card } from '@/shared/UI/Card'
import * as notificationApi from '@/lib/notification-api'

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'щойно'
  if (minutes < 60) return `${minutes} хв тому`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} год тому`
  return `${Math.floor(hours / 24)} дн тому`
}

export function RecentNotifications() {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
  })

  const recent = notifications.slice(0, 4)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-medium text-[#171A18]">Сповіщення</h2>
        <Bell size={14} className="text-[#8B9088]" />
      </div>

      {recent.length === 0 ? (
        <Card>
          <p className="text-[12.5px] text-[#8B9088]">Поки що тихо</p>
        </Card>
      ) : (
        <Card padded={false} className="overflow-hidden">
          {recent.map(notification => (
            <div
              key={notification.id}
              className="border-b border-[#F1F2EF] px-3.5 py-2.5 last:border-0"
            >
              <p className="truncate text-[12.5px] font-medium text-[#171A18]">
                {notification.title}
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-[#8B9088]">
                {timeAgo(notification.createdAt)}
              </p>
            </div>
          ))}
        </Card>
      )}

      <Link
        href="#"
        onClick={e => e.preventDefault()}
        className="mt-2 inline-block text-[12px] text-[#24493B] hover:underline"
      >
        Усі сповіщення
      </Link>
    </div>
  )
}