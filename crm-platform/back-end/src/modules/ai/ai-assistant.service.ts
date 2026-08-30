import { Injectable } from '@nestjs/common';
import { AiService } from 'core/ai/ai.service';
import { PrismaService } from 'core/database/prisma.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';
import { RecordService } from 'modules/records/record.service';

import { AskAssistantDto } from './dto/ask-assistant.dto';

const TOOLS = [
  {
    name: 'list_modules',
    description:
      'Повертає список усіх модулів (типів даних) у цьому workspace разом з їхніми полями.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_records',
    description:
      'Шукає записи в конкретному модулі за фільтрами. Фільтри — це пари ключ поля/значення.',
    parameters: {
      type: 'object',
      properties: {
        module_name: { type: 'string' },
        filters: { type: 'object' },
        limit: { type: 'number' },
      },
      required: ['module_name'],
    },
  },
  {
    name: 'count_records',
    description: 'Рахує кількість записів у модулі за фільтрами.',
    parameters: {
      type: 'object',
      properties: {
        module_name: { type: 'string' },
        filters: { type: 'object' },
      },
      required: ['module_name'],
    },
  },
];

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly recordService: RecordService,
  ) {}

  async ask(workspaceId: string, userId: string, dto: AskAssistantDto) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    const prompt = `Ти — асистент CRM-системи. Відповідай на питання користувача коротко і по суті, українською мовою.
Використовуй інструменти, щоб отримати реальні дані перед відповіддю — ніколи не вигадуй цифри чи факти.
Якщо інструмент повернув 0 результатів — це валідна відповідь, одразу повідом про це користувачу, не перевіряй те саме повторно і не досліджуй інші модулі без потреби.

Питання користувача: "${dto.question}"`;
    const answer = await this.ai.chatWithTools(
      prompt,
      TOOLS,
      (name: string, args: Record<string, unknown>) =>
        this.executeTool(workspaceId, userId, name, args),
    );

    return { answer };
  }

  private async executeTool(
    workspaceId: string,
    userId: string,
    name: string,
    args: Record<string, unknown>,
  ) {
    if (name === 'list_modules') {
      return this.listModules(workspaceId);
    }

    if (name === 'search_records') {
      return this.searchRecords(
        workspaceId,
        userId,
        args as {
          module_name: string;
          filters?: Record<string, string>;
          limit?: number;
        },
      );
    }

    if (name === 'count_records') {
      return this.countRecords(
        workspaceId,
        userId,
        args as { module_name: string; filters?: Record<string, string> },
      );
    }

    return { error: `Unknown tool "${name}"` };
  }

  private async listModules(workspaceId: string) {
    const modules = await this.prisma.module.findMany({
      where: { workspaceId, isActive: true },
      include: {
        fields: {
          where: { isActive: true },
          select: { key: true, name: true, type: true },
        },
      },
    });

    return modules.map((module) => ({
      name: module.name,
      fields: module.fields,
    }));
  }

  private async resolveModule(workspaceId: string, moduleName: string) {
    return this.prisma.module.findFirst({
      where: {
        workspaceId,
        isActive: true,
        name: { equals: moduleName, mode: 'insensitive' },
      },
    });
  }

  private async searchRecords(
    workspaceId: string,
    userId: string,
    args: {
      module_name: string;
      filters?: Record<string, string>;
      limit?: number;
    },
  ) {
    const module = await this.resolveModule(workspaceId, args.module_name);

    if (!module) {
      return { error: `Module "${args.module_name}" not found` };
    }

    try {
      const query: Record<string, string> = {
        ...(args.filters ?? {}),
        limit: String(Math.min(args.limit ?? 10, 20)),
      };

      const result = await this.recordService.findAll(module.id, userId, query);

      return {
        total: result.total,
        items: result.items.map((item) => item.data),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  private async countRecords(
    workspaceId: string,
    userId: string,
    args: { module_name: string; filters?: Record<string, string> },
  ) {
    const result = await this.searchRecords(workspaceId, userId, {
      ...args,
      limit: 1,
    });

    if ('error' in result) {
      return result;
    }

    return { count: result.total };
  }
}
