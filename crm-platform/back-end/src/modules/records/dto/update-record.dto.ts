import { IsObject, IsOptional } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
