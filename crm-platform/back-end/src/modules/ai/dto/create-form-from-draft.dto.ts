import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { FieldType } from '@prisma/client'

class DraftFieldDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string

  @IsEnum(FieldType)
  type!: FieldType

  @IsOptional()
  @IsBoolean()
  required?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[]
}

export class CreateFormFromDraftDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DraftFieldDto)
  fields!: DraftFieldDto[]
}