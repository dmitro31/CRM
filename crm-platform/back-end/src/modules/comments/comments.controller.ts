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

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsService } from './comments.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('records/:recordId/comments')
  create(
    @Param('recordId') recordId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(recordId, user.id, dto);
  }

  @Get('records/:recordId/comments')
  findAll(@Param('recordId') recordId: string, @CurrentUser() user: User) {
    return this.commentsService.findAll(recordId, user.id);
  }

  @Patch('comments/:id')
  update(
    @Param('id') commentId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(commentId, user.id, dto);
  }

  @Delete('comments/:id')
  remove(@Param('id') commentId: string, @CurrentUser() user: User) {
    return this.commentsService.remove(commentId, user.id);
  }
}