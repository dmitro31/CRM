'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  Layers,
  Database,
  Workflow,
  Sparkles,
  UserPlus,
  ArrowRight,
} from 'lucide-react'

import { RecordsTimelineChart } from '@/components/records-timeline-chart'
import { PipelineWidget } from '@/components/pipeline-widget'
import * as metadataApi from '@/lib/metadata-api'

import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/shared/UI/Button'
import { Input } from '@/shared/UI/Input'
import { Card } from '@/shared/UI/Card'
import { EmptyState } from '@/shared/UI/EmptyState'
import { useAuth } from '@/providers/auth-provider'
import { useWorkspace } from '@/providers/workspace-provider'
import * as workspaceApi from '@/lib/workspace-api'
import * as dashboardApi from '@/lib/dashboard-api'
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormData,
} from '@/lib/validation/workspace-schemas'

import { RecentNotifications } from '@/components/recent-notifications'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const { currentWorkspace, workspaces, refetchWorkspaces } = useWorkspace()

  if (workspaces.length === 0) {
    return <EmptyWorkspaceState onCreated={refetchWorkspaces} />
  }

  if (!currentWorkspace) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[13px] text-[#6C716A]">Завантаження...</p>
      </div>
    )
  }

  return (
    <WorkspaceOverview
      workspaceId={currentWorkspace.id}
      userName={user?.firstName ?? ''}
    />
  )
}

function WorkspaceOverview({
  workspaceId,
  userName,
}: {
  workspaceId: string
  userName: string
}) {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['workspace-overview', workspaceId],
    queryFn: () => dashboardApi.getWorkspaceOverview(workspaceId),
  })

  const { data: modulesWithFields = [] } = useQuery({
    queryKey: ['modules-with-fields-dashboard', workspaceId, overview?.modules.map(m => m.id)],
    queryFn: async () => {
      const results = await Promise.all(
        (overview?.modules ?? []).map(async m => ({
          ...m,
          fields: await metadataApi.getFields(m.id),
        })),
      )
      return results
    },
    enabled: !!overview && overview.modules.length > 0,
  })

  const { data: timeline = [] } = useQuery({
    queryKey: ['records-timeline', workspaceId, overview?.modules.map(m => m.id)],
    queryFn: () => dashboardApi.getRecordsTimeline(workspaceId, overview!.modules),
    enabled: !!overview && overview.modules.length > 0,
  })

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="text-[28px] font-medium text-[#171A18]">
        Привіт, {userName}
      </h1>
      <p className="mt-1.5 text-[14px] text-[#6C716A]">
        Ось що відбувається у твоєму workspace сьогодні
      </p>

      {isLoading ? (
        <p className="mt-10 text-[13px] text-[#6C716A]">Завантаження...</p>
      ) : overview ? (
       <>
  <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
    <StatCard icon={<Layers size={18} />} label="Модулі" value={overview.moduleCount} />
    <StatCard icon={<Database size={18} />} label="Записи" value={overview.totalRecords} />
    <StatCard
      icon={<Workflow size={18} />}
      label="Автоматизації"
      value={`${overview.activeWorkflows}/${overview.workflowCount}`}
    />
    <Link href={`/workspace/${workspaceId}/ai`}>
      <StatCard icon={<Sparkles size={18} />} label="AI Асистент" value="Запитати →" isLink />
    </Link>
  </div>

  <div className="mt-8 grid gap-6 sm:grid-cols-3">
    <Card className="sm:col-span-2">
      <h2 className="mb-3 text-[14px] font-medium text-[#171A18]">
        Записи за останні 14 днів
      </h2>
      {timeline.length > 0 ? (
        <RecordsTimelineChart data={timeline} />
      ) : (
        <p className="text-[13px] text-[#6C716A]">Немає даних</p>
      )}
    </Card>

    <div>
      <h2 className="mb-3 text-[14px] font-medium text-[#171A18]">Воронка</h2>
      <PipelineWidget modules={modulesWithFields} />
    </div>
  </div>

  <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_280px]">
    <div>
      <h2 className="mb-3 text-[15px] font-medium text-[#171A18]">
        Останні записи
      </h2>

      {overview.recentRecords.length === 0 ? (
        <EmptyState
          title="Ще немає жодного запису."
          action={
            <Link
              href={`/workspace/${workspaceId}/modules`}
              className="text-[13px] text-[#24493B] hover:underline"
            >
              Перейти до модулів →
            </Link>
          }
        />
      ) : (
        <Card padded={false} className="overflow-hidden">
          {overview.recentRecords.map(({ record, moduleName, moduleId }) => {
            const module_ = overview.modules.find(m => m.id === moduleId)
            const label = module_
              ? dashboardApi.firstDisplayValue(record, module_)
              : record.id.slice(0, 8)

            return (
              <Link
                key={record.id}
                href={`/workspace/${workspaceId}/modules/${moduleId}/records`}
                className="flex items-center justify-between border-b border-[#F1F2EF] px-4 py-3 text-[13px] transition-colors last:border-0 hover:bg-[#F6F7F4]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#171A18]">{label}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#8B9088]">{moduleName}</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[#8B9088]">
                  {new Date(record.createdAt).toLocaleDateString('uk-UA')}
                </span>
              </Link>
            )
          })}
        </Card>
      )}
    </div>

    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-[15px] font-medium text-[#171A18]">Швидкі дії</h2>
        <div className="space-y-2">
          <QuickAction href={`/workspace/${workspaceId}/modules`} icon={<Layers size={14} />} label="Створити модуль" />
          <QuickAction href={`/workspace/${workspaceId}/workflows`} icon={<Workflow size={14} />} label="Нова автоматизація" />
          <QuickAction href={`/workspace/${workspaceId}/members`} icon={<UserPlus size={14} />} label="Запросити учасника" />
        </div>
      </div>

      <RecentNotifications />
    </div>
  </div>
</>
      ) : null}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  isLink,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  isLink?: boolean
}) {
  return (
    <Card hoverable={isLink} className={isLink ? 'cursor-pointer' : ''}>
      <div className="flex items-center gap-1.5 text-[#8B9088]">
        {icon}
        <span className="text-[12px]">{label}</span>
      </div>
      <p className="mt-2.5 text-[22px] font-medium text-[#171A18]">{value}</p>
    </Card>
  )
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link href={href}>
      <Card
        hoverable
        className="flex items-center justify-between !py-2.5 text-[13px] text-[#171A18]"
      >
        <span className="flex items-center gap-2">
          <span className="text-[#24493B]">{icon}</span>
          {label}
        </span>
        <ArrowRight size={13} className="text-[#8B9088]" />
      </Card>
    </Link>
  )
}

function EmptyWorkspaceState({ onCreated }: { onCreated: () => void }) {
  const { setCurrentWorkspaceId } = useWorkspace()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  })

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    setServerError(null)
    try {
      const workspace = await workspaceApi.createWorkspace(data)
      onCreated()
      setCurrentWorkspaceId(workspace.id)
    } catch {
      setServerError('Не вдалося створити workspace')
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-8">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[19px] font-medium text-[#171A18]">
          Створи свій перший workspace
        </h1>
        <p className="mt-1.5 text-[13px] text-[#6C716A]">
          Тут буде жити вся структура твоєї команди — модулі, записи й
          автоматизація.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-3 text-left"
        >
          <Input
            placeholder="Назва компанії або команди"
            {...register('name')}
            error={errors.name?.message}
          />

          {serverError && (
            <p className="text-[12px] text-[#B3261E]">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Створення...' : 'Створити workspace'}
          </Button>
        </form>
      </div>
    </div>
  )
}