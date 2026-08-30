import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WORKFLOWS_QUEUE } from 'core/queue/queue.module';

export interface WorkflowEventPayload {
  workspaceId: string;
  moduleId: string;
  recordId: string;
  event: 'RECORD_CREATED' | 'RECORD_UPDATED';
  previousData: Record<string, unknown> | null;
  currentData: Record<string, unknown>;
  triggeredByWorkflow?: boolean;
}

@Injectable()
export class WorkflowEventsService {
  constructor(
    @InjectQueue(WORKFLOWS_QUEUE)
    private readonly queue: Queue<WorkflowEventPayload>,
  ) {}

  async emit(payload: WorkflowEventPayload) {
    if (payload.triggeredByWorkflow) {
      return;
    }

    await this.queue.add('record-event', payload);
  }
}
