import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateFieldDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsBoolean()
  required?: boolean

  @IsOptional()
  @IsBoolean()
  unique?: boolean

  @IsOptional()
  defaultValue?: unknown

  @IsOptional()
  @IsArray()
  options?: string[]

  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeholder?: string

  @IsOptional()
  @IsInt()
  order?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}