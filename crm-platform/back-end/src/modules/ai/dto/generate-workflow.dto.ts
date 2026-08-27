import { IsString, MaxLength, MinLength } from 'class-validator'

export class GenerateWorkflowDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  prompt!: string
}