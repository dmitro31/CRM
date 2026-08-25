import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateViewDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  sorting?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  columns?: Record<string, unknown>

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}