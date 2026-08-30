import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { FilesService } from './files.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('workspaces/:workspaceId/files')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.upload(workspaceId, user.id, file);
  }

  @Get('workspaces/:workspaceId/files')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.filesService.findAll(workspaceId, user.id);
  }

  @Get('files/:id/download')
  getDownloadUrl(@Param('id') fileId: string, @CurrentUser() user: User) {
    return this.filesService.getDownloadUrl(fileId, user.id);
  }

  @Delete('files/:id')
  remove(@Param('id') fileId: string, @CurrentUser() user: User) {
    return this.filesService.remove(fileId, user.id);
  }
}
