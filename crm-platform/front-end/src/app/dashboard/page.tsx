'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Database,
  Layers,
  MessageSquare,
  Plus,
  Settings2,
  Sparkles,
  UserPlus,
  Users,
  Workflow,
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
      workspaceName={currentWorkspace.name}
      userName={user?.firstName ?? ''}
    />
  )
}

function WorkspaceOverview({
  workspaceId,
  workspaceName,
  userName,
}: {
  workspaceId: string
  workspaceName: string
  userName: string
}) {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['workspace-overview', workspaceId],
    queryFn: () => dashboardApi.getWorkspaceOverview(workspaceId),
  })

  const { data: modulesWithFields = [] } = useQuery({
    queryKey: [
      'modules-with-fields-dashboard',
      workspaceId,
      overview?.modules.map((m) => m.id),
    ],
    queryFn: async () => {
      const results = await Promise.all(
        (overview?.modules ?? []).map(async (m) => ({
          ...m,
          fields: await metadataApi.getFields(m.id),
        })),
      )

      return results
    },
    enabled: !!overview && overview.modules.length > 0,
  })

  const { data: timeline = [] } = useQuery({
    queryKey: [
      'records-timeline',
      workspaceId,
      overview?.modules.map((m) => m.id),
    ],
    queryFn: () =>
      dashboardApi.getRecordsTimeline(workspaceId, overview!.modules),
    enabled: !!overview && overview.modules.length > 0,
  })

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-[#DFE3DC] pb-7 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <Activity size={14} />
            </span>

            <span className="text-[11px] font-medium text-[#8B9088]">
              {workspaceName}
            </span>
          </div>

          <h1 className="mt-4 text-[28px] font-medium tracking-tight text-[#171A18]">
            Привіт, {userName}
          </h1>

          <p className="mt-1.5 text-[14px] text-[#6C716A]">
            Ось що відбувається у твоєму workspace сьогодні
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/workspace/${workspaceId}/modules`}
            className="flex items-center gap-2 rounded-md border border-[#DFE3DC] bg-white px-3.5 py-2.5 text-[12px] font-medium text-[#171A18] transition-colors hover:border-[#C7CDC2]"
          >
            <Plus size={14} />
            Створити запис
          </Link>

          <Link
            href={`/workspace/${workspaceId}/settings`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#DFE3DC] bg-white text-[#6C716A] transition-colors hover:border-[#C7CDC2] hover:text-[#171A18]"
          >
            <Settings2 size={15} />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : overview ? (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Layers size={17} />}
              label="Модулі"
              value={overview.moduleCount}
              href={`/workspace/${workspaceId}/modules`}
            />

            <StatCard
              icon={<Database size={17} />}
              label="Записи"
              value={overview.totalRecords}
              href={`/workspace/${workspaceId}/modules`}
            />

            <StatCard
              icon={<Workflow size={17} />}
              label="Автоматизації"
              value={`${overview.activeWorkflows}/${overview.workflowCount}`}
              href={`/workspace/${workspaceId}/workflows`}
            />

            <Link
              href={`/workspace/${workspaceId}/ai`}
              className="group"
            >
              <Card
                hoverable
                className="relative h-full overflow-hidden border-[#D7E1DA] bg-[#F8FAF8]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#24493B]">
                    <Sparkles size={17} />
                    <span className="text-[12px] font-medium">
                      AI Асистент
                    </span>
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-[#8B9088] transition-transform group-hover:translate-x-0.5"
                  />
                </div>

                <p className="mt-3 text-[18px] font-medium text-[#171A18]">
                  Запитати AI
                </p>

                <p className="mt-1 text-[11px] text-[#6C716A]">
                  Питай про дані свого workspace
                </p>
              </Card>
            </Link>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
            <Card className="min-h-[330px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#24493B]" />
                    <h2 className="text-[14px] font-medium text-[#171A18]">
                      Активність
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-[#8B9088]">
                    Кількість нових записів за останні 14 днів
                  </p>
                </div>

                <span className="rounded-md border border-[#E1E5DF] bg-[#FAFBF9] px-2.5 py-1 text-[10px] text-[#7D837B]">
                  14 днів
                </span>
              </div>

              <div className="mt-6">
                {timeline.length > 0 ? (
                  <RecordsTimelineChart data={timeline} />
                ) : (
                  <div className="flex h-[220px] items-center justify-center rounded-md border border-dashed border-[#E1E5DF]">
                    <div className="text-center">
                      <Activity
                        size={20}
                        className="mx-auto text-[#A1A69F]"
                      />
                      <p className="mt-2 text-[12px] text-[#6C716A]">
                        Поки немає достатньо даних
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="min-h-[330px]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow size={16} className="text-[#24493B]" />
                    <h2 className="text-[14px] font-medium text-[#171A18]">
                      Воронка
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-[#8B9088]">
                    Розподіл даних за полем
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <PipelineWidget modules={modulesWithFields} />
              </div>
            </Card>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-medium text-[#171A18]">
                    Останні записи
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#8B9088]">
                    Останні зміни у твоєму workspace
                  </p>
                </div>

                <Link
                  href={`/workspace/${workspaceId}/modules`}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#24493B] hover:underline"
                >
                  Переглянути всі
                  <ArrowRight size={12} />
                </Link>
              </div>

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
                  {overview.recentRecords.map(
                    ({ record, moduleName, moduleId }) => {
                      const module_ = overview.modules.find(
                        (m) => m.id === moduleId,
                      )

                      const label = module_
                        ? dashboardApi.firstDisplayValue(record, module_)
                        : record.id.slice(0, 8)

                      return (
                        <Link
                          key={record.id}
                          href={`/workspace/${workspaceId}/modules/${moduleId}/records`}
                          className="group flex items-center justify-between border-b border-[#F1F2EF] px-4 py-3.5 transition-colors last:border-0 hover:bg-[#F8F9F7]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F0F3EF] text-[#24493B]">
                              <Database size={14} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-[#171A18]">
                                {label}
                              </p>

                              <div className="mt-0.5 flex items-center gap-1.5">
                                <span className="truncate text-[11px] text-[#8B9088]">
                                  {moduleName}
                                </span>

                                <span className="text-[#C3C7C1]">·</span>

                                <span className="text-[10px] text-[#9A9F98]">
                                  Запис
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 flex shrink-0 items-center gap-2">
                            <span className="font-mono text-[10px] text-[#8B9088]">
                              {new Date(
                                record.createdAt,
                              ).toLocaleDateString('uk-UA')}
                            </span>

                            <ArrowRight
                              size={12}
                              className="text-[#B0B5AE] transition-transform group-hover:translate-x-0.5"
                            />
                          </div>
                        </Link>
                      )
                    },
                  )}
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3">
                  <h2 className="text-[15px] font-medium text-[#171A18]">
                    Швидкі дії
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#8B9088]">
                    Найчастіші дії workspace
                  </p>
                </div>

                <div className="space-y-2">
                  <QuickAction
                    href={`/workspace/${workspaceId}/modules`}
                    icon={<Layers size={14} />}
                    label="Створити модуль"
                    description="Нова структура даних"
                  />

                  <QuickAction
                    href={`/workspace/${workspaceId}/workflows`}
                    icon={<Workflow size={14} />}
                    label="Нова автоматизація"
                    description="Автоматизувати процес"
                  />

                  <QuickAction
                    href={`/workspace/${workspaceId}/members`}
                    icon={<UserPlus size={14} />}
                    label="Запросити учасника"
                    description="Додати до workspace"
                  />

                  <QuickAction
                    href={`/workspace/${workspaceId}/ai`}
                    icon={<Sparkles size={14} />}
                    label="Запитати AI"
                    description="Проаналізувати дані"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-medium text-[#171A18]">
                      Сповіщення
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#8B9088]">
                      Останні події
                    </p>
                  </div>

                  <Bell size={15} className="text-[#8B9088]" />
                </div>

                <RecentNotifications />
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <DashboardInfoCard
              icon={<Users size={16} />}
              title="Команда"
              description="Керуй учасниками та доступами workspace."
              href={`/workspace/${workspaceId}/members`}
              action="Учасники"
            />

            <DashboardInfoCard
              icon={<Workflow size={16} />}
              title="Автоматизації"
              description="Створюй процеси, які працюють без ручної роботи."
              href={`/workspace/${workspaceId}/workflows`}
              action="Відкрити"
            />

            <DashboardInfoCard
              icon={<MessageSquare size={16} />}
              title="AI Асистент"
              description="Отримуй відповіді на питання щодо своїх даних."
              href={`/workspace/${workspaceId}/ai`}
              action="Запитати"
            />
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
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  href: string
}) {
  return (
    <Link href={href} className="group">
      <Card
        hoverable
        className="relative h-full overflow-hidden transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#8B9088]">
            {icon}
            <span className="text-[12px]">{label}</span>
          </div>

          <ArrowRight
            size={13}
            className="text-[#B0B5AE] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </div>

        <p className="mt-3 text-[24px] font-medium tracking-tight text-[#171A18]">
          {value}
        </p>
      </Card>
    </Link>
  )
}

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <Link href={href} className="group block">
      <Card
        hoverable
        className="flex items-center justify-between !px-4 !py-3 transition-colors"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
            {icon}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[12px] font-medium text-[#171A18]">
              {label}
            </span>

            <span className="mt-0.5 block truncate text-[10px] text-[#8B9088]">
              {description}
            </span>
          </span>
        </span>

        <ArrowRight
          size={13}
          className="shrink-0 text-[#8B9088] transition-transform group-hover:translate-x-0.5"
        />
      </Card>
    </Link>
  )
}

function DashboardInfoCard({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <Link href={href} className="group">
      <Card
        hoverable
        className="flex h-full items-start justify-between gap-4 transition-colors"
      >
        <div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
            {icon}
          </div>

          <h3 className="mt-4 text-[13px] font-medium text-[#171A18]">
            {title}
          </h3>

          <p className="mt-1 text-[11px] leading-relaxed text-[#6C716A]">
            {description}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#24493B]">
          {action}
          <ArrowRight
            size={11}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Card>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <div className="h-4 w-24 animate-pulse rounded bg-[#EEF0EB]" />
      <div className="mt-4 h-7 w-14 animate-pulse rounded bg-[#EEF0EB]" />
    </Card>
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
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
          <Layers size={18} />
        </div>

        <h1 className="mt-5 text-[19px] font-medium text-[#171A18]">
          Створи свій перший workspace
        </h1>

        <p className="mt-1.5 text-[13px] leading-relaxed text-[#6C716A]">
          Тут буде жити вся структура твоєї команди — модулі, записи та
          автоматизації.
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
            <div className="flex items-center gap-2 rounded-md border border-[#E9D8D5] bg-[#FBF7F6] px-3 py-2.5">
              <span className="text-[12px] text-[#B3261E]">
                {serverError}
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Створення...' : 'Створити workspace'}
          </Button>
        </form>
      </div>
    </div>
  )
}