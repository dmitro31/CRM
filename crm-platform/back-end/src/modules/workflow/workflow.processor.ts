import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'core/database/prisma.service';
import { MailService } from 'modules/mail/mail.service';
import { WORKFLOWS_QUEUE } from 'core/queue/queue.module';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

import { ActionType } from './dto/action.dto';
import { ConditionOperator } from './dto/condition.dto';
import { WorkflowEventPayload } from './workflow-events.service';
import { WorkflowEvaluator } from './workflow-evaluator';

interface StoredTrigger {
  event: string;
  fieldKey?: string;
}

interface StoredCondition {
  fieldKey: string;
  operator: ConditionOperator;
  value: unknown;
}

interface StoredAction {
  type: ActionType;
  title?: string;
  message?: string;
  subject?: string;
  body?: string;
  data?: Record<string, unknown>;
}

@Processor(WORKFLOWS_QUEUE)
export class WorkflowProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    @InjectPinoLogger(WorkflowProcessor.name)
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  async process(job: Job<WorkflowEventPayload>) {
    const {
      workspaceId,
      moduleId,
      recordId,
      event,
      previousData,
      currentData,
    } = job.data;

    const workflows = await this.prisma.workflow.findMany({
      where: { workspaceId, enabled: true },
    });

    for (const workflow of workflows) {
      const trigger = workflow.trigger as unknown as StoredTrigger;

      const matchesEvent = WorkflowEvaluator.matchesTrigger(
        trigger,
        event,
        previousData,
        currentData,
      );

      if (!matchesEvent) {
        continue;
      }

      const conditions =
        (workflow.conditions as unknown as StoredCondition[] | null) ?? [];

      const conditionsPass = conditions.every((condition) =>
        WorkflowEvaluator.evaluateCondition(condition, currentData),
      );

      if (!conditionsPass) {
        continue;
      }

      const actions = (workflow.actions as unknown as StoredAction[]) ?? [];

      for (const action of actions) {
        try {
          await this.executeAction(action, {
            workspaceId,
            moduleId,
            recordId,
            currentData,
          });
        } catch (error: unknown) {
          this.logger.error(
            {
              err: error instanceof Error ? error : new Error(String(error)),
              workflowId: workflow.id,
              actionType: action.type,
            },
            `Failed to execute action "${action.type}" for workflow "${workflow.id}"`,
          );
        }
      }
    }
  }

  private async executeAction(
    action: StoredAction,
    context: {
      workspaceId: string;
      moduleId: string;
      recordId: string;
      currentData: Record<string, unknown>;
    },
  ) {
    if (action.type === ActionType.SEND_NOTIFICATION) {
      await this.sendNotification(context.workspaceId, action);
      return;
    }

    if (action.type === ActionType.SEND_EMAIL) {
      await this.sendEmail(context.workspaceId, action);
      return;
    }

    if (action.type === ActionType.UPDATE_RECORD) {
      await this.prisma.record.update({
        where: { id: context.recordId },
        data: {
          data: {
            ...context.currentData,
            ...action.data,
          } as Prisma.InputJsonValue,
        },
      });
    }
  }

  private async sendNotification(
    workspaceId: string,
    action: { title?: string; message?: string },
  ) {
    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: workspace.ownerId,
        title: action.title ?? 'Workflow notification',
        message: action.message ?? '',
        type: 'INFO',
      },
    });
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
    });

    await this.mail.sendWorkflowEmail(
      workspace.owner.email,
      action.subject ?? 'Workflow triggered',
      action.body ?? '',
    );
  }
}
