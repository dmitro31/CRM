import { randomUUID } from 'crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'core/database/prisma.service';
import { StorageService } from 'core/storage/storage.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}
  async upload(workspaceId: string, userId: string, file: Express.Multer.File) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed`,
      );
    }

    const extension = file.originalname.split('.').pop() ?? '';
    const key = `${workspaceId}/${randomUUID()}.${extension}`;

    await this.storage.upload(key, file.buffer, file.mimetype);

    return this.prisma.file.create({
      data: {
        name: key,
        originalName: file.originalname,
        path: key,
        extension,
        mimeType: file.mimetype,
        size: file.size,
        uploadedById: userId,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string, userId: string) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    return this.prisma.file.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDownloadUrl(fileId: string, userId: string) {
    const file = await this.findFileOrThrow(fileId);

    await this.workspaceAccess.ensureMembership(file.workspaceId, userId);

    const url = await this.storage.getPresignedUrl(file.path);

    return {
      url,
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  async remove(fileId: string, userId: string) {
    const file = await this.findFileOrThrow(fileId);

    await this.workspaceAccess.ensureMembership(file.workspaceId, userId);

    await this.storage.delete(file.path);

    await this.prisma.file.delete({
      where: { id: fileId },
    });

    return { message: 'File deleted successfully' };
  }

  private async findFileOrThrow(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }
}
