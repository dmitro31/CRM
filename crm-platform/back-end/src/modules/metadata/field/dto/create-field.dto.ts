import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { FieldType } from '@prisma/client';

export class CreateFieldDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEnum(FieldType)
  type!: FieldType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  unique?: boolean;

  @IsOptional()
  defaultValue?: unknown;
  @ValidateIf(
    (dto: CreateFieldDto) =>
      dto.type === FieldType.SELECT || dto.type === FieldType.MULTI_SELECT,
  )
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeholder?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
