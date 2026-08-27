import { IsDefined, IsEnum, IsString } from 'class-validator'

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GT = 'gt',
  LT = 'lt',
}

export class ConditionDto {
  @IsString()
  fieldKey!: string

  @IsEnum(ConditionOperator)
  operator!: ConditionOperator

  @IsDefined()
  value: unknown
}