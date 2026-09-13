import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  question!: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}