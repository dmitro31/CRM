import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from 'core/database/prisma.service'
import { MailService } from 'modules/mail/mail.service'
import { WORKFLOWS_QUEUE } from 'core/queue/queue.module'

import { ConditionOperator } from './dto/condition.dto'
import { ActionType } from './dto/action.dto'
import { WorkflowEvent } from './dto/trigger.dto'
import { WorkflowEventPayload } from './workflow-events.service'

@Processor(WORKFLOWS_QUEUE)
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {
    super()
  }

  async process(job: Job<WorkflowEventPayload>) {
    const {
      workspaceId,
      moduleId,
      recordId,
      event,
      previousData,
      currentData,
    } = job.data

    const workflows = await this.prisma.workflow.findMany({
      where: { workspaceId, enabled: true },
    })

    for (const workflow of workflows) {
      const trigger = workflow.trigger as any

      const matchesEvent = this.matchesTrigger(
        trigger,
        event,
        previousData,
        currentData,
      )

      if (!matchesEvent) {
        continue
      }

      const conditions = (workflow.conditions as any[]) ?? []

      const conditionsPass = conditions.every(condition =>
        this.evaluateCondition(condition, currentData),
      )

      if (!conditionsPass) {
        continue
      }

      const actions = (workflow.actions as any[]) ?? []

      for (const action of actions) {
        try {
          await this.executeAction(action, {
            workspaceId,
            moduleId,
            recordId,
            currentData,
          })
        } catch (error) {
          this.logger.error(
            `Failed to execute action "${action.type}" for workflow "${workflow.id}"`,
            error instanceof Error ? error.stack : undefined,
          )
        }
      }
    }
  }

  private matchesTrigger(
    trigger: any,
    event: WorkflowEventPayload['event'],
    previousData: Record<string, unknown> | null,
    currentData: Record<string, unknown>,
  ): boolean {
    if (trigger.event === WorkflowEvent.RECORD_CREATED) {
      return event === 'RECORD_CREATED'
    }

    if (trigger.event === WorkflowEvent.RECORD_UPDATED) {
      return event === 'RECORD_UPDATED'
    }

    if (trigger.event === WorkflowEvent.FIELD_CHANGED) {
      if (event !== 'RECORD_UPDATED' || !previousData) {
        return false
      }

      const fieldKey = trigger.fieldKey

      if (!fieldKey) {
        return false
      }

      return (
        previousData[fieldKey] !== currentData[fieldKey]
      )
    }

    return false
  }

  private evaluateCondition(
    condition: {
      fieldKey: string
      operator: ConditionOperator
      value: unknown
    },
    data: Record<string, unknown>,
  ): boolean {
    const actual = data[condition.fieldKey]

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return actual === condition.value
      case ConditionOperator.NOT_EQUALS:
        return actual !== condition.value
      case ConditionOperator.GT:
        return (
          typeof actual === 'number' &&
          typeof condition.value === 'number' &&
          actual > condition.value
        )
      case ConditionOperator.LT:
        return (
          typeof actual === 'number' &&
          typeof condition.value === 'number' &&
          actual < condition.value
        )
      default:
        return false
    }
  }

  private async executeAction(
    action: any,
    context: {
      workspaceId: string
      moduleId: string
      recordId: string
      currentData: Record<string, unknown>
    },
  ) {
    if (action.type === ActionType.SEND_NOTIFICATION) {
      await this.sendNotification(context.workspaceId, action)
      return
    }

    if (action.type === ActionType.SEND_EMAIL) {
      await this.sendEmail(context.workspaceId, action)
      return
    }

    if (action.type === ActionType.UPDATE_RECORD) {
      await this.prisma.record.update({
        where: { id: context.recordId },
        data: {
          data: {
            ...context.currentData,
            ...action.data,
          } as any,
        },
      })
    }
  }

  private async sendNotification(
    workspaceId: string,
    action: { title?: string; message?: string },
  ) {
    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { ownerId: true },
    })

    await this.prisma.notification.create({
      data: {
        userId: workspace.ownerId,
        title: action.title ?? 'Workflow notification',
        message: action.message ?? '',
        type: 'INFO',
      },
    })
  }

  private async sendEmail(
    workspaceId: string,
    action: { subject?: string; body?: string },
  ) {
    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      include: {
        owner: { select: { email: true, firstName: true } },
      },
    })

    await this.mail.sendWorkflowEmail(
      workspace.owner.email,
      action.subject ?? 'Workflow triggered',
      action.body ?? '',
    )
  }
}