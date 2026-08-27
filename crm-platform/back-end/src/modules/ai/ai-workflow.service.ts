import {
  BadRequestException,
  Injectable,
} from '@nestjs/common'
import { FieldType } from '@prisma/client'
import { AiService } from 'core/ai/ai.service'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

import { GenerateWorkflowDto } from './dto/generate-workflow.dto'

const WORKFLOW_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    trigger: {
      type: 'object',
      properties: {
        event: {
          type: 'string',
          enum: ['RECORD_CREATED', 'RECORD_UPDATED', 'FIELD_CHANGED'],
        },
        fieldKey: { type: 'string' },
      },
      required: ['event'],
    },
    conditions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fieldKey: { type: 'string' },
          operator: {
            type: 'string',
            enum: ['equals', 'not_equals', 'gt', 'lt'],
          },
          value: { type: 'string' },
        },
        required: ['fieldKey', 'operator', 'value'],
      },
    },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['SEND_NOTIFICATION', 'SEND_EMAIL', 'UPDATE_RECORD'],
          },
          title: { type: 'string' },
          message: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
          updateData: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fieldKey: { type: 'string' },
                value: { type: 'string' },
              },
              required: ['fieldKey', 'value'],
            },
          },
        },
        required: ['type'],
      },
    },
  },
  required: ['name', 'trigger', 'actions'],
}

interface WorkflowDraft {
  name: string
  trigger: { event: string; fieldKey?: string }
  conditions?: { fieldKey: string; operator: string; value: string }[]
  actions: {
    type: string
    title?: string
    message?: string
    subject?: string
    body?: string
    updateData?: { fieldKey: string; value: string }[]
  }[]
}

@Injectable()
export class AiWorkflowService {
  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async generateDraft(
    workspaceId: string,
    moduleId: string,
    userId: string,
    dto: GenerateWorkflowDto,
  ) {
    const module = await this.workspaceAccess.ensureModuleAccess(
      moduleId,
      userId,
    )

    if (module.workspaceId !== workspaceId) {
      throw new BadRequestException(
        'Module does not belong to this workspace',
      )
    }

    const fields = await this.prisma.field.findMany({
      where: { moduleId, isActive: true },
    })

    const fieldsDescription = fields
      .map(field => {
        const optionsText = field.options
          ? ` (варіанти: ${(field.options as string[]).join(', ')})`
          : ''
        return `- ${field.key} (назва: "${field.name}", тип: ${field.type})${optionsText}`
      })
      .join('\n')

    const prompt = `Ти — асистент, що налаштовує автоматизацію (workflow) для CRM.
Користувач описав, яку автоматизацію хоче: "${dto.prompt}".

Доступні поля цього модуля (використовуй ЛИШЕ ці ключі "fieldKey", нічого не вигадуй):
${fieldsDescription}

Типи trigger.event: RECORD_CREATED, RECORD_UPDATED, FIELD_CHANGED (для FIELD_CHANGED обовʼязково вкажи fieldKey з переліку вище).
Оператори умов: equals, not_equals, gt, lt.
Типи дій (actions): SEND_NOTIFICATION (title, message), SEND_EMAIL (subject, body), UPDATE_RECORD (updateData — масив {fieldKey, value}, fieldKey теж лише з переліку вище).
Значення умов і updateData передавай як прості рядки, навіть якщо поле числове чи булеве.
Назви (name, title, message, subject, body) пиши українською.`

    const draft = await this.ai.generateJson<WorkflowDraft>(
      prompt,
      WORKFLOW_SCHEMA,
    )

    return this.validateAndCast(draft, fields)
  }

  private validateAndCast(
    draft: WorkflowDraft,
    fields: { key: string; type: FieldType }[],
  ) {
    const fieldKeys = new Set(fields.map(f => f.key))

    if (
      draft.trigger.event === 'FIELD_CHANGED' &&
      (!draft.trigger.fieldKey || !fieldKeys.has(draft.trigger.fieldKey))
    ) {
      throw new BadRequestException(
        'AI generated a trigger with an unknown or missing fieldKey, try rephrasing the prompt',
      )
    }

    const conditions = (draft.conditions ?? []).map(condition => {
      if (!fieldKeys.has(condition.fieldKey)) {
        throw new BadRequestException(
          `AI generated a condition referencing unknown field "${condition.fieldKey}", try rephrasing the prompt`,
        )
      }

      const field = fields.find(f => f.key === condition.fieldKey)!

      return {
        fieldKey: condition.fieldKey,
        operator: condition.operator,
        value: this.castValue(field.type, condition.value),
      }
    })

    const actions = draft.actions.map(action => {
      if (action.type === 'UPDATE_RECORD') {
        const data: Record<string, unknown> = {}

        for (const entry of action.updateData ?? []) {
          if (!fieldKeys.has(entry.fieldKey)) {
            throw new BadRequestException(
              `AI generated an action referencing unknown field "${entry.fieldKey}", try rephrasing the prompt`,
            )
          }

          const field = fields.find(f => f.key === entry.fieldKey)!
          data[entry.fieldKey] = this.castValue(field.type, entry.value)
        }

        return { type: action.type, data }
      }

      return {
        type: action.type,
        title: action.title,
        message: action.message,
        subject: action.subject,
        body: action.body,
      }
    })

    return {
      name: draft.name,
      trigger: draft.trigger,
      conditions,
      actions,
      enabled: true,
    }
  }

  private castValue(type: FieldType, rawValue: string): unknown {
    if (type === FieldType.NUMBER) {
      const value = Number(rawValue)
      return Number.isNaN(value) ? rawValue : value
    }

    if (type === FieldType.BOOLEAN) {
      if (rawValue === 'true') return true
      if (rawValue === 'false') return false
    }

    return rawValue
  }
}