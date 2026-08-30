import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordService } from './record.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post('modules/:moduleId/records')
  create(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateRecordDto,
  ) {
    return this.recordService.create(moduleId, user.id, dto);
  }

  @Get('modules/:moduleId/records')
  findAll(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
    @Query() query: Record<string, string>,
  ) {
    return this.recordService.findAll(moduleId, user.id, query);
  }

  @Get('records/:id')
  findOne(@Param('id') recordId: string, @CurrentUser() user: User) {
    return this.recordService.findOne(recordId, user.id);
  }

  @Patch('records/:id')
  update(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateRecordDto,
  ) {
    return this.recordService.update(recordId, user.id, dto);
  }

  @Delete('records/:id')
  remove(@Param('id') recordId: string, @CurrentUser() user: User) {
    return this.recordService.remove(recordId, user.id);
  }
}
