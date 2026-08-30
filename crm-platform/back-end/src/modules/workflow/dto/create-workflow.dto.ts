import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ActionDto } from './action.dto';
import { ConditionDto } from './condition.dto';
import { TriggerDto } from './trigger.dto';

export class CreateWorkflowDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ValidateNested()
  @Type(() => TriggerDto)
  trigger!: TriggerDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions?: ConditionDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions!: ActionDto[];

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
