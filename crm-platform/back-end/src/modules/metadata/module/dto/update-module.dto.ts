import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsInt()
  order?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}