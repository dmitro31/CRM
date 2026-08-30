import { Injectable } from '@nestjs/common';
import { AiService } from 'core/ai/ai.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';
import { ModuleService } from 'modules/metadata/module/module.service';
import { FieldService } from 'modules/metadata/field/field.service';

import { GenerateFormDto } from './dto/generate-form.dto';
import { CreateFormFromDraftDto } from './dto/create-form-from-draft.dto';

const FORM_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    fields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'TEXT',
              'TEXTAREA',
              'NUMBER',
              'BOOLEAN',
              'DATE',
              'DATETIME',
              'EMAIL',
              'PHONE',
              'URL',
              'SELECT',
              'MULTI_SELECT',
            ],
          },
          required: { type: 'boolean' },
          options: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['name', 'type'],
      },
    },
  },
  required: ['name', 'fields'],
};

interface FormDraft {
  name: string;
  fields: {
    name: string;
    type: string;
    required?: boolean;
    options?: string[];
  }[];
}

@Injectable()
export class AiFormService {
  constructor(
    private readonly ai: AiService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly moduleService: ModuleService,
    private readonly fieldService: FieldService,
  ) {}

  async generateDraft(
    workspaceId: string,
    userId: string,
    dto: GenerateFormDto,
  ) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    const prompt = `Ти — асистент, що проєктує структуру CRM-модуля.
Користувач описав, що йому треба: "${dto.prompt}".
Згенеруй назву модуля (українською) і список полів з типами.
Доступні типи полів: TEXT, TEXTAREA, NUMBER, BOOLEAN, DATE, DATETIME, EMAIL, PHONE, URL, SELECT, MULTI_SELECT.
Для SELECT і MULTI_SELECT обовʼязково додай масив "options" з варіантами.
Назви полів пиши українською, коротко і зрозуміло.`;

    return this.ai.generateJson<FormDraft>(prompt, FORM_SCHEMA);
  }

  async createFromDraft(
    workspaceId: string,
    userId: string,
    dto: CreateFormFromDraftDto,
  ) {
    const module = await this.moduleService.create(workspaceId, userId, {
      name: dto.name,
    });

    const createdFields: Awaited<ReturnType<FieldService['create']>>[] = [];

    for (const field of dto.fields) {
      const created = await this.fieldService.create(module.id, userId, {
        name: field.name,
        type: field.type,
        required: field.required,
        options: field.options,
      });

      createdFields.push(created);
    }

    return {
      module,
      fields: createdFields,
    };
  }
}
