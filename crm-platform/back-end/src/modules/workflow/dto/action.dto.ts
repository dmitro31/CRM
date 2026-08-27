import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export enum ActionType {
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  SEND_EMAIL = 'SEND_EMAIL',
  UPDATE_RECORD = 'UPDATE_RECORD',
}

export class ActionDto {
  @IsEnum(ActionType)
  type!: ActionType

  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  body?: string

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>
}