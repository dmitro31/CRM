import { IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateFormDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  prompt!: string;
}
