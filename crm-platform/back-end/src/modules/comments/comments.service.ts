import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ActivityType } from '@prisma/client'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'
import { ActivityService } from 'modules/activity/activity.service'
import { NotificationService } from 'modules/notifications/notification.service'

import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly activity: ActivityService,
    private readonly notifications: NotificationService,
  ) {}

  async create(recordId: string, userId: string, dto: CreateCommentDto) {
    const record = await this.findRecordOrThrow(recordId)

    await this.workspaceAccess.ensureModuleAccess(record.moduleId, userId)

    const comment = await this.prisma.comment.create({
      data: {
        recordId,
        authorId: userId,
        content: dto.content,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    const workspaceId = await this.resolveWorkspaceId(record.moduleId)

    await this.activity.log({
      type: ActivityType.COMMENT_ADDED,
      workspaceId,
      userId,
      recordId,
      data: { commentId: comment.id },
    })

    await this.notifyMentions(dto.content, workspaceId, userId, recordId, comment.id)

    return comment
  }

  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.findCommentOrThrow(commentId)

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments')
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
    })

    const record = await this.findRecordOrThrow(comment.recordId)
    const workspaceId = await this.resolveWorkspaceId(record.moduleId)

    await this.activity.log({
      type: ActivityType.COMMENT_UPDATED,
      workspaceId,
      userId,
      recordId: comment.recordId,
      data: { commentId },
    })

    await this.notifyMentions(dto.content, workspaceId, userId, comment.recordId, commentId)

    return updated
  }

  private async notifyMentions(
    content: string,
    workspaceId: string,
    authorId: string,
    recordId: string,
    commentId: string,
  ) {
    const mentionPattern = /@\[([^\]]+)\]\(([^)]+)\)/g
    const mentionedUserIds = new Set<string>()

    let match: RegExpExecArray | null
    while ((match = mentionPattern.exec(content)) !== null) {
      mentionedUserIds.add(match[2])
    }

    if (mentionedUserIds.size === 0) return

    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        userId: { in: Array.from(mentionedUserIds) },
      },
      select: { userId: true },
    })

    const author = await this.prisma.user.findUniqueOrThrow({
      where: { id: authorId },
      select: { firstName: true, lastName: true },
    })

    for (const member of members) {
      if (member.userId === authorId) continue

      await this.notifications.create({
        userId: member.userId,
        title: 'Тебе згадали в коментарі',
        message: `${author.firstName} ${author.lastName ?? ''} згадав тебе в коментарі`,
        type: 'INFO',
        link: `/records/${recordId}#comment-${commentId}`,
      })
    }
  }

  async findAll(recordId: string, userId: string) {
    const record = await this.findRecordOrThrow(recordId)

    await this.workspaceAccess.ensureModuleAccess(record.moduleId, userId)

    return this.prisma.comment.findMany({
      where: { recordId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.findCommentOrThrow(commentId)

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments')
    }

    await this.prisma.comment.delete({ where: { id: commentId } })

    const record = await this.findRecordOrThrow(comment.recordId)
    const workspaceId = await this.resolveWorkspaceId(record.moduleId)

    await this.activity.log({
      type: ActivityType.COMMENT_DELETED,
      workspaceId,
      userId,
      recordId: comment.recordId,
      data: { commentId },
    })

    return { message: 'Comment deleted successfully' }
  }

  private async findRecordOrThrow(recordId: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
      select: { id: true, moduleId: true },
    })

    if (!record) {
      throw new NotFoundException('Record not found')
    }

    return record
  }

  private async findCommentOrThrow(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    return comment
  }

  private async resolveWorkspaceId(moduleId: string) {
    const module = await this.prisma.module.findUniqueOrThrow({
      where: { id: moduleId },
      select: { workspaceId: true },
    })

    return module.workspaceId
  }
}