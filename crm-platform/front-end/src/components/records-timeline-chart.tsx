'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import type { TimelinePoint } from '../lib/dashboard-api'

export function RecordsTimelineChart({ data }: { data: TimelinePoint[] }) {
  const formatted = data.map(point => ({
    ...point,
    label: new Date(point.date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} barSize={16}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#8B9088' }}
          axisLine={{ stroke: '#DFE3DC' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#8B9088' }}
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip
          cursor={{ fill: '#F6F7F4' }}
          contentStyle={{
            borderRadius: 6,
            borderColor: '#DFE3DC',
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="#24493B" radius={[3, 3, 0, 0]} name="Записів" />
      </BarChart>
    </ResponsiveContainer>
  )
}