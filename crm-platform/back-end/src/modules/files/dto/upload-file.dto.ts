import { IsOptional, IsUUID } from 'class-validator';

export class ListFilesDto {
  @IsOptional()
  @IsUUID()
  moduleId?: string;
}
