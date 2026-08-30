import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum WorkflowEvent {
  RECORD_CREATED = 'RECORD_CREATED',
  RECORD_UPDATED = 'RECORD_UPDATED',
  FIELD_CHANGED = 'FIELD_CHANGED',
}

export class TriggerDto {
  @IsEnum(WorkflowEvent)
  event!: WorkflowEvent;

  @IsOptional()
  @IsString()
  fieldKey?: string;
}
