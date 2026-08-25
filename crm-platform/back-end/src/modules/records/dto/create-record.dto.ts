import { IsObject } from 'class-validator'

export class CreateRecordDto {
  @IsObject()
  data!: Record<string, unknown>
}