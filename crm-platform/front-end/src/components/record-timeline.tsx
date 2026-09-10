'use client'

import { useQuery } from '@tanstack/react-query'

import * as activityApi from '@/lib/activity-api'
import {
  formatActivityLabel,
  formatActivityIcon,
  formatActivityUserName,
  formatActivityDetail,
} from '@/lib/format-activity'

interface RecordTimelineProps {
  recordId: string
}

export function RecordTimeline({ recordId }: RecordTimelineProps) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['activity', recordId],
    queryFn: () => activityApi.getRecordActivity(recordId),
  })

  if (isLoading) {
    return <p className="text-gray-500">Завантаження...</p>
  }

  if (events.length === 0) {
    return <p className="text-gray-500">Ще немає жодної події.</p>
  }

  return (
    <ol className="space-y-4">
      {events.map(event => (
        <li key={event.id} className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
            {formatActivityIcon(event)}
          </div>
          <div className="flex-1 border-b pb-4">
            <p className="text-sm">
              <span className="font-medium">{formatActivityUserName(event)}</span>{' '}
              {formatActivityLabel(event)}
              {formatActivityDetail(event) && (
                <span className="text-gray-500"> {formatActivityDetail(event)}</span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {new Date(event.createdAt).toLocaleString('uk-UA')}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}