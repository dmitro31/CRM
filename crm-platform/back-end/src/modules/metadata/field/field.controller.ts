import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { FieldService } from './field.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Post('modules/:moduleId/fields')
  create(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateFieldDto,
  ) {
    return this.fieldService.create(moduleId, user.id, dto);
  }

  @Get('modules/:moduleId/fields')
  findAll(@Param('moduleId') moduleId: string, @CurrentUser() user: User) {
    return this.fieldService.findAll(moduleId, user.id);
  }

  @Patch('fields/:id')
  update(
    @Param('id') fieldId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateFieldDto,
  ) {
    return this.fieldService.update(fieldId, user.id, dto);
  }

  @Delete('fields/:id')
  remove(@Param('id') fieldId: string, @CurrentUser() user: User) {
    return this.fieldService.remove(fieldId, user.id);
  }
}
